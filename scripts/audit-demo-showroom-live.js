#!/usr/bin/env node
require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const ROOT = path.join(__dirname, '..');
const LOCATION_ID = 'oCn199rzTjj0rPgqXyXU';
const BASE_URL = 'https://reptiscale-demo.vercel.app';
const TOKEN = process.env.GHL_PRIVATE_TOKEN;
const GHL_BASE_URL = process.env.GHL_API_BASE || 'https://services.leadconnectorhq.com';
const AUDIT_JSON_PATH = path.join(ROOT, 'docs', 'demo-showroom', 'live-showroom-audit.json');
const AUDIT_MD_PATH = path.join(ROOT, 'docs', 'demo-showroom', 'live-showroom-audit.md');
const ACTIVITY_CSV_PATH = path.join(ROOT, 'docs', 'demo-showroom', 'import-data', 'contact-activity.csv');
const CLIENT_CONFIG_PATH = path.join(ROOT, 'data', 'breeders', 'sunscale-geckos', 'client.json');

if (!TOKEN) {
  console.error('GHL_PRIVATE_TOKEN is missing in .env');
  process.exit(1);
}

const ghl2021 = axios.create({
  baseURL: GHL_BASE_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    Version: '2021-07-28',
    Accept: 'application/json',
  },
  timeout: 20000,
});

const ghl2023 = axios.create({
  baseURL: GHL_BASE_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    Version: '2023-02-21',
    Accept: 'application/json',
  },
  timeout: 20000,
});

const PUBLIC_ROUTES = [
  '/health',
  '/demo/store',
  '/demo/guide',
  '/demo/animal/mango',
  '/demo/reserve',
  '/demo/review',
  '/demo/vip',
  '/demo/show-qr',
  '/demo/operator',
  '/demo-showroom/assets/sunscale-logo.svg',
  '/demo-showroom/assets/hero-pattern.svg',
  '/demo-showroom/assets/show-qr-live.svg',
];

const CUSTOM_VALUE_NAMES = [
  'webhook_base_url',
  'demo_location_id',
  'storefront_url',
  'starter_guide_url',
  'mango_detail_url',
  'reservation_url',
  'review_url',
  'referral_url',
  'vip_url',
  'show_qr_url',
];

const TRIGGER_LINKS = [
  'SunScale Demo - Starter Guide',
  'SunScale Demo - Mango Detail',
  'SunScale Demo - Reserve Mango',
  'SunScale Demo - Review Referral',
  'SunScale Demo - VIP List',
  'SunScale Demo - Expo QR Signup',
];

const EXPECTED = {
  customFields: 17,
  pipelines: 3,
  customValues: 10,
  products: 8,
  triggerLinks: 6,
  storeShippingOriginFields: 8,
  shippingZones: 1,
  shippingRates: 1,
  activityContacts: 8,
  activityNotes: 8,
  activityTasks: 8,
};

const EXPECTED_SHIPPING_ZONE_NAME = 'SunScale Demo - Shipping Review Only';
const EXPECTED_SHIPPING_RATE_NAME = 'Shipping quoted after weather review';

const NON_BLOCKING_MANUAL_CHECKS = new Set([
  'Business profile is A2P-compliant for the demo',
  'Accelerated workflows exist',
]);

const clientConfig = JSON.parse(fs.readFileSync(CLIENT_CONFIG_PATH, 'utf8'));
const expectedBusinessProfile = {
  name: 'SunScale Geckos - Demo',
  email: 'demo@hatchkitai.com',
  phone: clientConfig.ownerPhone,
  address: '3645 Essex Ave',
  city: 'Atlanta',
  state: 'GA',
  postalCode: '30339',
  country: clientConfig.shippingOrigin?.countryCode || 'US',
  timezone: clientConfig.timezone,
  website: 'https://demo.hatchkitai.com/store',
};

const expectedStoreShippingOrigin = {
  name: 'SunScale Geckos - Demo',
  street1: clientConfig.shippingOrigin?.streetLines?.[0],
  city: clientConfig.shippingOrigin?.city,
  state: clientConfig.shippingOrigin?.stateOrProvinceCode,
  country: clientConfig.shippingOrigin?.countryCode || 'US',
  zip: clientConfig.shippingOrigin?.postalCode,
  email: clientConfig.ownerEmail,
  phone: clientConfig.ownerPhone,
};

function parseCsv(text) {
  const rows = [];
  let current = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(current);
      current = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(current);
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
      current = '';
    } else {
      current += char;
    }
  }

  if (current || row.length) {
    row.push(current);
    if (row.some((value) => value !== '')) rows.push(row);
  }

  const [headers, ...body] = rows;
  return body.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
}

function pass(condition, label, evidence) {
  return { label, status: condition ? 'pass' : 'fail', evidence };
}

function businessProfileMatches(location) {
  const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'postalCode', 'timezone'];
  return requiredFields.every((field) => String(location[field] || '') === String(expectedBusinessProfile[field] || ''));
}

function businessProfileEvidence(location) {
  const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'postalCode', 'timezone'];
  const matches = requiredFields.filter((field) => String(location[field] || '') === String(expectedBusinessProfile[field] || ''));
  return `${matches.length}/${requiredFields.length}`;
}

function normalizeOrigin(origin = {}) {
  return {
    name: origin.name || '',
    street1: origin.street1 || origin.addressLine1 || '',
    city: origin.city || '',
    state: origin.state || '',
    country: origin.country || '',
    zip: origin.zip || origin.postalCode || '',
    email: origin.email || '',
    phone: origin.phone || '',
  };
}

function storeOriginEvidence(storeSettings) {
  const origin = normalizeOrigin(storeSettings.shippingOrigin);
  const matches = Object.entries(expectedStoreShippingOrigin)
    .filter(([key, value]) => String(origin[key] || '') === String(value || ''));
  return `${matches.length}/${Object.keys(expectedStoreShippingOrigin).length}`;
}

function storeOriginMatches(storeSettings) {
  const origin = normalizeOrigin(storeSettings.shippingOrigin);
  return Object.entries(expectedStoreShippingOrigin)
    .every(([key, value]) => String(origin[key] || '') === String(value || ''));
}

async function checkPublicRoutes() {
  const results = [];
  for (const route of PUBLIC_ROUTES) {
    try {
      const response = await axios.get(`${BASE_URL}${route}`, {
        maxRedirects: 5,
        timeout: 15000,
        validateStatus: () => true,
      });
      results.push({
        route,
        statusCode: response.status,
        contentType: response.headers['content-type'] || '',
        ok: response.status >= 200 && response.status < 300,
      });
    } catch (error) {
      results.push({ route, statusCode: null, contentType: '', ok: false, error: error.message });
    }
  }
  return results;
}

async function checkPublicContent() {
  const targets = [
    {
      route: '/demo/guide',
      checks: ['sunscale-demo.js', '/webhooks/ghl/lead-magnet'],
    },
    {
      route: '/demo/animal/mango',
      checks: ['sunscale-demo.js', '/webhooks/ghl/offer-clicked'],
    },
    {
      route: '/demo/reserve',
      checks: ['sunscale-demo.js', '/webhooks/ghl/order-submitted'],
    },
    {
      route: '/demo/review',
      checks: ['sunscale-demo.js', '/webhooks/ghl/review-submitted', '/webhooks/ghl/referral'],
    },
    {
      route: '/demo/vip',
      checks: ['sunscale-demo.js', '/webhooks/ghl/lead-magnet', 'waitlist_join'],
    },
  ];

  const results = [];
  for (const target of targets) {
    try {
      const response = await axios.get(`${BASE_URL}${target.route}`, {
        maxRedirects: 5,
        timeout: 15000,
      });
      const body = String(response.data || '');
      results.push({
        route: target.route,
        ok: target.checks.every((pattern) => body.includes(pattern)),
        checks: target.checks.map((pattern) => ({ pattern, found: body.includes(pattern) })),
      });
    } catch (error) {
      results.push({
        route: target.route,
        ok: false,
        error: error.message,
        checks: target.checks.map((pattern) => ({ pattern, found: false })),
      });
    }
  }

  return results;
}

async function findContactByEmail(email) {
  const response = await ghl2023.get('/contacts/', {
    params: { locationId: LOCATION_ID, query: email },
  });
  const contacts = response.data.contacts || [];
  return contacts.find((contact) => String(contact.email || '').toLowerCase() === email.toLowerCase()) || null;
}

async function checkContactActivity() {
  const rows = parseCsv(fs.readFileSync(ACTIVITY_CSV_PATH, 'utf8'));
  let contactsFound = 0;
  let notesFound = 0;
  let tasksFound = 0;
  const records = [];

  for (const row of rows) {
    const email = row.email.toLowerCase();
    const marker = `HATCHKIT_DEMO_ACTIVITY:${email}`;
    const contact = await findContactByEmail(email);
    if (!contact) {
      records.push({ email, contactFound: false, noteFound: false, taskFound: false });
      continue;
    }

    contactsFound += 1;
    const [notesResponse, tasksResponse] = await Promise.all([
      ghl2023.get(`/contacts/${contact.id}/notes`),
      ghl2023.get(`/contacts/${contact.id}/tasks`),
    ]);
    const noteFound = (notesResponse.data.notes || []).some((note) => `${note.title || ''}\n${note.body || ''}`.includes(marker));
    const taskFound = (tasksResponse.data.tasks || []).some((task) => `${task.title || ''}\n${task.body || ''}`.includes(marker));

    if (noteFound) notesFound += 1;
    if (taskFound) tasksFound += 1;
    records.push({ email, contactFound: true, noteFound, taskFound });
  }

  return { contactsFound, notesFound, tasksFound, records };
}

async function main() {
  const [
    publicRoutes,
    locationResponse,
    fieldsResponse,
    pipelinesResponse,
    customValuesResponse,
    productsResponse,
    triggerLinksResponse,
    storeSettingsResponse,
    shippingZonesResponse,
    workflowsResponse,
    contactActivity,
    publicContent,
  ] = await Promise.all([
    checkPublicRoutes(),
    ghl2021.get(`/locations/${LOCATION_ID}`),
    ghl2021.get(`/locations/${LOCATION_ID}/customFields`),
    ghl2021.get('/opportunities/pipelines', { params: { locationId: LOCATION_ID } }),
    ghl2021.get(`/locations/${LOCATION_ID}/customValues`),
    ghl2023.get('/products/', { params: { locationId: LOCATION_ID, limit: 100 } }),
    ghl2023.get('/links/', { params: { locationId: LOCATION_ID } }),
    ghl2023.get('/store/store-setting', { params: { altId: LOCATION_ID, altType: 'location' } }),
    ghl2023.get('/store/shipping-zone', { params: { altId: LOCATION_ID, altType: 'location', limit: 100, offset: 0, withShippingRate: true } }),
    ghl2021.get('/workflows/', { params: { locationId: LOCATION_ID } }).catch(() => ({ data: { workflows: [] } })),
    checkContactActivity(),
    checkPublicContent(),
  ]);

  const location = locationResponse.data.location || locationResponse.data;
  const customValues = customValuesResponse.data.customValues || [];
  const products = productsResponse.data.products || productsResponse.data.data || [];
  const triggerLinks = triggerLinksResponse.data.links || [];
  const storeSettings = storeSettingsResponse.data.data || storeSettingsResponse.data;
  const shippingZones = shippingZonesResponse.data.data || [];
  const demoShippingZone = shippingZones.find((zone) => zone.name === EXPECTED_SHIPPING_ZONE_NAME);
  const demoShippingRates = demoShippingZone?.shippingRates || [];
  const demoShippingRate = demoShippingRates.find((rate) => rate.name === EXPECTED_SHIPPING_RATE_NAME);
  const workflows = workflowsResponse.data.workflows || workflowsResponse.data.data || [];

  const customValueMap = CUSTOM_VALUE_NAMES.map((name) => {
    const match = customValues.find((value) => value.name === name);
    return { name, value: match?.value || null, found: Boolean(match) };
  });

  const triggerLinkMap = TRIGGER_LINKS.map((name) => {
    const match = triggerLinks.find((link) => link.name === name);
    return { name, redirectTo: match?.redirectTo || null, found: Boolean(match) };
  });

  const checks = [
    pass(location.name === 'SunScale Geckos - Demo', 'Connected to SunScale demo location', location.name),
    pass(businessProfileMatches(location), 'Business profile is A2P-compliant for the demo', businessProfileEvidence(location)),
    pass(storeOriginMatches(storeSettings), 'Store shipping origin is branded for SunScale demo', storeOriginEvidence(storeSettings)),
    pass(publicRoutes.every((route) => route.ok), 'Public helper routes return 2xx', `${publicRoutes.filter((route) => route.ok).length}/${publicRoutes.length}`),
    pass(publicContent.every((route) => route.ok), 'Public helper forms are wired to webhooks', `${publicContent.filter((route) => route.ok).length}/${publicContent.length}`),
    pass((fieldsResponse.data.customFields || []).length >= EXPECTED.customFields, 'Custom fields are present', (fieldsResponse.data.customFields || []).length),
    pass((pipelinesResponse.data.pipelines || []).length >= EXPECTED.pipelines, 'Pipelines are present', (pipelinesResponse.data.pipelines || []).length),
    pass(customValueMap.every((value) => value.found), 'Custom values are present', `${customValueMap.filter((value) => value.found).length}/${EXPECTED.customValues}`),
    pass(products.length >= EXPECTED.products, 'Products are present', products.length),
    pass(triggerLinkMap.every((link) => link.found), 'Trigger links are present', `${triggerLinkMap.filter((link) => link.found).length}/${EXPECTED.triggerLinks}`),
    pass(Boolean(demoShippingZone), 'Demo shipping zone is present', demoShippingZone?.name || null),
    pass(Boolean(demoShippingRate) && Number(demoShippingRate.amount || 0) === 0 && !demoShippingRate.isCarrierRate, 'Demo shipping rate is review-only', demoShippingRate ? `${demoShippingRate.name} / $${Number(demoShippingRate.amount || 0)}` : null),
    pass(contactActivity.contactsFound >= EXPECTED.activityContacts, 'Demo contacts are present', contactActivity.contactsFound),
    pass(contactActivity.notesFound >= EXPECTED.activityNotes, 'Demo contact notes are present', contactActivity.notesFound),
    pass(contactActivity.tasksFound >= EXPECTED.activityTasks, 'Demo contact tasks are present', contactActivity.tasksFound),
    pass(contactActivity.records.some((record) => record.email === 'hatchkit.demo.taylor@example.com' && record.contactFound && record.noteFound && record.taskFound), 'Full journey proof contact is present', 'hatchkit.demo.taylor@example.com'),
    pass(Array.isArray(workflows) && workflows.length > 0, 'Accelerated workflows exist', Array.isArray(workflows) ? workflows.length : null),
  ];

  const audit = {
    generatedAt: new Date().toISOString(),
    location: {
      id: LOCATION_ID,
      name: location.name,
      email: location.email,
      phone: location.phone,
      address: location.address,
      city: location.city,
      state: location.state,
      postalCode: location.postalCode,
      country: location.country,
      timezone: location.timezone,
      website: location.website,
    },
    expectedBusinessProfile,
    expectedStoreShippingOrigin,
    storeSettings: {
      id: storeSettings._id || null,
      shippingOrigin: normalizeOrigin(storeSettings.shippingOrigin),
      storeOrderNotification: storeSettings.storeOrderNotification || null,
    },
    shippingZones: shippingZones.map((zone) => ({
      id: zone._id,
      name: zone.name,
      countries: zone.countries || [],
      shippingRates: (zone.shippingRates || []).map((rate) => ({
        id: rate._id,
        name: rate.name,
        amount: rate.amount,
        currency: rate.currency,
        conditionType: rate.conditionType,
        isCarrierRate: rate.isCarrierRate,
      })),
    })),
    checks,
    publicRoutes,
    publicContent,
    counts: {
      customFields: (fieldsResponse.data.customFields || []).length,
      pipelines: (pipelinesResponse.data.pipelines || []).length,
      customValues: customValues.length,
      products: products.length,
      triggerLinks: triggerLinks.filter((link) => TRIGGER_LINKS.includes(link.name)).length,
      storeShippingOriginFields: storeOriginEvidence(storeSettings),
      shippingZones: demoShippingZone ? 1 : 0,
      shippingRates: demoShippingRate ? 1 : 0,
      workflows: Array.isArray(workflows) ? workflows.length : null,
      demoContacts: contactActivity.contactsFound,
      demoNotes: contactActivity.notesFound,
      demoTasks: contactActivity.tasksFound,
    },
    customValues: customValueMap,
    triggerLinks: triggerLinkMap,
    contactActivity: contactActivity.records,
    remainingWork: [
      'A2P campaign approval, then live SMS delivery retest with an opted-in number',
      'Inbox/conversation demo messages after phone and messaging are fully approved',
      'Social Planner proof after social accounts are connected; Brianna Yetigex is available as account-admin staff for approval-style proof',
    ],
  };

  fs.writeFileSync(AUDIT_JSON_PATH, JSON.stringify(audit, null, 2) + '\n');

  const md = [
    '# SunScale Live Showroom Audit',
    '',
    `Generated: ${audit.generatedAt}`,
    '',
    `Location: ${audit.location.name} (${audit.location.id})`,
    '',
    '## Checks',
    '',
    ...checks.map((check) => `- ${check.status === 'pass' ? 'PASS' : 'FAIL'} - ${check.label}: ${check.evidence}`),
    '',
    '## Counts',
    '',
    ...Object.entries(audit.counts).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Remaining Work',
    '',
    ...audit.remainingWork.map((item) => `- ${item}`),
    '',
  ].join('\n');
  fs.writeFileSync(AUDIT_MD_PATH, md);

  console.log(`Live showroom audit written: ${path.relative(ROOT, AUDIT_JSON_PATH)}`);
  console.log(`Live showroom audit summary: ${path.relative(ROOT, AUDIT_MD_PATH)}`);
  console.log(`checks passed: ${checks.filter((check) => check.status === 'pass').length}/${checks.length}`);

  if (checks.some((check) => check.status === 'fail' && !NON_BLOCKING_MANUAL_CHECKS.has(check.label))) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`Live showroom audit failed: ${error.response?.data?.message || error.message}`);
  process.exit(1);
});
