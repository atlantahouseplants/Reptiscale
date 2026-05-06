#!/usr/bin/env node
/**
 * Build the HatchKit HighLevel demo account.
 *
 * This script is idempotent for the demo account:
 * - verifies the configured HighLevel location
 * - creates/syncs custom fields
 * - creates/syncs HatchKit pipelines
 * - creates missing tags
 * - creates or updates demo contacts
 * - creates or updates demo opportunities
 * - writes synced IDs to both the per-breeder config and legacy config
 *
 * Secrets are read from .env only. They are never written to JSON config.
 */
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const CLIENT_ID = process.argv.find((arg) => arg.startsWith('--client='))?.split('=')[1] || 'sunscale-geckos';
const ROOT = path.join(__dirname, '..');
const BREEDER_DIR = path.join(ROOT, 'data', 'breeders', CLIENT_ID);
const BREEDER_CONFIG_PATH = path.join(BREEDER_DIR, 'ghl-config.json');
const LEGACY_CONFIG_PATH = path.join(ROOT, 'data', 'ghl-config.json');
const CLIENT_CONFIG_PATH = path.join(BREEDER_DIR, 'client.json');

const TOKEN = process.env.GHL_PRIVATE_TOKEN;
const BASE_URL = process.env.GHL_API_BASE || 'https://services.leadconnectorhq.com';
const VERSION = process.env.GHL_API_VERSION || '2021-07-28';

if (!TOKEN) {
  console.error('GHL_PRIVATE_TOKEN is missing in .env');
  process.exit(1);
}

function readJson(filePath, fallback = {}) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function tagSlug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const breederConfig = readJson(BREEDER_CONFIG_PATH);
const clientConfig = readJson(CLIENT_CONFIG_PATH);
const locationId = breederConfig.locationId || clientConfig.ghlLocationId || process.env.GHL_LOCATION_ID;

if (!locationId) {
  console.error('No HighLevel locationId found in breeder config, client config, or .env');
  process.exit(1);
}

const ghl = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    Version: VERSION,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 20000,
});

const blockers = [];

const CUSTOM_FIELDS = [
  {
    key: 'species_interest',
    name: 'Species Interest',
    dataType: 'SINGLE_OPTIONS',
    model: 'contact',
    options: ['Crested Gecko', 'Leopard Gecko', 'Ball Python', 'Bearded Dragon', 'Corn Snake', 'Other'],
  },
  { key: 'morph_preference', name: 'Morph Preference', dataType: 'TEXT', model: 'contact' },
  {
    key: 'price_tier',
    name: 'Price Tier',
    dataType: 'SINGLE_OPTIONS',
    model: 'contact',
    options: ['Budget ($25-75)', 'Mid-Range ($75-250)', 'Premium ($250-750)', 'Designer ($750+)'],
  },
  {
    key: 'shipping_preference',
    name: 'Shipping Preference',
    dataType: 'SINGLE_OPTIONS',
    model: 'contact',
    options: ['Ship to Home', 'Hold at FedEx', 'Local Pickup', 'Show Pickup'],
  },
  { key: 'temperature_tolerance_min', name: 'Temperature Tolerance Min', dataType: 'NUMERICAL', model: 'contact' },
  { key: 'temperature_tolerance_max', name: 'Temperature Tolerance Max', dataType: 'NUMERICAL', model: 'contact' },
  {
    key: 'show_source',
    name: 'Show Source',
    dataType: 'SINGLE_OPTIONS',
    model: 'contact',
    options: [
      'NARBC Arlington',
      'Tinley Park',
      'Hamburg',
      'Southeast Reptile Expo',
      'Reptile Super Show',
      'Online',
      'Referral',
      'Other',
    ],
  },
  { key: 'lead_score', name: 'Lead Score', dataType: 'NUMERICAL', model: 'contact' },
  { key: 'last_show_attended', name: 'Last Show Attended', dataType: 'TEXT', model: 'contact' },
  {
    key: 'shipping_status',
    name: 'Shipping Status',
    dataType: 'SINGLE_OPTIONS',
    model: 'contact',
    options: ['Not Started', 'Pending Weather Check', 'Operator Review', 'Ready for Label Approval', 'Label Blocked', 'Approved to Ship', 'Label Created', 'In Transit', 'Delivered', 'LAG Confirmed'],
  },
  {
    key: 'customer_journey_stage',
    name: 'Customer Journey Stage',
    dataType: 'SINGLE_OPTIONS',
    model: 'contact',
    options: ['Brand Discovery', 'Lead Captured', 'Nurture', 'Offer Presented', 'Purchased', 'Shipping', 'Care Onboarding', 'Advocacy', 'Repeat Buyer'],
  },
  { key: 'animal_interest', name: 'Animal Interest', dataType: 'TEXT', model: 'contact' },
  { key: 'offer_name', name: 'Offer Name', dataType: 'TEXT', model: 'contact' },
  {
    key: 'purchase_status',
    name: 'Purchase Status',
    dataType: 'SINGLE_OPTIONS',
    model: 'contact',
    options: ['No Purchase', 'Deposit Paid', 'Paid in Full', 'Refunded', 'Cancelled'],
  },
  { key: 'last_purchase_amount', name: 'Last Purchase Amount', dataType: 'NUMERICAL', model: 'contact' },
  { key: 'referral_source', name: 'Referral Source', dataType: 'TEXT', model: 'contact' },
  { key: 'next_best_action', name: 'Next Best Action', dataType: 'TEXT', model: 'contact' },
];

const PIPELINES = [
  {
    key: 'lead_pipeline',
    name: 'HatchKit - Lead Pipeline',
    fallbackNames: ['HatchKit - Lead Pipeline', 'HatchKit — Lead Pipeline'],
    stages: ['New Lead', 'Contacted', 'Interested', 'Qualified', 'Customer', 'Lost'],
  },
  {
    key: 'sales_pipeline',
    name: 'HatchKit - Sales Pipeline',
    fallbackNames: ['HatchKit - Sales Pipeline', 'HatchKit — Sales Pipeline'],
    stages: ['Animal Selected', 'Invoice Sent', 'Payment Received', 'Shipping Scheduled', 'Shipped', 'Delivered', 'Follow-Up Complete'],
  },
  {
    key: 'shipping_pipeline',
    name: 'HatchKit - Shipping Pipeline',
    fallbackNames: ['HatchKit - Shipping Pipeline', 'HatchKit — Shipping Pipeline'],
    stages: ['Pending Review', 'Weather Check', 'Approved to Ship', 'Label Created', 'Dropped Off', 'In Transit', 'Delivered', 'LAG Confirmed', 'Complete'],
  },
];

const REQUIRED_TAGS = [
  'source:show-qr',
  'source:direct',
  'source:website',
  'source:lead-magnet-page',
  'source:referral',
  'source:morphmarket',
  'source:instagram',
  'source:facebook',
  'source:tiktok',
  'status:new-lead',
  'status:hot-lead',
  'status:customer',
  'status:repeat-buyer',
  'needs-attention',
  'shipping:pending-weather-check',
  'shipping:approved',
  'shipping:operator-review',
  'shipping:ready-for-operator-approval',
  'shipping:manual-review-required',
  'shipping:label-blocked',
  'shipping:in-transit',
  'follow-up:complete',
  'repeat-buyer-candidate',
  'review-requested',
  'content:pending-approval',
  'interest:crested-gecko',
  'interest:leopard-gecko',
  'show:narbc-arlington-2026',
  'show:southeast-reptile-expo-2026',
  'journey:brand-discovery',
  'journey:lead-captured',
  'journey:nurture',
  'journey:offer-presented',
  'journey:purchased',
  'journey:shipping',
  'journey:care-onboarding',
  'journey:advocacy',
  'journey:repeat-buyer',
  'offer:lead-magnet',
  'offer:show-vip',
  'offer:animal-reservation',
  'offer:care-kit',
  'offer:care-starter-kit',
  'offer:breeder-consult',
  'offer:waitlist',
  'purchase:animal',
  'purchase:care-kit',
  'content:starter-guide',
  'content:care-guide-sent',
  'content:availability-sent',
  'campaign:availability-alerts',
  'care:day0',
  'care:day3',
  'care:day7',
  'shipping:hold',
  'referral:requested',
  'referral:received',
  'ugc:requested',
  'review:requested',
  'review:received',
  'waitlist:active',
  'animal:nova-lilly-white',
  'animal:mango-harlequin-dalmatian',
  'animal:echo-tricolor-pinstripe',
  'animal:pepper-super-dalmatian',
];

const DEMO_CONTACTS = [
  {
    firstName: 'Ava',
    lastName: 'Bennett',
    email: 'hatchkit.demo.ava@example.com',
    phone: '+14045550101',
    postalCode: '75201',
    tags: ['source:show-qr', 'show:narbc-arlington-2026', 'interest:crested-gecko', 'status:hot-lead', 'journey:lead-captured', 'offer:show-vip', 'campaign:availability-alerts', 'animal:nova-lilly-white'],
    fields: {
      species_interest: 'Crested Gecko',
      morph_preference: 'Lilly White',
      price_tier: 'Designer ($750+)',
      shipping_preference: 'Hold at FedEx',
      show_source: 'NARBC Arlington',
      lead_score: 9,
      last_show_attended: 'NARBC Arlington 2026',
      shipping_status: 'Not Started',
      customer_journey_stage: 'Lead Captured',
      animal_interest: 'Nova - Lilly White',
      offer_name: 'Show VIP Availability List',
      purchase_status: 'No Purchase',
      next_best_action: 'Send Lilly White photos and deposit link',
      temperature_tolerance_min: 45,
      temperature_tolerance_max: 80,
    },
    opportunities: [{ pipeline: 'lead_pipeline', stage: 'Qualified', name: 'Ava Bennett - Lilly White crested gecko lead', value: 1200 }],
  },
  {
    firstName: 'Marcus',
    lastName: 'Hill',
    email: 'hatchkit.demo.marcus@example.com',
    phone: '+14045550102',
    postalCode: '85001',
    tags: ['source:morphmarket', 'interest:crested-gecko', 'shipping:pending-weather-check', 'shipping:hold', 'status:customer', 'journey:purchased', 'journey:shipping', 'purchase:animal', 'animal:pepper-super-dalmatian'],
    fields: {
      species_interest: 'Crested Gecko',
      morph_preference: 'Tricolor Harlequin',
      price_tier: 'Premium ($250-750)',
      shipping_preference: 'Hold at FedEx',
      show_source: 'Online',
      lead_score: 8,
      shipping_status: 'Pending Weather Check',
      customer_journey_stage: 'Shipping',
      animal_interest: 'Pepper - Super Dalmatian',
      offer_name: 'Animal Reservation Deposit',
      purchase_status: 'Deposit Paid',
      last_purchase_amount: 75,
      next_best_action: 'Monitor weather and explain heat hold',
      temperature_tolerance_min: 45,
      temperature_tolerance_max: 80,
    },
    opportunities: [
      { pipeline: 'sales_pipeline', stage: 'Payment Received', name: 'Marcus Hill - Tricolor crested gecko sale', value: 475 },
      { pipeline: 'shipping_pipeline', stage: 'Weather Check', name: 'Ship Marcus Hill - heat hold demo', value: 475 },
    ],
  },
  {
    firstName: 'Jenna',
    lastName: 'Ortiz',
    email: 'hatchkit.demo.jenna@example.com',
    phone: '+14045550103',
    postalCode: '60601',
    tags: ['source:instagram', 'interest:crested-gecko', 'status:new-lead', 'journey:nurture', 'offer:lead-magnet', 'content:starter-guide', 'animal:mango-harlequin-dalmatian'],
    fields: {
      species_interest: 'Crested Gecko',
      morph_preference: 'Dalmatian',
      price_tier: 'Mid-Range ($75-250)',
      shipping_preference: 'Ship to Home',
      show_source: 'Online',
      lead_score: 6,
      shipping_status: 'Not Started',
      customer_journey_stage: 'Nurture',
      animal_interest: 'Mango - Harlequin Dalmatian',
      offer_name: 'Crested Gecko Starter Guide',
      purchase_status: 'No Purchase',
      next_best_action: 'Send beginner animal comparison and care guide',
      temperature_tolerance_min: 45,
      temperature_tolerance_max: 80,
    },
    opportunities: [{ pipeline: 'lead_pipeline', stage: 'Interested', name: 'Jenna Ortiz - Dalmatian inquiry', value: 225 }],
  },
  {
    firstName: 'Noah',
    lastName: 'Parker',
    email: 'hatchkit.demo.noah@example.com',
    phone: '+14045550104',
    postalCode: '30339',
    tags: ['source:show-qr', 'show:southeast-reptile-expo-2026', 'interest:crested-gecko', 'status:new-lead', 'journey:lead-captured', 'offer:show-vip', 'campaign:availability-alerts', 'animal:mango-harlequin-dalmatian'],
    fields: {
      species_interest: 'Crested Gecko',
      morph_preference: 'Pinstripe',
      price_tier: 'Budget ($25-75)',
      shipping_preference: 'Show Pickup',
      show_source: 'Southeast Reptile Expo',
      lead_score: 5,
      last_show_attended: 'Southeast Reptile Expo 2026',
      shipping_status: 'Not Started',
      customer_journey_stage: 'Lead Captured',
      animal_interest: 'Mango - Harlequin Dalmatian',
      offer_name: 'Show VIP Availability List',
      purchase_status: 'No Purchase',
      next_best_action: 'Invite to show pickup list',
      temperature_tolerance_min: 45,
      temperature_tolerance_max: 80,
    },
    opportunities: [{ pipeline: 'lead_pipeline', stage: 'New Lead', name: 'Noah Parker - show QR signup', value: 95 }],
  },
  {
    firstName: 'Priya',
    lastName: 'Raman',
    email: 'hatchkit.demo.priya@example.com',
    phone: '+14045550105',
    postalCode: '10001',
    tags: ['source:referral', 'interest:crested-gecko', 'status:customer', 'shipping:approved', 'journey:purchased', 'journey:shipping', 'purchase:animal', 'referral:received', 'animal:echo-tricolor-pinstripe'],
    fields: {
      species_interest: 'Crested Gecko',
      morph_preference: 'Phantom',
      price_tier: 'Premium ($250-750)',
      shipping_preference: 'Hold at FedEx',
      show_source: 'Referral',
      lead_score: 8,
      shipping_status: 'Approved to Ship',
      customer_journey_stage: 'Shipping',
      animal_interest: 'Echo - Tricolor Pinstripe',
      offer_name: 'Animal Reservation Deposit',
      purchase_status: 'Paid in Full',
      last_purchase_amount: 650,
      referral_source: 'Existing customer referral',
      next_best_action: 'Send shipping date and setup checklist',
      temperature_tolerance_min: 45,
      temperature_tolerance_max: 80,
    },
    opportunities: [
      { pipeline: 'sales_pipeline', stage: 'Shipping Scheduled', name: 'Priya Raman - Phantom crested gecko sale', value: 650 },
      { pipeline: 'shipping_pipeline', stage: 'Approved to Ship', name: 'Ship Priya Raman - approved window', value: 650 },
    ],
  },
  {
    firstName: 'Drew',
    lastName: 'Coleman',
    email: 'hatchkit.demo.drew@example.com',
    phone: '+14045550106',
    postalCode: '98101',
    tags: ['source:website', 'interest:leopard-gecko', 'status:customer', 'review-requested', 'journey:advocacy', 'purchase:animal', 'review:received', 'referral:requested'],
    fields: {
      species_interest: 'Leopard Gecko',
      morph_preference: 'Mack Snow',
      price_tier: 'Mid-Range ($75-250)',
      shipping_preference: 'Ship to Home',
      show_source: 'Online',
      lead_score: 7,
      shipping_status: 'Delivered',
      customer_journey_stage: 'Advocacy',
      animal_interest: 'Mack Snow Leopard Gecko',
      offer_name: 'Animal Reservation Deposit',
      purchase_status: 'Paid in Full',
      last_purchase_amount: 185,
      next_best_action: 'Request review and referral',
      temperature_tolerance_min: 45,
      temperature_tolerance_max: 88,
    },
    opportunities: [
      { pipeline: 'sales_pipeline', stage: 'Delivered', name: 'Drew Coleman - delivered leopard gecko sale', value: 185 },
      { pipeline: 'shipping_pipeline', stage: 'LAG Confirmed', name: 'Drew Coleman - live arrival confirmed', value: 185 },
    ],
  },
];

function buildPipelineEntry(pipeline) {
  return {
    id: pipeline.id,
    name: pipeline.name,
    stages: (pipeline.stages || []).reduce((acc, stage) => {
      acc[slugify(stage.name)] = {
        id: stage.id,
        name: stage.name,
        position: stage.position,
      };
      return acc;
    }, {}),
  };
}

function buildCustomFields(config, fields) {
  return Object.entries(fields)
    .map(([key, value]) => {
      const id = config.customFields?.[key]?.id;
      return id ? { id, value: String(value) } : null;
    })
    .filter(Boolean);
}

function getStageId(config, pipelineKey, stageName) {
  const stageKey = slugify(stageName);
  const stage = config.pipelines?.[pipelineKey]?.stages?.[stageKey];
  if (!stage) throw new Error(`Missing stage ${pipelineKey}.${stageName}`);
  return stage.id;
}

async function ensureCustomFields(config) {
  const response = await ghl.get(`/locations/${locationId}/customFields`);
  const existingFields = response.data.customFields || [];
  const byName = new Map(existingFields.map((field) => [field.name.toLowerCase(), field]));

  config.customFields = config.customFields || {};

  for (const field of CUSTOM_FIELDS) {
    const existing = byName.get(field.name.toLowerCase());
    if (existing) {
      config.customFields[field.key] = {
        id: existing.id,
        fieldKey: existing.fieldKey,
        name: existing.name,
        dataType: existing.dataType,
      };
      console.log(`field exists: ${field.name}`);
      continue;
    }

    const payload = {
      name: field.name,
      dataType: field.dataType,
      model: field.model,
      ...(field.options ? { options: field.options } : {}),
    };
    const createdResponse = await ghl.post(`/locations/${locationId}/customFields`, payload);
    const created = createdResponse.data.customField || createdResponse.data;
    config.customFields[field.key] = {
      id: created.id,
      fieldKey: created.fieldKey,
      name: created.name,
      dataType: created.dataType,
    };
    console.log(`field created: ${field.name}`);
  }
}

async function ensurePipelines(config) {
  const response = await ghl.get('/opportunities/pipelines', { params: { locationId } });
  const existingPipelines = response.data.pipelines || [];

  config.pipelines = config.pipelines || {};

  for (const pipeline of PIPELINES) {
    const existing = existingPipelines.find((candidate) =>
      pipeline.fallbackNames.some((name) => candidate.name.trim().toLowerCase() === name.toLowerCase())
    );

    if (existing) {
      config.pipelines[pipeline.key] = buildPipelineEntry(existing);
      console.log(`pipeline exists: ${existing.name}`);
      continue;
    }

    const payload = {
      name: pipeline.name,
      locationId,
      stages: pipeline.stages.map((name, position) => ({
        name,
        position,
        showInFunnel: true,
        showInPieChart: true,
      })),
    };
    try {
      const createdResponse = await ghl.post('/opportunities/pipelines', payload);
      const created = createdResponse.data.pipeline || createdResponse.data;
      config.pipelines[pipeline.key] = buildPipelineEntry(created);
      console.log(`pipeline created: ${pipeline.name}`);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      blockers.push(`Create pipeline "${pipeline.name}": ${message}`);
      console.warn(`pipeline blocked: ${pipeline.name} (${message})`);
    }
  }
}

async function ensureTags() {
  let existingTags = [];
  try {
    const response = await ghl.get(`/locations/${locationId}/tags`);
    existingTags = response.data.tags || [];
  } catch (error) {
    console.warn(`could not list tags: ${error.response?.data?.message || error.message}`);
  }

  const existingNames = new Set(existingTags.map((tag) => tag.name.toLowerCase()));

  for (const tagName of REQUIRED_TAGS) {
    if (existingNames.has(tagName.toLowerCase())) {
      console.log(`tag exists: ${tagName}`);
      continue;
    }

    try {
      await ghl.post(`/locations/${locationId}/tags`, { name: tagName });
      console.log(`tag created: ${tagName}`);
    } catch (error) {
      console.warn(`tag skipped: ${tagName} (${error.response?.data?.message || error.message})`);
    }
  }
}

async function findContactByEmail(email) {
  const response = await ghl.get('/contacts/', {
    params: { locationId, query: email },
  });
  const contacts = response.data.contacts || [];
  return contacts.find((contact) => contact.email?.toLowerCase() === email.toLowerCase()) || contacts[0] || null;
}

async function upsertContact(config, demo) {
  const customFields = buildCustomFields(config, demo.fields);
  const payload = {
    locationId,
    firstName: demo.firstName,
    lastName: demo.lastName,
    email: demo.email,
    phone: demo.phone,
    postalCode: demo.postalCode,
    tags: demo.tags,
    customFields,
  };

  const existing = await findContactByEmail(demo.email);
  if (existing) {
    const updatePayload = { ...payload };
    delete updatePayload.locationId;
    delete updatePayload.tags;
    const response = await ghl.put(`/contacts/${existing.id}`, updatePayload);
    const contact = response.data.contact || response.data;
    await ghl.post(`/contacts/${contact.id}/tags`, { tags: demo.tags });
    console.log(`contact updated: ${demo.firstName} ${demo.lastName}`);
    return contact;
  }

  const response = await ghl.post('/contacts/', payload);
  const contact = response.data.contact || response.data;
  console.log(`contact created: ${demo.firstName} ${demo.lastName}`);
  return contact;
}

async function upsertOpportunity(config, contactId, demoOpportunity) {
  if (!config.pipelines?.[demoOpportunity.pipeline]?.id) {
    blockers.push(`Create opportunity "${demoOpportunity.name}": missing ${demoOpportunity.pipeline}`);
    console.warn(`opportunity skipped: ${demoOpportunity.name} (missing ${demoOpportunity.pipeline})`);
    return;
  }

  const pipelineId = config.pipelines[demoOpportunity.pipeline].id;
  const pipelineStageId = getStageId(config, demoOpportunity.pipeline, demoOpportunity.stage);

  const searchResponse = await ghl.get('/opportunities/search', {
    params: {
      location_id: locationId,
      contact_id: contactId,
      pipeline_id: pipelineId,
    },
  });
  const existing = (searchResponse.data.opportunities || [])[0];

  const payload = {
    locationId,
    contactId,
    pipelineId,
    pipelineStageId,
    name: demoOpportunity.name,
    monetaryValue: demoOpportunity.value,
    status: 'open',
  };

  if (existing) {
    await ghl.put(`/opportunities/${existing.id}`, payload);
    console.log(`opportunity updated: ${demoOpportunity.name}`);
    return;
  }

  await ghl.post('/opportunities/', payload);
  console.log(`opportunity created: ${demoOpportunity.name}`);
}

async function ensureDemoContacts(config) {
  const contacts = [];
  for (const demo of DEMO_CONTACTS) {
    const contact = await upsertContact(config, demo);
    contacts.push({ demo, contact });
  }

  for (const { demo, contact } of contacts) {
    for (const opportunity of demo.opportunities) {
      await upsertOpportunity(config, contact.id, opportunity);
    }
  }

  return contacts.length;
}

async function main() {
  const config = {
    ...breederConfig,
    locationId,
    customFields: breederConfig.customFields || {},
    pipelines: breederConfig.pipelines || {},
  };
  delete config.token;

  console.log(`Building HatchKit demo account for location ${locationId}`);

  const locationResponse = await ghl.get(`/locations/${locationId}`);
  const location = locationResponse.data.location || locationResponse.data;
  console.log(`connected: ${location.name || location.id}`);

  await ensureCustomFields(config);
  await ensurePipelines(config);
  await ensureTags();
  const contactCount = await ensureDemoContacts(config);

  delete config.token;
  saveJson(BREEDER_CONFIG_PATH, config);
  saveJson(LEGACY_CONFIG_PATH, config);

  console.log('');
  console.log('Demo account build complete.');
  console.log(`custom fields: ${Object.keys(config.customFields).length}`);
  console.log(`pipelines: ${Object.keys(config.pipelines).length}`);
  console.log(`demo contacts: ${contactCount}`);
  console.log(`config synced: ${path.relative(ROOT, BREEDER_CONFIG_PATH)}`);
  console.log(`legacy config synced: ${path.relative(ROOT, LEGACY_CONFIG_PATH)}`);

  if (blockers.length > 0) {
    console.log('');
    console.log('Manual/API-scope blockers:');
    for (const blocker of [...new Set(blockers)]) {
      console.log(`- ${blocker}`);
    }
  }
}

main().catch((error) => {
  const message = error.response?.data?.message || error.message;
  const details = error.response?.data ? JSON.stringify(error.response.data) : '';
  console.error(`Demo account build failed: ${message}`);
  if (details && details !== JSON.stringify(message)) console.error(details);
  process.exit(1);
});
