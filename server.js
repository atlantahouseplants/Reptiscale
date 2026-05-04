require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const { parsePipelineChangeEvent, parseNewContactEvent, parseFormSubmissionEvent } = require('./ghl/webhooks');
const { createContact, updateContact, addTag, searchContacts } = require('./ghl/contacts');
const { sendSMS } = require('./ghl/conversations');
const { evaluateShipment } = require('./agents/shipping-agent/index');
const { getBreederByLocationId, getAllBreeders, getBreeder } = require('./ghl/multi-tenant');

const app = express();
const PORT = process.env.PORT || 3000;
const LOG_FILE = path.join(__dirname, 'logs', 'webhooks.log');

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  if (req.path.startsWith('/webhooks') || req.path.startsWith('/api')) {
    log('REQUEST', `${req.method} ${req.path}`, req.body);
  }
  next();
});

// ─── Logging ─────────────────────────────────────────────────────────────────

function ensureLogDir() {
  const logDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
}

function log(type, message, data = null) {
  ensureLogDir();
  const ts = new Date().toISOString();
  const line = JSON.stringify({ ts, type, message, ...(data ? { data } : {}) });
  fs.appendFileSync(LOG_FILE, line + '\n');
  const label = { REQUEST: '→', SUCCESS: '✅', ERROR: '❌', INFO: 'ℹ️ ', WARN: '⚠️ ' }[type] || '·';
  console.log(`[${ts.slice(11, 19)}] ${label} ${message}`);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ok(res, data = {}) {
  res.json({ success: true, ...data });
}

function fail(res, status, message, err = null) {
  if (err) log('ERROR', message, { error: err.response?.data?.message || err.message });
  res.status(status).json({ success: false, message });
}

/**
 * Resolve breeder context from an incoming webhook payload.
 * Returns { breeder, ghlConfig, clientConfig } or null if unknown.
 */
function resolveBreeder(payload) {
  const locationId = payload.location_id || payload.locationId;
  if (locationId) {
    const breeder = getBreederByLocationId(locationId);
    if (breeder) return breeder;
  }
  // Fallback: return the first registered breeder (single-tenant compat)
  const all = getAllBreeders();
  return all.length > 0 ? all[0] : null;
}

/**
 * Get a custom field ID from a breeder's config.
 */
function getFieldId(breederCtx, key) {
  return breederCtx?.ghlConfig?.customFields?.[key]?.id || null;
}

function buildCustomField(breederCtx, key, value) {
  const id = getFieldId(breederCtx, key);
  if (!id || value === undefined || value === null) return null;
  return { id, value: String(value) };
}

function buildCustomFields(breederCtx, obj) {
  return Object.entries(obj)
    .map(([k, v]) => buildCustomField(breederCtx, k, v))
    .filter(Boolean);
}

// ─── Pipeline-Aware Stage Routing ────────────────────────────────────────────
//
// GHL sends stage NAME in webhook payloads. Since multiple pipelines can have
// the same stage name (e.g. "Delivered" exists in both Sales and Shipping),
// we key handlers by pipeline key + stage name.

const PIPELINE_STAGE_ACTIONS = {
  // ── Sales Pipeline ──────────────────────────────────────────────────────
  sales_pipeline: {
    'invoice sent':       handleInvoiceSent,
    'payment received':   handlePaymentReceived,
    'shipping scheduled': handleShippingScheduled,
    'shipped':            handleSalesShipped,
    'delivered':          handleSalesDelivered,
    'follow-up complete': handleFollowUpComplete,
  },
  // ── Shipping Pipeline ───────────────────────────────────────────────────
  shipping_pipeline: {
    'pending review':     handlePendingReview,
    'approved to ship':   handleApprovedToShip,
    'label created':      handleLabelCreated,
    'dropped off':        handleDroppedOff,
    'in transit':         handleInTransit,
    'delivered':          handleShippingDelivered,
    'lag confirmed':      handleLAGConfirmed,
  },
  // ── Lead Pipeline ───────────────────────────────────────────────────────
  lead_pipeline: {
    'qualified':          handleLeadQualified,
  },
};

// ─── Sales Pipeline Handlers ─────────────────────────────────────────────────

async function handleInvoiceSent(event, breederCtx) {
  log('INFO', `Invoice Sent for contact ${event.contactId}`);
  try {
    const ownerName = breederCtx.clientConfig.ownerFirstName || breederCtx.clientConfig.ownerName?.split(' ')[0] || 'your breeder';
    const businessName = breederCtx.clientConfig.businessName || 'HatchKit';
    const sms = `Hey! ${ownerName} from ${businessName} just sent you an invoice. Check your email for the payment link. If you have any questions, just reply here!`;
    await sendSMS(event.contactId, sms);
    log('SUCCESS', `Invoice notification SMS sent to ${event.contactId}`);
    return { sent: true };
  } catch (err) {
    log('WARN', `handleInvoiceSent SMS failed for ${event.contactId}`, { error: err.message });
    return { sent: false };
  }
}

async function handlePaymentReceived(event, breederCtx) {
  log('INFO', `Payment Received — evaluating shipment for contact ${event.contactId}`);

  try {
    const ghlClient = require('./ghl/client');
    const contactData = await ghlClient.get(`/contacts/${event.contactId}`);
    const contact = contactData.contact || contactData;

    const getField = (key) => {
      const fieldId = getFieldId(breederCtx, key);
      if (!fieldId) return null;
      return (contact.customFields || []).find(f => f.id === fieldId)?.value || null;
    };

    const speciesRaw = getField('species_interest');
    const species = speciesRaw
      ? speciesRaw.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      : 'leopard_gecko';

    const originZip = breederCtx.clientConfig.breederZip || process.env.BREEDER_ZIP || '27601';
    const destinationZip = contact.postalCode || contact.address?.postalCode || null;

    if (!destinationZip) {
      log('WARN', `No destination zip for contact ${event.contactId} — shipping agent skipped`);
      return { skipped: true, reason: 'No destination zip on contact record' };
    }

    const result = await evaluateShipment({
      contactId: event.contactId,
      species,
      originZip,
      destinationZip,
      updateGHL: true,
    });

    log('SUCCESS', `Shipping decision for ${event.contactId}: ${result.decision} — ${result.recommendedShipDate || 'HOLD'}`);

    if (contact.phone) {
      const sms = result.customerMessage.slice(0, 300);
      await sendSMS(event.contactId, sms);
      log('SUCCESS', `Shipping decision SMS sent to ${event.contactId}`);
    }

    return result;
  } catch (err) {
    log('ERROR', `handlePaymentReceived failed for ${event.contactId}`, { error: err.message });
    throw err;
  }
}

async function handleShippingScheduled(event, breederCtx) {
  log('INFO', `Shipping Scheduled for contact ${event.contactId}`);
  try {
    const customFields = buildCustomFields(breederCtx, { shipping_status: 'Pending Weather Check' });
    if (customFields.length > 0) {
      await updateContact(event.contactId, { customFields });
    }
    await addTag(event.contactId, ['shipping:pending-weather-check']);

    const businessName = breederCtx.clientConfig.businessName || 'HatchKit';
    const sms = `Hey! ${businessName} is checking weather conditions for your shipment. We'll confirm your ship date soon — safety first!`;
    await sendSMS(event.contactId, sms);
    log('SUCCESS', `Shipping scheduled notification sent to ${event.contactId}`);
    return { notified: true };
  } catch (err) {
    log('WARN', `handleShippingScheduled failed for ${event.contactId}`, { error: err.message });
    return { notified: false };
  }
}

async function handleSalesShipped(event, breederCtx) {
  log('INFO', `Shipped — updating status for contact ${event.contactId}`);
  try {
    const customFields = buildCustomFields(breederCtx, { shipping_status: 'In Transit' });
    if (customFields.length > 0) {
      await updateContact(event.contactId, { customFields });
    }
    return { updated: true };
  } catch (err) {
    log('WARN', `handleSalesShipped failed for ${event.contactId}`, { error: err.message });
    return { updated: false };
  }
}

async function handleSalesDelivered(event, breederCtx) {
  log('INFO', `Sales Delivered — triggering post-delivery follow-up for contact ${event.contactId}`);

  try {
    const customFields = buildCustomFields(breederCtx, { shipping_status: 'Delivered' });
    if (customFields.length > 0) {
      await updateContact(event.contactId, { customFields });
    }

    const ownerName = breederCtx.clientConfig.ownerFirstName || breederCtx.clientConfig.ownerName?.split(' ')[0] || 'your breeder';
    const businessName = breederCtx.clientConfig.businessName || 'HatchKit';
    const sms = `Hey! Tracking shows your animal arrived. How are they settling in? Give them a day or two to decompress before handling. Reply anytime with questions! — ${ownerName} @ ${businessName}`;
    await sendSMS(event.contactId, sms);

    log('SUCCESS', `Delivery follow-up sent to ${event.contactId}`);
    return { sent: true };
  } catch (err) {
    log('ERROR', `handleSalesDelivered failed for ${event.contactId}`, { error: err.message });
    throw err;
  }
}

async function handleFollowUpComplete(event, _breederCtx) {
  log('INFO', `Follow-Up Complete for contact ${event.contactId} — adding repeat-buyer tag`);
  try {
    await addTag(event.contactId, ['repeat-buyer-candidate', 'follow-up:complete']);
    return { tagged: true };
  } catch (err) {
    log('WARN', `handleFollowUpComplete tag failed for ${event.contactId}`, { error: err.message });
    return { tagged: false };
  }
}

// ─── Shipping Pipeline Handlers ──────────────────────────────────────────────

async function handlePendingReview(event, breederCtx) {
  log('INFO', `Pending Review — auto-evaluating shipment for contact ${event.contactId}`);
  return handlePaymentReceived(event, breederCtx);
}

async function handleApprovedToShip(event, breederCtx) {
  log('INFO', `Approved to Ship for contact ${event.contactId}`);
  try {
    const customFields = buildCustomFields(breederCtx, { shipping_status: 'Approved to Ship' });
    if (customFields.length > 0) {
      await updateContact(event.contactId, { customFields });
    }

    const businessName = breederCtx.clientConfig.businessName || 'HatchKit';
    const sms = `Great news! Weather looks good and your shipment from ${businessName} has been approved! We're preparing your animal for shipping now. You'll get tracking info soon.`;
    await sendSMS(event.contactId, sms);
    log('SUCCESS', `Approved to ship notification sent to ${event.contactId}`);
    return { notified: true };
  } catch (err) {
    log('WARN', `handleApprovedToShip failed for ${event.contactId}`, { error: err.message });
    return { notified: false };
  }
}

async function handleLabelCreated(event, breederCtx) {
  log('INFO', `Label Created for contact ${event.contactId}`);
  try {
    const customFields = buildCustomFields(breederCtx, { shipping_status: 'Label Created' });
    if (customFields.length > 0) {
      await updateContact(event.contactId, { customFields });
    }

    const businessName = breederCtx.clientConfig.businessName || 'HatchKit';
    const sms = `Your shipping label is ready! ${businessName} is packaging your animal with care. We'll text you the tracking number once it's dropped off.`;
    await sendSMS(event.contactId, sms);
    return { notified: true };
  } catch (err) {
    log('WARN', `handleLabelCreated failed for ${event.contactId}`, { error: err.message });
    return { notified: false };
  }
}

async function handleDroppedOff(event, breederCtx) {
  log('INFO', `Dropped Off for contact ${event.contactId}`);
  try {
    const customFields = buildCustomFields(breederCtx, { shipping_status: 'In Transit' });
    if (customFields.length > 0) {
      await updateContact(event.contactId, { customFields });
    }

    const businessName = breederCtx.clientConfig.businessName || 'HatchKit';
    const sms = `Your animal from ${businessName} has been shipped! It's on its way to you via overnight delivery. We'll text you when it's out for delivery.`;
    await sendSMS(event.contactId, sms);
    log('SUCCESS', `Dropped off notification sent to ${event.contactId}`);
    return { notified: true };
  } catch (err) {
    log('WARN', `handleDroppedOff failed for ${event.contactId}`, { error: err.message });
    return { notified: false };
  }
}

async function handleInTransit(event, _breederCtx) {
  log('INFO', `In Transit for contact ${event.contactId} — acknowledged`);
  return { acknowledged: true };
}

async function handleShippingDelivered(event, breederCtx) {
  log('INFO', `Shipping Pipeline Delivered for contact ${event.contactId}`);
  try {
    const customFields = buildCustomFields(breederCtx, { shipping_status: 'Delivered' });
    if (customFields.length > 0) {
      await updateContact(event.contactId, { customFields });
    }

    const ownerName = breederCtx.clientConfig.ownerFirstName || breederCtx.clientConfig.ownerName?.split(' ')[0] || 'your breeder';
    const businessName = breederCtx.clientConfig.businessName || 'HatchKit';
    const sms = `Your animal has been delivered! Please confirm safe arrival when you can. Give them time to settle in before handling. Questions? Just reply! — ${ownerName} @ ${businessName}`;
    await sendSMS(event.contactId, sms);
    return { notified: true };
  } catch (err) {
    log('WARN', `handleShippingDelivered failed for ${event.contactId}`, { error: err.message });
    return { notified: false };
  }
}

async function handleLAGConfirmed(event, breederCtx) {
  log('INFO', `LAG Confirmed — triggering review request for contact ${event.contactId}`);

  try {
    const customFields = buildCustomFields(breederCtx, { shipping_status: 'LAG Confirmed' });
    if (customFields.length > 0) {
      await updateContact(event.contactId, { customFields });
    }

    const ownerName = breederCtx.clientConfig.ownerFirstName || breederCtx.clientConfig.ownerName?.split(' ')[0] || 'your breeder';
    const businessName = breederCtx.clientConfig.businessName || 'HatchKit';
    const sms = `So glad your animal arrived safely! If you have a minute, a quick Google review would mean the world to a small breeder like me. Thanks for your trust! — ${ownerName} @ ${businessName}`;
    await sendSMS(event.contactId, sms);

    log('SUCCESS', `Review request sent to ${event.contactId}`);
    return { sent: true };
  } catch (err) {
    log('ERROR', `handleLAGConfirmed failed for ${event.contactId}`, { error: err.message });
    throw err;
  }
}

// ─── Lead Pipeline Handlers ──────────────────────────────────────────────────

async function handleLeadQualified(event, _breederCtx) {
  log('INFO', `Lead Qualified for contact ${event.contactId}`);
  try {
    await addTag(event.contactId, ['status:hot-lead']);
    log('SUCCESS', `Tagged ${event.contactId} as hot lead`);
    return { tagged: true };
  } catch (err) {
    log('WARN', `handleLeadQualified tag failed for ${event.contactId}`, { error: err.message });
    return { tagged: false };
  }
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get('/', (req, res) => {
  res.json({
    service: 'HatchKit Webhook Server',
    status: 'running',
    version: '2.0.0',
    breeders: getAllBreeders().length,
    endpoints: [
      'POST /webhooks/ghl/pipeline-change',
      'POST /webhooks/ghl/new-contact',
      'POST /webhooks/ghl/form-submission',
      'POST /webhooks/shipping/evaluate',
      'POST /webhooks/shipping/weather-check',
      'POST /webhooks/lead-score/evaluate',
      'GET  /health',
    ],
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// ── GHL: Pipeline Stage Change (Multi-Tenant + Pipeline-Aware) ─────────────

app.post('/webhooks/ghl/pipeline-change', async (req, res) => {
  try {
    const event = parsePipelineChangeEvent(req.body);

    if (!event.contactId) return fail(res, 400, 'Missing contactId in payload');

    // Resolve breeder from locationId
    const breederCtx = resolveBreeder(req.body);
    if (!breederCtx) {
      log('WARN', `Unknown locationId in pipeline-change webhook: ${event.locationId}`);
      return fail(res, 404, 'Unknown breeder location');
    }

    log('INFO', `Pipeline change: stage="${event.stageName}" contact=${event.contactId} breeder=${breederCtx.clientId}`);

    const stageName = (event.stageName || '').toLowerCase().trim();
    const pipelineId = event.pipelineId;

    // Determine which pipeline this event belongs to
    const pipelineKey = pipelineId
      ? _getPipelineKeyFromConfig(breederCtx.ghlConfig, pipelineId)
      : null;

    let handler = null;

    if (pipelineKey && PIPELINE_STAGE_ACTIONS[pipelineKey]) {
      // Pipeline-aware routing (preferred)
      handler = PIPELINE_STAGE_ACTIONS[pipelineKey][stageName];
    }

    if (!handler) {
      // Fallback: search all pipelines for a matching stage name
      for (const [, stages] of Object.entries(PIPELINE_STAGE_ACTIONS)) {
        if (stages[stageName]) {
          handler = stages[stageName];
          break;
        }
      }
    }

    if (!handler) {
      log('INFO', `No action configured for stage: "${event.stageName}" (pipeline: ${pipelineKey || 'unknown'}) — acknowledged`);
      return ok(res, { action: 'none', stage: event.stageName, pipeline: pipelineKey });
    }

    const result = await handler(event, breederCtx);
    return ok(res, { action: stageName, pipeline: pipelineKey, result });
  } catch (err) {
    return fail(res, 500, 'Pipeline change handler error', err);
  }
});

function _getPipelineKeyFromConfig(ghlConfig, pipelineId) {
  const pipelines = ghlConfig?.pipelines || {};
  for (const [key, p] of Object.entries(pipelines)) {
    if (p.id === pipelineId) return key;
  }
  return null;
}

// ── GHL: New Contact Created ───────────────────────────────────────────────

app.post('/webhooks/ghl/new-contact', async (req, res) => {
  try {
    const event = parseNewContactEvent(req.body);

    if (!event.contactId) return fail(res, 400, 'Missing contactId in payload');

    const breederCtx = resolveBreeder(req.body);
    log('INFO', `New contact: ${event.firstName} ${event.lastName} (${event.contactId}) breeder=${breederCtx?.clientId || 'unknown'}`);

    const hasSrcTag = (event.tags || []).some(t => t.startsWith('source:') || t.startsWith('show:'));
    if (!hasSrcTag) {
      await addTag(event.contactId, ['source:direct']);
      log('INFO', `Tagged contact ${event.contactId} with source:direct`);
    }

    return ok(res, { contactId: event.contactId, breeder: breederCtx?.clientId });
  } catch (err) {
    return fail(res, 500, 'New contact handler error', err);
  }
});

// ── GHL: Form Submission (Show QR / Lead Capture) ─────────────────────────

app.post('/webhooks/ghl/form-submission', async (req, res) => {
  try {
    const event = parseFormSubmissionEvent(req.body);
    const fields = event.fields || {};

    const breederCtx = resolveBreeder(req.body);
    log('INFO', `Form submission received`, { contactId: event.contactId, formId: event.formId, breeder: breederCtx?.clientId });

    const firstName  = fields.first_name || fields.firstName || fields.name?.split(' ')[0] || '';
    const lastName   = fields.last_name  || fields.lastName  || fields.name?.split(' ')[1] || '';
    const email      = fields.email      || '';
    const phone      = fields.phone      || '';
    const showName   = fields.show_name  || fields.showName  || 'Show';
    const showSlug   = showName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const speciesInterest = fields.species_interest || fields.speciesInterest || '';
    const priceTier  = fields.price_tier || fields.priceTier || '';

    const customFields = buildCustomFields(breederCtx, {
      show_source:        fields.show_source || showName,
      species_interest:   speciesInterest,
      price_tier:         priceTier,
      last_show_attended: showName,
      lead_score:         '5',
    });

    const tags = [
      `show:${showSlug}`,
      'source:show-qr',
      'status:new-lead',
      speciesInterest ? `interest:${speciesInterest.toLowerCase().replace(/\s+/g, '-')}` : null,
    ].filter(Boolean);

    let contactId = event.contactId;

    if (contactId) {
      await updateContact(contactId, { firstName, lastName, customFields });
      await addTag(contactId, tags);
      log('SUCCESS', `Updated existing contact ${contactId} from form submission`);
    } else if (email || phone) {
      const existing = email ? await searchContacts(email) : [];
      if (existing.length > 0) {
        contactId = existing[0].id;
        await updateContact(contactId, { firstName, lastName, customFields });
        await addTag(contactId, tags);
        log('SUCCESS', `Matched and updated existing contact ${contactId}`);
      } else {
        const newContact = await createContact({
          firstName, lastName, email, phone, tags, customFields,
        });
        contactId = newContact.id;
        log('SUCCESS', `Created new contact ${contactId} from form submission`);
      }
    } else {
      return fail(res, 400, 'Form submission must include email, phone, or existing contactId');
    }

    // Send welcome SMS using breeder's branding
    const ownerName = breederCtx?.clientConfig?.ownerFirstName || breederCtx?.clientConfig?.ownerName?.split(' ')[0] || 'us';
    const businessName = breederCtx?.clientConfig?.businessName || 'HatchKit';
    const sms = `Hey ${firstName || 'there'}! Thanks for visiting ${businessName} at ${showName}. I'll send a few follow-ups with available animals and care tips. Reply STOP anytime. — ${ownerName}`;
    try {
      await sendSMS(contactId, sms);
      log('SUCCESS', `Welcome SMS sent to ${contactId}`);
    } catch (smsErr) {
      log('WARN', `Welcome SMS failed for ${contactId} (non-fatal)`, { error: smsErr.message });
    }

    return ok(res, { contactId, action: 'form_processed', breeder: breederCtx?.clientId });
  } catch (err) {
    return fail(res, 500, 'Form submission handler error', err);
  }
});

// ── Shipping: Evaluate a Specific Contact ─────────────────────────────────

app.post('/webhooks/shipping/evaluate', async (req, res) => {
  const { contactId, species, originZip, destinationZip, preferredShipDate } = req.body;

  if (!species || !originZip || !destinationZip) {
    return fail(res, 400, 'Required fields: species, originZip, destinationZip');
  }

  log('INFO', `Shipping evaluation requested`, { contactId, species, originZip, destinationZip });

  try {
    const result = await evaluateShipment({
      contactId,
      species,
      originZip,
      destinationZip,
      preferredShipDate,
      updateGHL: !!contactId,
    });
    log('SUCCESS', `Shipping decision: ${result.decision} for ${species} (${originZip}→${destinationZip})`);
    return ok(res, { result });
  } catch (err) {
    return fail(res, 500, 'Shipping evaluation error', err);
  }
});

// ── Shipping: Daily Weather Re-Check for Pending Shipments ────────────────

app.post('/webhooks/shipping/weather-check', async (req, res) => {
  log('INFO', 'Daily weather re-check triggered');

  try {
    const { getContactsByTag } = require('./ghl/contacts');
    const pendingContacts = await getContactsByTag('shipping:pending-weather-check');

    if (pendingContacts.length === 0) {
      log('INFO', 'No contacts pending weather check');
      return ok(res, { checked: 0, message: 'No pending shipments' });
    }

    log('INFO', `Re-checking weather for ${pendingContacts.length} pending shipment(s)`);

    const results = [];

    for (const contact of pendingContacts) {
      const breederCtx = resolveBreeder({ locationId: contact.locationId }) || getAllBreeders()[0];
      const originZip = breederCtx?.clientConfig?.breederZip || process.env.BREEDER_ZIP || '27601';

      const getField = (key) => {
        const fieldId = getFieldId(breederCtx, key);
        if (!fieldId) return null;
        return (contact.customFields || []).find(f => f.id === fieldId)?.value || null;
      };

      const speciesRaw = getField('species_interest');
      const species = speciesRaw
        ? speciesRaw.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
        : 'leopard_gecko';
      const destinationZip = contact.postalCode || null;

      if (!destinationZip) {
        results.push({ contactId: contact.id, skipped: true, reason: 'No zip code' });
        continue;
      }

      try {
        const result = await evaluateShipment({
          contactId: contact.id,
          species,
          originZip,
          destinationZip,
          updateGHL: true,
        });

        if (result.decision === 'APPROVE' && contact.phone) {
          await sendSMS(contact.id, result.customerMessage.slice(0, 300));
          log('SUCCESS', `Weather cleared for ${contact.id} — SMS sent, ship date ${result.recommendedShipDate}`);
        }

        results.push({ contactId: contact.id, decision: result.decision, shipDate: result.recommendedShipDate });
      } catch (err) {
        results.push({ contactId: contact.id, error: err.message });
        log('WARN', `Weather re-check failed for ${contact.id}`, { error: err.message });
      }
    }

    return ok(res, { checked: results.length, results });
  } catch (err) {
    return fail(res, 500, 'Weather check error', err);
  }
});

// ── Lead Scoring: Evaluate a Contact ──────────────────────────────────────

app.post('/webhooks/lead-score/evaluate', async (req, res) => {
  const { contactId } = req.body;
  if (!contactId) return fail(res, 400, 'Required: contactId');

  try {
    const { scoreContact } = require('./agents/lead-scoring/index');
    const breederCtx = resolveBreeder(req.body) || getAllBreeders()[0];
    const result = await scoreContact(contactId, breederCtx);
    log('SUCCESS', `Lead score for ${contactId}: ${result.score}/10 — ${result.intent}`);
    return ok(res, { result });
  } catch (err) {
    return fail(res, 500, 'Lead scoring error', err);
  }
});

// ── Content Engine API ──────────────────────────────────────────────────────

const { getOrCreateSchedule, markPosted, markSkipped } = require('./agents/content-agent/scheduler');
const { generatePost, selectCategory } = require('./agents/content-agent/index');
const { processPost, getLog, handleApprovalReply } = require('./agents/content-agent/publisher');

function findClient(clientId) {
  const breeder = getBreeder(clientId);
  if (breeder) return breeder.clientConfig;

  try {
    const clients = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/clients.json'), 'utf8'));
    return clients.find((c) => c.clientId === clientId) || null;
  } catch {
    return null;
  }
}

app.get('/api/content/calendar/:clientId', async (req, res) => {
  try {
    const clientConfig = findClient(req.params.clientId);
    if (!clientConfig) return fail(res, 404, `Client not found: ${req.params.clientId}`);
    const schedule = getOrCreateSchedule(clientConfig);
    return ok(res, { schedule });
  } catch (err) {
    return fail(res, 500, 'Failed to get content calendar', err);
  }
});

app.post('/api/content/generate/:clientId', async (req, res) => {
  try {
    const clientConfig = findClient(req.params.clientId);
    if (!clientConfig) return fail(res, 404, `Client not found: ${req.params.clientId}`);

    const { category, date } = req.body;
    const targetDate = date ? new Date(date) : new Date();
    const schedule = getOrCreateSchedule(clientConfig);
    const dateStr = targetDate.toISOString().slice(0, 10);
    const todayEntry = schedule.days.find((d) => d.date === dateStr);
    const selectedCategory = category || (todayEntry && todayEntry.category) || selectCategory(clientConfig, [], targetDate);

    log('INFO', `Generating content for ${clientConfig.clientId}: ${selectedCategory} (${dateStr})`);

    const post = await generatePost(clientConfig, selectedCategory, targetDate);
    const result = await processPost(clientConfig.clientId, post, {
      autoPublish: clientConfig.autoPublish || false,
      phone: clientConfig.autoPublish ? null : clientConfig.ownerPhone,
      contactId: clientConfig.ghlContactId || null,
      clientConfig,
    });

    log('SUCCESS', `Content generated and processed for ${clientConfig.clientId}: ${result.action}`);
    return ok(res, { post, result });
  } catch (err) {
    return fail(res, 500, 'Content generation failed', err);
  }
});

app.post('/api/content/approve/:clientId/:postId', async (req, res) => {
  try {
    const { clientId, postId } = req.params;
    const clientConfig = findClient(clientId);
    if (!clientConfig) return fail(res, 404, `Client not found: ${clientId}`);

    const { imageUrl } = req.body;
    const result = await handleApprovalReply(clientId, postId, '1', clientConfig);

    if (result.action === 'approved_pending_image' && imageUrl) {
      const { publishPost } = require('./agents/content-agent/publisher');
      const log_entry = getLog(clientId).find((e) => e.postId === postId);
      if (log_entry) {
        await publishPost(clientId, { id: postId, caption: log_entry.caption, hashtags: log_entry.hashtags }, imageUrl, clientConfig);
        markPosted(clientId, log_entry.date, postId);
      }
    }

    log('SUCCESS', `Post ${postId} approved for ${clientId}`);
    return ok(res, result);
  } catch (err) {
    return fail(res, 500, 'Approval failed', err);
  }
});

app.post('/api/content/skip/:clientId/:postId', async (req, res) => {
  try {
    const { clientId, postId } = req.params;
    if (!findClient(clientId)) return fail(res, 404, `Client not found: ${clientId}`);

    const result = await handleApprovalReply(clientId, postId, '2', null);
    const log_entry = getLog(clientId).find((e) => e.postId === postId);
    if (log_entry) markSkipped(clientId, log_entry.date);

    log('INFO', `Post ${postId} skipped for ${clientId}`);
    return ok(res, result);
  } catch (err) {
    return fail(res, 500, 'Skip failed', err);
  }
});

app.get('/api/content/history/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    if (!findClient(clientId)) return fail(res, 404, `Client not found: ${clientId}`);

    const history = getLog(clientId);
    return ok(res, { clientId, count: history.length, posts: history });
  } catch (err) {
    return fail(res, 500, 'Failed to get post history', err);
  }
});

app.post('/api/content/daily-run', async (req, res) => {
  try {
    log('INFO', 'Daily content run triggered via API');
    const { main } = require('./scripts/daily-content-run');
    const results = await main();
    log('SUCCESS', `Daily content run complete: ${results.length} client(s) processed`);
    return ok(res, { results });
  } catch (err) {
    return fail(res, 500, 'Daily content run failed', err);
  }
});

app.post('/webhooks/sms/content-approval', async (req, res) => {
  try {
    const { phone, body: replyText, contactId, customData } = req.body;

    const clientId = customData?.clientId || req.body.clientId || null;
    const postId = customData?.postId || req.body.postId || null;

    if (!clientId || !postId) {
      log('WARN', 'SMS approval webhook missing clientId or postId', { phone, body: replyText });
      return ok(res, { received: true, action: 'missing_context' });
    }

    log('INFO', `SMS approval reply from ${phone}: "${replyText}" for post ${postId}`);

    const clientConfig = findClient(clientId);
    const result = await handleApprovalReply(clientId, postId, replyText || '', clientConfig);

    log('SUCCESS', `SMS approval processed: ${result.action} for post ${postId}`);
    return ok(res, result);
  } catch (err) {
    return fail(res, 500, 'SMS approval webhook error', err);
  }
});

// ── 404 handler ────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: `No route: ${req.method} ${req.path}` });
});

// ─── Start ────────────────────────────────────────────────────────────────────

if (require.main === module) {
  app.listen(PORT, () => {
    ensureLogDir();
    const breeders = getAllBreeders();
    console.log('');
    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│           HatchKit Webhook Server v2.0              │');
    console.log(`│           Listening on port ${String(PORT).padEnd(25)}│`);
    console.log(`│           Breeders registered: ${String(breeders.length).padEnd(20)}│`);
    console.log('├─────────────────────────────────────────────────────┤');
    console.log('│  POST /webhooks/ghl/pipeline-change                │');
    console.log('│  POST /webhooks/ghl/new-contact                    │');
    console.log('│  POST /webhooks/ghl/form-submission                │');
    console.log('│  POST /webhooks/shipping/evaluate                  │');
    console.log('│  POST /webhooks/shipping/weather-check             │');
    console.log('│  POST /webhooks/lead-score/evaluate                │');
    console.log('│  GET  /health                                      │');
    console.log('└─────────────────────────────────────────────────────┘');
    for (const b of breeders) {
      console.log(`  🦎 ${b.clientConfig.businessName || b.clientId} (${b.locationId})`);
    }
    console.log(`  Logs: ${LOG_FILE}`);
    console.log('');
  });
}

module.exports = app;
