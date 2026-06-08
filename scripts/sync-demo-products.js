#!/usr/bin/env node
require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');

const CLIENT_ID = process.argv.find((arg) => arg.startsWith('--client='))?.split('=')[1] || 'sunscale-geckos';
const explicitLocationId = process.argv.find((arg) => arg.startsWith('--location='))?.split('=')[1];
const ROOT = path.join(__dirname, '..');
const BREEDER_DIR = path.join(ROOT, 'data', 'breeders', CLIENT_ID);
const BREEDER_CONFIG_PATH = path.join(BREEDER_DIR, 'ghl-config.json');
const CLIENT_CONFIG_PATH = path.join(BREEDER_DIR, 'client.json');
const LEGACY_CONFIG_PATH = path.join(ROOT, 'data', 'ghl-config.json');
const PRODUCTS_CSV_PATH = path.join(ROOT, 'docs', 'demo-showroom', 'import-data', 'products.csv');
const ANIMALS_CSV_PATH = path.join(ROOT, 'docs', 'demo-showroom', 'import-data', 'animals.csv');

const TOKEN = process.env.GHL_PRIVATE_TOKEN;
const BASE_URL = process.env.GHL_API_BASE || 'https://services.leadconnectorhq.com';
const VERSION = process.env.GHL_PRODUCTS_API_VERSION || '2023-02-21';
const ASSET_BASE_URL = process.env.DEMO_ASSET_BASE_URL || 'https://reptiscale-demo.vercel.app/demo-showroom/assets';

function readJson(filePath, fallback = {}) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
}

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

const breederConfig = readJson(BREEDER_CONFIG_PATH);
const clientConfig = readJson(CLIENT_CONFIG_PATH);
const locationId = explicitLocationId || breederConfig.locationId || clientConfig.ghlLocationId || process.env.GHL_LOCATION_ID;

if (!TOKEN) {
  console.error('GHL_PRIVATE_TOKEN is missing in .env');
  process.exit(1);
}

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
});

function productTypeFor(row) {
  return row.type === 'physical' ? 'PHYSICAL' : 'DIGITAL';
}

function priceNameFor(row) {
  return row.price === '0' ? 'Free' : `${row.name} - $${row.price}`;
}

function productImageFor(sku) {
  const images = {
    'SSG-DEP-001': 'mango-placeholder.svg',
    'SSG-KIT-001': 'starter-guide-cover.svg',
    'SSG-CONSULT-001': 'sunscale-logo.svg',
    'SSG-GUIDE-001': 'starter-guide-cover.svg',
    'SSG-CG-001': 'nova-placeholder.svg',
    'SSG-CG-002': 'mango-placeholder.svg',
    'SSG-CG-003': 'echo-placeholder.svg',
    'SSG-CG-004': 'pepper-placeholder.svg',
  };
  const image = images[sku] || 'sunscale-logo.svg';
  return `${ASSET_BASE_URL.replace(/\/$/, '')}/${image}`;
}

function mediaIdFor(sku) {
  const hash = crypto.createHash('sha256').update(`sunscale-store-media:${sku}`).digest('hex');
  const variantNibble = `4${hash.slice(13, 16)}`;
  const clockSeq = `${((parseInt(hash[16], 16) & 0x3) | 0x8).toString(16)}${hash.slice(17, 20)}`;
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${variantNibble}-${clockSeq}-${hash.slice(20, 32)}`;
}

function asAmount(value) {
  return Number(value || 0);
}

function getProductId(product) {
  return product._id || product.id;
}

function getPriceId(price) {
  return price._id || price.id;
}

async function listProducts() {
  const response = await ghl.get('/products/', {
    params: {
      locationId,
      limit: 100,
    },
  });
  return response.data.products || response.data.data || [];
}

async function listPrices(productId) {
  const response = await ghl.get(`/products/${productId}/price`, {
    params: {
      locationId,
      limit: 100,
    },
  });
  return response.data.prices || response.data.data || [];
}

async function createProduct(row) {
  const payload = {
    name: row.name,
    locationId,
    description: row.description,
    productType: productTypeFor(row),
    availableInStore: true,
    image: row.image,
    medias: [{
      id: mediaIdFor(row.sku),
      title: row.name,
      url: row.image,
      type: 'image',
      isFeatured: true,
    }],
  };

  const response = await ghl.post('/products/', payload);
  return response.data.product || response.data;
}

async function updateProduct(productId, row, existing = {}) {
  const payload = {
    name: row.name,
    locationId,
    description: row.description,
    productType: productTypeFor(row),
    availableInStore: true,
    image: row.image,
    medias: [{
      id: mediaIdFor(row.sku),
      title: row.name,
      url: row.image,
      type: 'image',
      isFeatured: true,
    }],
  };

  if (Array.isArray(existing.variants) && existing.variants.length > 0) {
    payload.variants = existing.variants;
  }

  const response = await ghl.put(`/products/${productId}`, payload);
  return response.data.product || response.data;
}

async function createPrice(productId, row) {
  const payload = {
    product: productId,
    locationId,
    name: priceNameFor(row),
    type: 'one_time',
    currency: 'USD',
    amount: asAmount(row.price),
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

  const response = await ghl.post(`/products/${productId}/price`, payload);
  return response.data.price || response.data;
}

function productRows() {
  return parseCsv(fs.readFileSync(PRODUCTS_CSV_PATH, 'utf8')).map((row) => ({
    sku: row.sku,
    name: row.name,
    type: row.type,
    price: row.price,
    description: row.description,
    image: productImageFor(row.sku),
    highLevelUse: row.highLevelUse,
  }));
}

function animalRows() {
  return parseCsv(fs.readFileSync(ANIMALS_CSV_PATH, 'utf8')).map((row) => ({
    sku: row.sku,
    name: `${row.name} - ${row.morph}`,
    type: 'physical',
    price: row.price,
    description: `${row.name} is a ${row.species} ${row.morph}. ${row.description} Status: ${row.status}. Buyer fit: ${row.recommendedBuyer}.`,
    image: productImageFor(row.sku),
    highLevelUse: `Demo animal inventory listing (${row.status})`,
  }));
}

async function main() {
  const config = {
    ...breederConfig,
    locationId,
    products: breederConfig.products || {},
  };

  const rows = [...productRows(), ...animalRows()];
  const existingProducts = await listProducts();
  const productsByName = new Map(existingProducts.map((product) => [String(product.name || '').trim().toLowerCase(), product]));

  console.log(`Syncing SunScale products for location ${locationId}`);

  for (const row of rows) {
    const key = row.sku;
    let product = productsByName.get(row.name.trim().toLowerCase());

    if (product) {
      console.log(`product exists: ${row.name}`);
    } else {
      product = await createProduct(row);
      console.log(`product created: ${row.name}`);
    }

    const productId = getProductId(product);
    if (!productId) {
      throw new Error(`Product response missing ID for ${row.name}`);
    }

    const existingPrices = await listPrices(productId);
    const pricesBySku = new Map(existingPrices.filter((price) => price.sku).map((price) => [price.sku, price]));
    const pricesByName = new Map(existingPrices.map((price) => [String(price.name || '').trim().toLowerCase(), price]));
    let price = pricesBySku.get(row.sku) || pricesByName.get(priceNameFor(row).trim().toLowerCase());

    if (price) {
      console.log(`price exists: ${row.name}`);
    } else {
      price = await createPrice(productId, row);
      console.log(`price created: ${row.name}`);
    }

    product = await updateProduct(productId, row, product);
    console.log(`product media synced: ${row.name}`);

    config.products[key] = {
      id: productId,
      name: row.name,
      type: row.type,
      price: asAmount(row.price),
      productType: productTypeFor(row),
      image: row.image,
      highLevelUse: row.highLevelUse,
      priceId: getPriceId(price),
      priceName: price.name || priceNameFor(row),
    };
  }

  saveJson(BREEDER_CONFIG_PATH, config);
  saveJson(LEGACY_CONFIG_PATH, config);
  console.log('Product sync complete.');
  console.log(`products: ${Object.keys(config.products).length}`);
  console.log(`config synced: ${path.relative(ROOT, BREEDER_CONFIG_PATH)}`);
  console.log(`legacy config synced: ${path.relative(ROOT, LEGACY_CONFIG_PATH)}`);
}

main().catch((error) => {
  const message = error.response?.data?.message || error.message;
  const details = error.response?.data ? JSON.stringify(error.response.data) : '';
  console.error(`Product sync failed: ${message}`);
  if (details && details !== JSON.stringify(message)) console.error(details);
  process.exit(1);
});
