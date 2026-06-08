#!/usr/bin/env node
/**
 * Build the clean Hatchkit master snapshot HighLevel account.
 *
 * This intentionally does not create demo contacts or demo opportunities.
 * The SunScale showroom is for sales proof; this account is the reusable
 * source template for future client snapshots.
 */
require('dotenv').config({ quiet: true });

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const CLIENT_ID = process.argv.find((arg) => arg.startsWith('--client='))?.split('=')[1] || 'hatchkit-master-snapshot';
const explicitLocationId = process.argv.find((arg) => arg.startsWith('--location='))?.split('=')[1];
const ROOT = path.join(__dirname, '..');
const BREEDER_DIR = path.join(ROOT, 'data', 'breeders', CLIENT_ID);
const BREEDER_CONFIG_PATH = path.join(BREEDER_DIR, 'ghl-config.json');
const CLIENT_CONFIG_PATH = path.join(BREEDER_DIR, 'client.json');

const TOKEN = process.env.GHL_MASTER_PRIVATE_TOKEN || process.env.GHL_PRIVATE_TOKEN;
const BASE_URL = process.env.GHL_API_BASE || 'https://services.leadconnectorhq.com';
const VERSION = process.env.GHL_API_VERSION || '2021-07-28';
const PRODUCTS_VERSION = process.env.GHL_PRODUCTS_API_VERSION || '2023-02-21';

if (!TOKEN) {
  console.error('GHL_MASTER_PRIVATE_TOKEN or GHL_PRIVATE_TOKEN is required for the master account');
  process.exit(1);
}

function readJson(filePath, fallback = {}) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
}

function slugify(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

const breederConfig = readJson(BREEDER_CONFIG_PATH);
const clientConfig = readJson(CLIENT_CONFIG_PATH);
const locationId = explicitLocationId || breederConfig.locationId || clientConfig.ghlLocationId;

if (!locationId) {
  console.error('No HighLevel locationId found for the master snapshot account.');
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

const ghlProducts = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    Version: PRODUCTS_VERSION,
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
    options: ['Online', 'Referral', 'Instagram', 'Facebook', 'TikTok', 'MorphMarket', 'Reptile Expo', 'Other'],
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
    name: 'Hatchkit - Lead Pipeline',
    stages: ['New Lead', 'Contacted', 'Interested', 'Qualified', 'Customer', 'Lost'],
  },
  {
    key: 'sales_pipeline',
    name: 'Hatchkit - Sales Pipeline',
    stages: ['Animal Selected', 'Invoice Sent', 'Payment Received', 'Shipping Scheduled', 'Shipped', 'Delivered', 'Follow-Up Complete'],
  },
  {
    key: 'shipping_pipeline',
    name: 'Hatchkit - Shipping Pipeline',
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
  'shipping:lag-confirmed',
  'follow-up:complete',
  'repeat-buyer-candidate',
  'review-requested',
  'content:pending-approval',
  'interest:crested-gecko',
  'interest:leopard-gecko',
  'interest:ball-python',
  'interest:bearded-dragon',
  'journey:brand-discovery',
  'journey:lead-captured',
  'journey:lead-captured-webhook',
  'journey:referral-captured',
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
  'care:onboarding-complete',
  'shipping:hold',
  'referral:requested',
  'referral:received',
  'ugc:requested',
  'review:requested',
  'review:received',
  'waitlist:active',
];

const CUSTOM_VALUES = [
  ['webhook_base_url', '{{hatchkit_webhook_base_url}}'],
  ['client_location_id', locationId],
  ['storefront_url', '{{storefront_url}}'],
  ['starter_guide_url', '{{starter_guide_url}}'],
  ['featured_animal_url', '{{featured_animal_url}}'],
  ['reservation_url', '{{reservation_url}}'],
  ['review_url', '{{review_url}}'],
  ['referral_url', '{{referral_url}}'],
  ['vip_url', '{{vip_url}}'],
  ['show_qr_url', '{{show_qr_url}}'],
  ['business_name', '{{business_name}}'],
  ['owner_first_name', '{{owner_first_name}}'],
];

const PRODUCTS = [
  {
    sku: 'HK-DEP-001',
    name: 'Animal Reservation Deposit',
    type: 'service',
    productType: 'DIGITAL',
    price: 75,
    description: 'Deposit to reserve a specific animal while pickup, setup, or safe shipping is confirmed.',
    highLevelUse: 'Payment link or order form primary product',
  },
  {
    sku: 'HK-KIT-001',
    name: 'Care Starter Kit',
    type: 'physical',
    productType: 'PHYSICAL',
    price: 49,
    description: 'Starter bundle placeholder for a client-specific care kit or order bump.',
    highLevelUse: 'Order bump or post-purchase upsell',
  },
  {
    sku: 'HK-CONSULT-001',
    name: '30-Minute Setup Review',
    type: 'service',
    productType: 'DIGITAL',
    price: 35,
    description: 'Breeder review of enclosure photos before the animal ships or goes home.',
    highLevelUse: 'Upsell after deposit',
  },
  {
    sku: 'HK-GUIDE-001',
    name: 'Starter Guide',
    type: 'digital',
    productType: 'DIGITAL',
    price: 0,
    description: 'Lead magnet guide for new and researching buyers.',
    highLevelUse: 'Free lead magnet delivery',
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

function productTypeFor(row) {
  return row.productType || (row.type === 'physical' ? 'PHYSICAL' : 'DIGITAL');
}

function priceNameFor(row) {
  return row.price === 0 ? 'Free' : `${row.name} - $${row.price}`;
}

function productId(product) {
  return product._id || product.id;
}

function priceId(price) {
  return price._id || price.id;
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

    const createdResponse = await ghl.post(`/locations/${locationId}/customFields`, {
      name: field.name,
      dataType: field.dataType,
      model: field.model,
      ...(field.options ? { options: field.options } : {}),
    });
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
  let response;
  try {
    response = await ghl.get('/opportunities/pipelines', { params: { locationId } });
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    blockers.push(`Pipelines: ${message}`);
    console.warn(`pipelines skipped: ${message}`);
    return;
  }
  const existingPipelines = response.data.pipelines || [];

  config.pipelines = config.pipelines || {};

  for (const pipeline of PIPELINES) {
    const existing = existingPipelines.find((candidate) =>
      candidate.name.trim().toLowerCase() === pipeline.name.toLowerCase()
    );

    if (existing) {
      config.pipelines[pipeline.key] = buildPipelineEntry(existing);
      console.log(`pipeline exists: ${existing.name}`);
      continue;
    }

    try {
      const createdResponse = await ghl.post('/opportunities/pipelines', {
        name: pipeline.name,
        locationId,
        stages: pipeline.stages.map((name, position) => ({
          name,
          position,
          showInFunnel: true,
          showInPieChart: true,
        })),
      });
      const created = createdResponse.data.pipeline || createdResponse.data;
      config.pipelines[pipeline.key] = buildPipelineEntry(created);
      console.log(`pipeline created: ${pipeline.name}`);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      blockers.push(`Create pipeline "${pipeline.name}": ${message}`);
      console.warn(`pipeline skipped: ${pipeline.name} (${message})`);
    }
  }
}

async function ensureTags() {
  let response;
  try {
    response = await ghl.get(`/locations/${locationId}/tags`);
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    blockers.push(`Tags: ${message}`);
    console.warn(`tags skipped: ${message}`);
    return;
  }
  const existingTags = response.data.tags || [];
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
      const message = error.response?.data?.message || error.message;
      blockers.push(`Create tag "${tagName}": ${message}`);
      console.warn(`tag skipped: ${tagName} (${message})`);
    }
  }
}

async function ensureCustomValues(config) {
  let response;
  try {
    response = await ghl.get(`/locations/${locationId}/customValues`);
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    blockers.push(`Custom values: ${message}`);
    console.warn(`custom values skipped: ${message}`);
    return;
  }
  const existingValues = response.data.customValues || [];
  const byName = new Map(existingValues.map((value) => [String(value.name || '').trim().toLowerCase(), value]));

  config.customValues = config.customValues || {};

  for (const [name, value] of CUSTOM_VALUES) {
    const existing = byName.get(name.toLowerCase());
    if (existing) {
      config.customValues[name] = {
        id: existing.id,
        fieldKey: existing.fieldKey,
        name: existing.name,
        value: existing.value,
      };
      console.log(`custom value exists: ${name}`);
      continue;
    }

    try {
      const createdResponse = await ghl.post(`/locations/${locationId}/customValues`, { name, value });
      const created = createdResponse.data.customValue || createdResponse.data;
      config.customValues[name] = {
        id: created.id,
        fieldKey: created.fieldKey,
        name: created.name || name,
        value,
      };
      console.log(`custom value created: ${name}`);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      blockers.push(`Create custom value "${name}": ${message}`);
      console.warn(`custom value skipped: ${name} (${message})`);
    }
  }
}

async function listProducts() {
  try {
    const response = await ghlProducts.get('/products/', {
      params: { locationId, limit: 100 },
    });
    return response.data.products || response.data.data || [];
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    blockers.push(`Products: ${message}`);
    console.warn(`products skipped: ${message}`);
    return null;
  }
}

async function listPrices(targetProductId) {
  const response = await ghlProducts.get(`/products/${targetProductId}/price`, {
    params: { locationId, limit: 100 },
  });
  return response.data.prices || response.data.data || [];
}

async function ensureProducts(config) {
  const existingProducts = await listProducts();
  if (!existingProducts) return;
  const productsByName = new Map(existingProducts.map((product) => [String(product.name || '').trim().toLowerCase(), product]));

  config.products = config.products || {};

  for (const row of PRODUCTS) {
    let product = productsByName.get(row.name.trim().toLowerCase());

    if (product) {
      console.log(`product exists: ${row.name}`);
    } else {
      try {
        const createdResponse = await ghlProducts.post('/products/', {
          name: row.name,
          locationId,
          description: row.description,
          productType: productTypeFor(row),
          availableInStore: true,
        });
        product = createdResponse.data.product || createdResponse.data;
        console.log(`product created: ${row.name}`);
      } catch (error) {
        const message = error.response?.data?.message || error.message;
        blockers.push(`Create product "${row.name}": ${message}`);
        console.warn(`product skipped: ${row.name} (${message})`);
        continue;
      }
    }

    const targetProductId = productId(product);
    const prices = await listPrices(targetProductId);
    const bySku = new Map(prices.filter((price) => price.sku).map((price) => [price.sku, price]));
    const byName = new Map(prices.map((price) => [String(price.name || '').trim().toLowerCase(), price]));
    let price = bySku.get(row.sku) || byName.get(priceNameFor(row).toLowerCase());

    if (price) {
      console.log(`price exists: ${row.name}`);
    } else {
      const payload = {
        product: targetProductId,
        locationId,
        name: priceNameFor(row),
        type: 'one_time',
        currency: 'USD',
        amount: row.price,
        description: row.description,
        sku: row.sku,
        isDigitalProduct: row.type !== 'physical',
      };
      if (row.type === 'physical') {
        payload.shippingOptions = {
          weight: { value: 100, unit: 'g' },
          dimensions: { length: 8, width: 8, height: 4, unit: 'in' },
        };
      }
      try {
        const createdResponse = await ghlProducts.post(`/products/${targetProductId}/price`, payload);
        price = createdResponse.data.price || createdResponse.data;
        console.log(`price created: ${row.name}`);
      } catch (error) {
        const message = error.response?.data?.message || error.message;
        blockers.push(`Create price "${row.name}": ${message}`);
        console.warn(`price skipped: ${row.name} (${message})`);
        continue;
      }
    }

    config.products[row.sku] = {
      id: targetProductId,
      name: row.name,
      type: row.type,
      price: row.price,
      productType: productTypeFor(row),
      highLevelUse: row.highLevelUse,
      priceId: priceId(price),
      priceName: price.name || priceNameFor(row),
    };
  }
}

async function main() {
  const config = {
    ...breederConfig,
    locationId,
    snapshotName: 'Hatchkit Master Snapshot - v1',
    snapshotSource: true,
    customFields: breederConfig.customFields || {},
    pipelines: breederConfig.pipelines || {},
    customValues: breederConfig.customValues || {},
    products: breederConfig.products || {},
  };
  delete config.token;

  console.log(`Building Hatchkit master snapshot account for location ${locationId}`);

  const locationResponse = await ghl.get(`/locations/${locationId}`);
  const location = locationResponse.data.location || locationResponse.data;
  console.log(`connected: ${location.name || location.id}`);

  await ensureCustomFields(config);
  await ensurePipelines(config);
  await ensureTags();
  await ensureCustomValues(config);
  await ensureProducts(config);

  config.notes = {
    ...(config.notes || {}),
    apiStatus: blockers.length > 0 ? 'partial' : 'synced',
    lastSyncedAt: new Date().toISOString(),
    blockers: [...new Set(blockers)],
  };
  delete config.token;
  saveJson(BREEDER_CONFIG_PATH, config);

  console.log('');
  console.log('Master snapshot foundation complete.');
  console.log(`custom fields: ${Object.keys(config.customFields).length}`);
  console.log(`pipelines: ${Object.keys(config.pipelines).length}`);
  console.log(`custom values: ${Object.keys(config.customValues).length}`);
  console.log(`products: ${Object.keys(config.products).length}`);
  console.log(`config synced: ${path.relative(ROOT, BREEDER_CONFIG_PATH)}`);
  if (blockers.length > 0) {
    console.log('');
    console.log('Manual/API-scope blockers:');
    for (const blocker of [...new Set(blockers)]) console.log(`- ${blocker}`);
    process.exitCode = 1;
  } else {
    console.log('');
    console.log('Manual next: create smart lists, pages/funnels, and production-timing workflows in HighLevel.');
  }
}

main().catch((error) => {
  const message = error.response?.data?.message || error.message;
  const details = error.response?.data ? JSON.stringify(error.response.data) : '';
  console.error(`Master snapshot setup failed: ${message}`);
  if (error.response?.status === 403) {
    console.error('The private integration token is not authorized for this location yet.');
  }
  if (details && details !== JSON.stringify(message)) console.error(details);
  process.exit(1);
});
