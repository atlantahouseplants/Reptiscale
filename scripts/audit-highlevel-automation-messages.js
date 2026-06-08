#!/usr/bin/env node
require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const ROOT = path.join(__dirname, '..');
const LOCATION_ID = 'oCn199rzTjj0rPgqXyXU';
const WEBHOOK_BASE = 'https://reptiscale-demo.vercel.app';
const TOKEN = process.env.GHL_PRIVATE_TOKEN;
const GHL_BASE_URL = process.env.GHL_API_BASE || 'https://services.leadconnectorhq.com';
const OUT_JSON = path.join(ROOT, 'docs', 'demo-showroom', 'automation-message-live-audit.json');
const OUT_MD = path.join(ROOT, 'docs', 'demo-showroom', 'automation-message-live-audit.md');

if (!TOKEN) {
  console.error('GHL_PRIVATE_TOKEN is missing in .env');
  process.exit(1);
}

const waitSecondsArg = Number(process.argv.find((arg) => arg.startsWith('--wait='))?.split('=')[1] || 150);
const selectedScenario = process.argv.find((arg) => arg.startsWith('--scenario='))?.split('=')[1] || 'all';
const failOnMismatch = process.argv.includes('--fail-on-mismatch');
const listScenarios = process.argv.includes('--list-scenarios');

const ghl = axios.create({
  baseURL: GHL_BASE_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    Version: '2021-07-28',
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

const publicHttp = axios.create({
  timeout: 45000,
  validateStatus: () => true,
});

function stamp() {
  return new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
}

function compactMessage(message = {}) {
  const body = message.body || message.html || message.message || message.text || null;
  return {
    id: message.id || message.messageId || null,
    type: message.type || message.messageType || null,
    direction: message.direction || null,
    status: message.status || null,
    subject: message.subject || null,
    body,
    bodyPreview: body ? String(body).replace(/\s+/g, ' ').slice(0, 240) : null,
    dateAdded: message.dateAdded || message.createdAt || null,
  };
}

function flattenMessages(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.messages)) return payload.messages;
  if (Array.isArray(payload?.messages?.messages)) return payload.messages.messages;
  return [];
}

async function createContact({ firstName, email, tags = [], customFields = [] }) {
  const response = await ghl.post('/contacts/', {
    locationId: LOCATION_ID,
    firstName,
    email,
    tags,
    customFields,
  });
  return response.data.contact || response.data;
}

async function addTags(contactId, tags) {
  await ghl.post(`/contacts/${contactId}/tags`, { tags });
}

async function getContact(contactId) {
  const response = await ghl.get(`/contacts/${contactId}`);
  return response.data.contact || response.data;
}

async function getConversationMessages(contactId) {
  const conversationsResponse = await ghl.get('/conversations/search', {
    params: { locationId: LOCATION_ID, contactId },
  }).catch((error) => ({ data: { conversations: [], error: error.response?.data || error.message } }));

  const conversations = conversationsResponse.data.conversations || [];
  const records = [];
  for (const conversation of conversations) {
    const messagesResponse = await ghl.get(`/conversations/${conversation.id}/messages`, {
      params: { limit: 50 },
    }).catch((error) => ({ data: { messages: [], error: error.response?.data || error.message } }));
    records.push({
      conversationId: conversation.id,
      messages: flattenMessages(messagesResponse.data.messages || messagesResponse.data).map(compactMessage),
      error: messagesResponse.data.error || null,
    });
  }
  return records;
}

async function wait(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function runReferralIsolation(runStamp) {
  const email = `hatchkit.demo.audit.referral.${runStamp}@example.com`;
  const response = await publicHttp.post(`${WEBHOOK_BASE}/webhooks/ghl/referral`, {
    locationId: LOCATION_ID,
    firstName: 'ReferralAudit',
    email,
    species_interest: 'Crested Gecko',
    budgetRange: 'Mango buyer',
    referralSource: 'Automation message audit',
  });
  const contactId = response.data?.contactId;
  return {
    scenario: 'referral-isolation',
    email,
    contactId,
    trigger: 'POST /webhooks/ghl/referral',
    expected: 'No generic lead drip. Contact should have journey:referral-captured and no journey:lead-captured.',
    webhookStatus: response.status,
    webhookResponse: response.data,
  };
}

async function runStarterGuideWebhook(runStamp) {
  const email = `hatchkit.demo.audit.guide.${runStamp}@example.com`;
  const response = await publicHttp.post(`${WEBHOOK_BASE}/webhooks/ghl/lead-magnet`, {
    locationId: LOCATION_ID,
    firstName: 'GuideAudit',
    email,
    species_interest: 'Crested Gecko',
    source: 'automation-message-audit',
    offerKey: 'crested_gecko_starter_guide',
  });
  const contactId = response.data?.contactId;
  return {
    scenario: 'starter-guide-webhook',
    email,
    contactId,
    trigger: 'POST /webhooks/ghl/lead-magnet',
    expected: 'Correct starter-guide email from webhook. No journey:lead-captured generic workflow drip.',
    webhookStatus: response.status,
    webhookResponse: response.data,
  };
}

async function runLeadDrip(runStamp) {
  const email = `hatchkit.demo.audit.lead.${runStamp}@example.com`;
  const contact = await createContact({
    firstName: 'LeadAudit',
    email,
    tags: ['status:new-lead', 'interest:crested-gecko'],
  });
  await addTags(contact.id, ['journey:lead-captured', 'offer:lead-magnet', 'content:starter-guide']);
  return {
    scenario: 'lead-drip',
    email,
    contactId: contact.id,
    trigger: 'Add tag journey:lead-captured',
    expected: 'Correct lead-capture guide message. No Mango-platform, generic-reptile, attachment-claim, or exclusive-offers storefront copy.',
  };
}

async function runReviewVip(runStamp) {
  const email = `hatchkit.demo.audit.reviewvip.${runStamp}@example.com`;
  const contact = await createContact({
    firstName: 'ReviewVipAudit',
    email,
    tags: ['status:customer', 'interest:crested-gecko', 'animal:mango-harlequin-dalmatian'],
  });
  await addTags(contact.id, ['review:received', 'journey:advocacy']);
  return {
    scenario: 'review-vip',
    email,
    contactId: contact.id,
    trigger: 'Add tags review:received and journey:advocacy',
    expected: 'Repeat-buyer VIP invitation for proven buyer/reviewer. No first-time prospect copy.',
  };
}

function flagMismatches(messages) {
  const text = JSON.stringify(messages).toLowerCase();
  const flags = [];
  if (text.includes('discover mango') && text.includes('exclusive offers')) {
    flags.push('generic_mango_exclusive_offers_copy');
  }
  if (text.includes('valued member of our community')) {
    flags.push('generic_community_copy');
  }
  if (text.includes('storefront is stocked')) {
    flags.push('generic_storefront_stocked_copy');
  }
  if (text.includes('mango platform')) {
    flags.push('incorrect_mango_platform_copy');
  }
  if (text.includes('fascinating creatures')) {
    flags.push('generic_reptile_copy');
  }
  if (text.includes('attached you will find') || text.includes('attached guide')) {
    flags.push('attachment_claim_without_verified_attachment');
  }
  return flags;
}

function flagMissingExpectedContent(scenario, messages) {
  const text = JSON.stringify(messages).toLowerCase();
  const checks = {
    'referral-isolation': [
      'crested gecko starter guide',
      'researching crested geckos',
    ],
    'starter-guide-webhook': [
      'crested gecko starter guide',
      'first-week checklist',
    ],
    'lead-drip': [
      'crested gecko starter guide',
      'first-week checklist',
    ],
    'review-vip': [
      'vip list',
      'future',
    ],
  };
  const required = checks[scenario] || [];
  return required
    .filter((phrase) => !text.includes(phrase))
    .map((phrase) => `missing_expected_content:${phrase.replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}`);
}

function writeAudit(audit) {
  fs.writeFileSync(OUT_JSON, JSON.stringify(audit, null, 2) + '\n');
  const lines = [
    '# Automation Message Live Audit',
    '',
    `Generated: ${audit.generatedAt}`,
    '',
    `Wait window: ${audit.waitSeconds} seconds`,
    '',
    `Overall status: ${audit.overallStatus}`,
    '',
    `Mismatch count: ${audit.mismatchCount}`,
    '',
    '## Results',
    '',
  ];
  for (const result of audit.results) {
    lines.push(`### ${result.scenario}`);
    lines.push('');
    lines.push(`- Email: \`${result.email}\``);
    lines.push(`- Contact ID: \`${result.contactId || '(none)'}\``);
    lines.push(`- Trigger: ${result.trigger}`);
    lines.push(`- Expected: ${result.expected}`);
    lines.push(`- Tags: ${(result.tags || []).map((tag) => `\`${tag}\``).join(', ') || '(not read)'}`);
    lines.push(`- Status: ${result.status}`);
    lines.push(`- Mismatch flags: ${result.mismatchFlags.length ? result.mismatchFlags.map((flag) => `\`${flag}\``).join(', ') : 'none'}`);
    lines.push(`- Messages found: ${result.messageCount}`);
    for (const message of result.messages) {
      lines.push(`  - ${message.type || 'Message'} / ${message.direction || 'unknown'} / ${message.status || 'unknown'} / ${message.subject || '(no subject)'}`);
      if (message.bodyPreview) lines.push(`    Preview: ${message.bodyPreview}`);
    }
    lines.push('');
  }
  fs.writeFileSync(OUT_MD, lines.join('\n') + '\n');
}

async function main() {
  const runStamp = stamp();
  const scenarios = [
    { key: 'referral-isolation', runner: runReferralIsolation },
    { key: 'starter-guide-webhook', runner: runStarterGuideWebhook },
    { key: 'lead-drip', runner: runLeadDrip },
    { key: 'review-vip', runner: runReviewVip },
  ];
  if (listScenarios) {
    console.log(scenarios.map((scenario) => scenario.key).join('\n'));
    return;
  }
  const selected = selectedScenario === 'all'
    ? scenarios
    : scenarios.filter((scenario) => (
        scenario.key === selectedScenario ||
        scenario.runner.name.toLowerCase().includes(selectedScenario.replace(/-/g, ''))
      ));

  if (selected.length === 0) {
    throw new Error(`No scenario matched ${selectedScenario}`);
  }

  const seeded = [];
  for (const scenario of selected) {
    seeded.push(await scenario.runner(runStamp));
  }

  await wait(waitSecondsArg * 1000);

  const results = [];
  for (const seed of seeded) {
    const contact = seed.contactId && !String(seed.contactId).startsWith('demo-fallback')
      ? await getContact(seed.contactId).catch(() => null)
      : null;
    const conversations = seed.contactId && !String(seed.contactId).startsWith('demo-fallback')
      ? await getConversationMessages(seed.contactId)
      : [];
    const messages = conversations.flatMap((conversation) => conversation.messages || []);
    const mismatchFlags = [
      ...flagMismatches(messages),
      ...flagMissingExpectedContent(seed.scenario, messages),
    ];
    results.push({
      ...seed,
      tags: contact?.tags || [],
      customFields: contact?.customFields || [],
      conversations,
      messages,
      messageCount: messages.length,
      mismatchFlags,
    });
  }

  const audit = {
    generatedAt: new Date().toISOString(),
    waitSeconds: waitSecondsArg,
    selectedScenario,
    failOnMismatch,
    overallStatus: results.some((result) => result.mismatchFlags.length > 0) ? 'needs_highlevel_ui_correction' : 'pass',
    mismatchCount: results.reduce((total, result) => total + result.mismatchFlags.length, 0),
    results,
  };
  audit.results = audit.results.map((result) => ({
    ...result,
    status: result.mismatchFlags.length > 0 ? 'needs_highlevel_ui_correction' : 'pass',
  }));
  writeAudit(audit);
  console.log(`Automation message live audit written: ${path.relative(ROOT, OUT_JSON)}`);
  console.log(`Automation message live audit summary: ${path.relative(ROOT, OUT_MD)}`);
  console.log(`overallStatus=${audit.overallStatus} mismatchCount=${audit.mismatchCount}`);
  for (const result of results) {
    console.log(`${result.scenario}: messages=${result.messageCount}, flags=${result.mismatchFlags.join(',') || 'none'}`);
  }
  if (failOnMismatch && audit.mismatchCount > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.response?.data || error.message);
  process.exit(1);
});
