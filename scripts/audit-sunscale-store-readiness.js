#!/usr/bin/env node
require('dotenv').config({ quiet: true });

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const CLIENT_ID = process.argv.find((arg) => arg.startsWith('--client='))?.split('=')[1] || 'sunscale-geckos';
const explicitLocationId = process.argv.find((arg) => arg.startsWith('--location='))?.split('=')[1];
const ROOT = path.join(__dirname, '..');
const BREEDER_DIR = path.join(ROOT, 'data', 'breeders', CLIENT_ID);
const BREEDER_CONFIG_PATH = path.join(BREEDER_DIR, 'ghl-config.json');
const CLIENT_CONFIG_PATH = path.join(BREEDER_DIR, 'client.json');
const OUT_JSON = path.join(ROOT, 'docs', 'demo-showroom', 'sunscale-store-readiness.json');
const OUT_MD = path.join(ROOT, 'docs', 'demo-showroom', 'sunscale-store-readiness.md');

const TOKEN = process.env.GHL_PRIVATE_TOKEN;
const BASE_URL = process.env.GHL_API_BASE || 'https://services.leadconnectorhq.com';
const VERSION = process.env.GHL_PRODUCTS_API_VERSION || '2023-02-21';

if (!TOKEN) {
  console.error('GHL_PRIVATE_TOKEN is missing in .env');
  process.exit(1);
}

function readJson(filePath, fallback = {}) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const breederConfig = readJson(BREEDER_CONFIG_PATH);
const clientConfig = readJson(CLIENT_CONFIG_PATH);
const locationId = explicitLocationId || breederConfig.locationId || clientConfig.ghlLocationId || process.env.GHL_LOCATION_ID;

if (!locationId || /^(PENDING|REPLACE_WITH)/.test(locationId)) {
  console.error('SunScale demo location ID is missing or still pending.');
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
  validateStatus: () => true,
});

const REQUIRED_PRODUCTS = [
  'Animal Reservation Deposit',
  'Crested Gecko Care Starter Kit',
  '30-Minute Setup Review',
  'Crested Gecko Starter Guide',
  'Nova - Lilly White',
  'Mango - Harlequin Dalmatian',
  'Echo - Tricolor Pinstripe',
  'Pepper - Super Dalmatian',
];

const REQUIRED_STORE_UI = [
  'Update generic Store Builder branding from My Store / Our Products to SunScale Geckos',
  'Confirm Products List Page layout on desktop and mobile',
  'Polish Product Details Page copy for animal listings',
  'Polish Cart Page copy for live-animal reservation context',
  'Polish Checkout Page copy before publishing',
  'Thank You Page exists',
  'Store checkout copy explains weather/operator review before live-animal shipping',
  'Store footer links to Privacy Policy and Terms of Service',
  'Store is published and reachable from the main demo domain',
];

const REQUIRED_COLLECTIONS = [
  'Available Animals',
  'Crested Geckos',
  'Reserved / Sold Examples',
  'Care & Supplies',
  'Lead Magnets / Digital',
  'Deposits & Reservations',
];

function getProductId(product) {
  return product._id || product.id;
}

function getPriceId(price) {
  return price._id || price.id;
}

async function getOrBlocked(endpoint, params) {
  const response = await ghl.get(endpoint, { params });
  if (response.status >= 200 && response.status < 300) return { ok: true, data: response.data };
  return {
    ok: false,
    status: response.status,
    message: response.data?.message || response.data?.error || `HTTP ${response.status}`,
  };
}

async function listPrices(productId) {
  const response = await getOrBlocked(`/products/${productId}/price`, { locationId, limit: 100 });
  if (!response.ok) return { blocked: response.message, prices: [] };
  return { blocked: null, prices: response.data.prices || response.data.data || [] };
}

async function listCollections() {
  const response = await getOrBlocked('/products/collections', {
    altId: locationId,
    altType: 'location',
    limit: 100,
  });
  if (!response.ok) return { blocked: response.message, collections: [] };
  return { blocked: null, collections: response.data.collections || response.data.data || [] };
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

function expectedShippingOrigin() {
  const origin = clientConfig.shippingOrigin || {};
  return {
    name: 'SunScale Geckos - Demo',
    street1: (origin.streetLines || [])[0] || '',
    city: origin.city || '',
    state: origin.stateOrProvinceCode || '',
    country: origin.countryCode || 'US',
    zip: origin.postalCode || '',
    email: clientConfig.ownerEmail || '',
    phone: clientConfig.ownerPhone || '',
  };
}

function originMatches(actual, expected) {
  return Object.entries(expected).every(([key, value]) => String(actual[key] || '') === String(value || ''));
}

function writeAudit(audit) {
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(audit, null, 2) + '\n');

  const lines = [
    '# SunScale Store Readiness',
    '',
    `Generated: ${audit.generatedAt}`,
    '',
    `Location: ${audit.locationId}`,
    `Overall status: ${audit.overallStatus}`,
    '',
    '## API-Visible Foundation',
    '',
    '| Check | Status | Evidence |',
    '|---|---|---|',
  ];

  for (const check of audit.checks) {
    lines.push(`| ${check.label} | ${check.status} | ${check.evidence} |`);
  }

  lines.push('', '## Products', '', '| Product | Type | Store Visible | Status | Prices | Image |');
  lines.push('|---|---|---:|---|---:|---:|');
  for (const product of audit.products) {
    lines.push(`| ${product.name} | ${product.productType || ''} | ${product.availableInStore ? 'yes' : 'no'} | ${product.status || ''} | ${product.priceCount} | ${product.image ? 'yes' : 'no'} |`);
  }

  if (audit.missingProducts.length > 0) {
    lines.push('', '## Missing Products', '');
    for (const productName of audit.missingProducts) lines.push(`- ${productName}`);
  }

  lines.push('', '## Product Collections', '', '| Collection | Status |');
  lines.push('|---|---|');
  for (const collection of audit.collections) {
    lines.push(`| ${collection.name} | present |`);
  }
  if (audit.missingCollections.length > 0) {
    for (const collectionName of audit.missingCollections) {
      lines.push(`| ${collectionName} | missing |`);
    }
  }

  if (audit.highLevelStore?.id) {
    lines.push('', '## Store Shell', '');
    lines.push(`- Name: ${audit.highLevelStore.name}`);
    lines.push(`- Builder ID: ${audit.highLevelStore.id}`);
    lines.push(`- Preview URL: ${audit.highLevelStore.previewUrl}`);
    lines.push(`- Status: ${audit.highLevelStore.status}`);
    if (audit.highLevelStore.previewQa) {
      lines.push('', '## Store Preview QA', '');
      lines.push(`- Products List: ${audit.highLevelStore.previewQa.productsList}`);
      lines.push(`- Product Detail: ${audit.highLevelStore.previewQa.productDetail}`);
      lines.push(`- Cart: ${audit.highLevelStore.previewQa.cart}`);
      lines.push(`- Checkout: ${audit.highLevelStore.previewQa.checkout}`);
      lines.push(`- Verified: ${audit.highLevelStore.previewQa.verifiedAt}`);
      lines.push(`- Note: ${audit.highLevelStore.previewQa.notes}`);
    }
  }

  lines.push('', '## Store Builder Work Not Verifiable By API', '');
  for (const item of REQUIRED_STORE_UI) lines.push(`- ${item}`);

  lines.push('', '## Next Step', '');
  lines.push('Open HighLevel `Sites -> Stores` and finish/publish `SunScale Geckos Store` using `docs/demo-showroom/highlevel-store-build-queue.md`.');
  lines.push('');

  fs.writeFileSync(OUT_MD, `${lines.join('\n')}\n`);
}

async function main() {
  const productsResponse = await getOrBlocked('/products/', { locationId, limit: 100 });
  if (!productsResponse.ok) throw new Error(`Products blocked: ${productsResponse.message}`);

  const rawProducts = productsResponse.data.products || productsResponse.data.data || [];
  const products = [];
  for (const product of rawProducts) {
    const productId = getProductId(product);
    const { blocked, prices } = productId ? await listPrices(productId) : { blocked: 'Missing product ID', prices: [] };
    products.push({
      id: productId,
      name: product.name,
      productType: product.productType,
      availableInStore: product.availableInStore === true,
      status: product.status,
      priceCount: prices.length,
      priceIds: prices.map(getPriceId).filter(Boolean),
      priceBlocked: blocked,
      image: product.image || product.medias?.find((media) => media.isFeatured)?.url || null,
    });
  }

  const productNames = new Set(products.map((product) => String(product.name || '').toLowerCase()));
  const missingProducts = REQUIRED_PRODUCTS.filter((name) => !productNames.has(name.toLowerCase()));
  const requiredProducts = products.filter((product) => REQUIRED_PRODUCTS.some((name) => name.toLowerCase() === String(product.name || '').toLowerCase()));
  const visibleRequired = requiredProducts.filter((product) => product.availableInStore);
  const pricedRequired = requiredProducts.filter((product) => product.priceCount > 0);
  const imagedRequired = requiredProducts.filter((product) => product.image);

  const storeSettingsResponse = await getOrBlocked('/store/store-setting', { altId: locationId, altType: 'location' });
  const storeSettings = storeSettingsResponse.ok ? storeSettingsResponse.data.data || storeSettingsResponse.data : null;
  const actualOrigin = normalizeOrigin(storeSettings?.shippingOrigin);
  const desiredOrigin = expectedShippingOrigin();
  const collectionResponse = await listCollections();
  const collections = collectionResponse.collections.map((collection) => ({
    id: collection._id || collection.id,
    name: collection.name,
    slug: collection.slug,
    type: collection.type || collection.collectionType,
  }));
  const collectionNames = new Set(collections.map((collection) => String(collection.name || '').toLowerCase()));
  const missingCollections = REQUIRED_COLLECTIONS.filter((name) => !collectionNames.has(name.toLowerCase()));

  const checks = [
    {
      label: 'Required demo products exist',
      pass: missingProducts.length === 0,
      evidence: `${requiredProducts.length}/${REQUIRED_PRODUCTS.length}`,
    },
    {
      label: 'Required products are visible in online store',
      pass: visibleRequired.length === REQUIRED_PRODUCTS.length,
      evidence: `${visibleRequired.length}/${REQUIRED_PRODUCTS.length}`,
    },
    {
      label: 'Required products have prices',
      pass: pricedRequired.length === REQUIRED_PRODUCTS.length,
      evidence: `${pricedRequired.length}/${REQUIRED_PRODUCTS.length}`,
    },
    {
      label: 'Required products have store images',
      pass: imagedRequired.length === REQUIRED_PRODUCTS.length,
      evidence: `${imagedRequired.length}/${REQUIRED_PRODUCTS.length}`,
    },
    {
      label: 'HighLevel Store shell is recorded',
      pass: Boolean(breederConfig.highLevelStore?.id),
      evidence: breederConfig.highLevelStore?.id || 'missing',
    },
    {
      label: 'Store shipping origin is available',
      pass: storeSettingsResponse.ok,
      evidence: storeSettingsResponse.ok ? 'available' : storeSettingsResponse.message,
    },
    {
      label: 'Store shipping origin matches SunScale demo',
      pass: storeSettingsResponse.ok && originMatches(actualOrigin, desiredOrigin),
      evidence: storeSettingsResponse.ok ? `${actualOrigin.city}, ${actualOrigin.state} ${actualOrigin.zip}` : storeSettingsResponse.message,
    },
    {
      label: 'Required product collections exist',
      pass: collectionResponse.blocked === null && missingCollections.length === 0,
      evidence: collectionResponse.blocked || `${REQUIRED_COLLECTIONS.length - missingCollections.length}/${REQUIRED_COLLECTIONS.length}`,
    },
  ].map((check) => ({
    ...check,
    status: check.pass ? 'pass' : 'manual_required',
  }));

  const overallStatus = checks.every((check) => check.pass) ? 'store_shell_created_visual_builder_required' : 'manual_required';
  const audit = {
    generatedAt: new Date().toISOString(),
    locationId,
    overallStatus,
    checks,
    products,
    missingProducts,
    collections,
    missingCollections,
    highLevelStore: breederConfig.highLevelStore || null,
    storeSettings: storeSettings ? {
      id: storeSettings._id || null,
      shippingOrigin: actualOrigin,
      storeOrderNotification: storeSettings.storeOrderNotification || null,
    } : {
      blocked: storeSettingsResponse.message,
    },
    uiRequired: REQUIRED_STORE_UI,
  };

  writeAudit(audit);
  console.log(`Store readiness written: ${path.relative(ROOT, OUT_JSON)}`);
  console.log(`Store readiness summary: ${path.relative(ROOT, OUT_MD)}`);
  console.log(`overallStatus=${overallStatus}`);
  for (const check of checks) console.log(`${check.status} - ${check.label}: ${check.evidence}`);
}

main().catch((error) => {
  console.error(`Store readiness audit failed: ${error.response?.data?.message || error.message}`);
  process.exit(1);
});
