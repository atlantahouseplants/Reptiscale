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
const LEGACY_CONFIG_PATH = path.join(ROOT, 'data', 'ghl-config.json');

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

function saveJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
}

function slugify(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
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

const COLLECTIONS = [
  {
    key: 'available_animals',
    name: 'Available Animals',
    description: 'Animals currently shown as available in the SunScale demo store.',
    products: ['Nova - Lilly White', 'Mango - Harlequin Dalmatian', 'Pepper - Super Dalmatian'],
  },
  {
    key: 'crested_geckos',
    name: 'Crested Geckos',
    description: 'Crested gecko listings for the SunScale demo store.',
    products: ['Nova - Lilly White', 'Mango - Harlequin Dalmatian', 'Echo - Tricolor Pinstripe', 'Pepper - Super Dalmatian'],
  },
  {
    key: 'reserved_sold_examples',
    name: 'Reserved / Sold Examples',
    description: 'Example listings that show how reserved or sold animals can remain as proof.',
    products: ['Echo - Tricolor Pinstripe'],
  },
  {
    key: 'care_supplies',
    name: 'Care & Supplies',
    description: 'Care support products and post-purchase add-ons.',
    products: ['Crested Gecko Care Starter Kit', '30-Minute Setup Review'],
  },
  {
    key: 'lead_magnets_digital',
    name: 'Lead Magnets / Digital',
    description: 'Digital lead magnets and free resources.',
    products: ['Crested Gecko Starter Guide'],
  },
  {
    key: 'deposits_reservations',
    name: 'Deposits & Reservations',
    description: 'Reservation and deposit products for animal holds.',
    products: ['Animal Reservation Deposit'],
  },
];

function productId(product) {
  return product._id || product.id;
}

async function listProducts() {
  const response = await ghl.get('/products/', { params: { locationId, limit: 100 } });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.data?.message || response.data?.error || `Products HTTP ${response.status}`);
  }
  return response.data.products || response.data.data || [];
}

async function listCollections() {
  const response = await ghl.get('/products/collections', {
    params: { altId: locationId, altType: 'location', limit: 100 },
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.data?.message || response.data?.error || `Collections HTTP ${response.status}`);
  }
  return response.data.collections || response.data.data || [];
}

async function createCollection(collection) {
  const response = await ghl.post('/products/collections', {
    altId: locationId,
    altType: 'location',
    name: collection.name,
    slug: slugify(collection.name),
    description: collection.description,
    collectionType: 'manual',
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.data?.message || response.data?.error || `Create collection HTTP ${response.status}`);
  }
  return response.data.collection || response.data.data || response.data;
}

async function bulkAssignCollections(productIds, collectionIds) {
  const response = await ghl.post('/products/bulk-update', {
    altId: locationId,
    altType: 'location',
    type: 'bulk-update-product-collection',
    productIds,
    collectionIds,
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.data?.message || response.data?.error || `Bulk collection update HTTP ${response.status}`);
  }
  return response.data;
}

async function main() {
  const config = {
    ...breederConfig,
    locationId,
    storeCollections: breederConfig.storeCollections || {},
  };

  const products = await listProducts();
  const productsByName = new Map(products.map((product) => [String(product.name || '').trim().toLowerCase(), product]));
  let collections = await listCollections();
  const collectionsByName = new Map(collections.map((collection) => [String(collection.name || '').trim().toLowerCase(), collection]));

  console.log(`Syncing SunScale store catalog for location ${locationId}`);

  for (const collection of COLLECTIONS) {
    let existing = collectionsByName.get(collection.name.toLowerCase());
    if (existing) {
      console.log(`collection exists: ${collection.name}`);
    } else {
      existing = await createCollection(collection);
      collectionsByName.set(collection.name.toLowerCase(), existing);
      console.log(`collection created: ${collection.name}`);
    }
    config.storeCollections[collection.key] = {
      id: existing._id || existing.id,
      name: existing.name || collection.name,
      slug: existing.slug || slugify(collection.name),
      products: collection.products,
    };
  }

  collections = Array.from(collectionsByName.values());
  const collectionIdsByProduct = new Map();
  const blockers = [];

  for (const collection of COLLECTIONS) {
    const collectionRecord = collectionsByName.get(collection.name.toLowerCase());
    const collectionId = collectionRecord?._id || collectionRecord?.id;
    if (!collectionId) {
      blockers.push(`Collection missing ID: ${collection.name}`);
      continue;
    }
    for (const productName of collection.products) {
      const product = productsByName.get(productName.toLowerCase());
      const id = product && productId(product);
      if (!id) {
        blockers.push(`Product missing for collection "${collection.name}": ${productName}`);
        continue;
      }
      const current = collectionIdsByProduct.get(id) || new Set();
      current.add(collectionId);
      collectionIdsByProduct.set(id, current);
    }
  }

  for (const [id, ids] of collectionIdsByProduct.entries()) {
    await bulkAssignCollections([id], Array.from(ids));
  }

  config.notes = {
    ...(config.notes || {}),
    storeCatalogSyncedAt: new Date().toISOString(),
    storeCatalogBlockers: [...new Set(blockers)],
  };
  delete config.token;
  saveJson(BREEDER_CONFIG_PATH, config);
  saveJson(LEGACY_CONFIG_PATH, config);

  console.log('Store catalog sync complete.');
  console.log(`collections: ${Object.keys(config.storeCollections).length}`);
  console.log(`products assigned: ${collectionIdsByProduct.size}`);
  console.log(`config synced: ${path.relative(ROOT, BREEDER_CONFIG_PATH)}`);
  console.log(`legacy config synced: ${path.relative(ROOT, LEGACY_CONFIG_PATH)}`);

  if (blockers.length > 0) {
    console.log('');
    console.log('Manual/API blockers:');
    for (const blocker of [...new Set(blockers)]) console.log(`- ${blocker}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const message = Array.isArray(error.message) ? error.message.join('; ') : error.message;
  console.error(`Store catalog sync failed: ${message}`);
  process.exit(1);
});
