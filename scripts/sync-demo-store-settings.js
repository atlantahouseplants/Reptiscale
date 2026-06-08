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
const VERSION = '2023-02-21';

function readJson(filePath, fallback = {}) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
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

function originMatches(actual, expected) {
  return Object.entries(expected).every(([key, value]) => String(actual[key] || '') === String(value || ''));
}

function saveStoreSettingsStatus(storeSettings, desiredOrigin, syncStatus, blocker = null) {
  const config = {
    ...breederConfig,
    locationId,
    storeSettings: {
      id: storeSettings?._id || null,
      shippingOrigin: normalizeOrigin(storeSettings?.shippingOrigin),
      desiredShippingOrigin: desiredOrigin,
      storeOrderNotification: storeSettings?.storeOrderNotification || null,
      syncStatus,
      blocker,
      checkedAt: new Date().toISOString(),
    },
  };
  delete config.token;
  saveJson(BREEDER_CONFIG_PATH, config);
  saveJson(LEGACY_CONFIG_PATH, config);
}

async function getStoreSettings() {
  const response = await ghl.get('/store/store-setting', {
    params: { altId: locationId, altType: 'location' },
  });
  return response.data.data || response.data;
}

async function main() {
  const current = await getStoreSettings();
  const desiredOrigin = expectedShippingOrigin();
  const currentOrigin = normalizeOrigin(current.shippingOrigin);

  console.log(`Syncing SunScale store settings for location ${locationId}`);

  if (!originMatches(currentOrigin, desiredOrigin)) {
    const payload = {
      altId: locationId,
      altType: 'location',
      storeOrderNotification: current.storeOrderNotification || {
        enabled: true,
        allowGuestDigitalDownloads: true,
      },
      shippingOrigin: desiredOrigin,
    };

    try {
      await ghl.post('/store/store-setting', payload);
      console.log('store shipping origin updated');
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      saveStoreSettingsStatus(current, desiredOrigin, 'manual_required', message);
      console.warn(`store settings update requires manual action or broader API scope: ${message}`);
      console.log(`config synced: ${path.relative(ROOT, BREEDER_CONFIG_PATH)}`);
      console.log(`legacy config synced: ${path.relative(ROOT, LEGACY_CONFIG_PATH)}`);
      return;
    }
  } else {
    console.log('store shipping origin already matches expected demo values');
  }

  const verified = await getStoreSettings();
  const verifiedOrigin = normalizeOrigin(verified.shippingOrigin);
  const syncStatus = originMatches(verifiedOrigin, desiredOrigin) ? 'synced' : 'manual_required';
  const blocker = syncStatus === 'synced' ? null : 'Store settings API response did not confirm the desired shipping origin.';
  saveStoreSettingsStatus(verified, desiredOrigin, syncStatus, blocker);

  console.log('Store settings sync complete.');
  console.log(`shipping origin status: ${syncStatus}`);
  console.log(`config synced: ${path.relative(ROOT, BREEDER_CONFIG_PATH)}`);
  console.log(`legacy config synced: ${path.relative(ROOT, LEGACY_CONFIG_PATH)}`);
}

main().catch((error) => {
  const message = error.response?.data?.message || error.message;
  console.error(`Store settings sync failed: ${message}`);
  process.exit(1);
});
