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
const VERSION = process.env.GHL_API_VERSION || '2021-07-28';
const DEMO_FUNNEL_BASE_URL = process.env.DEMO_FUNNEL_BASE_URL || 'https://demo.hatchkitai.com';

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

function unwrapLocation(response) {
  return response.data.location || response.data;
}

function compactProfile(location) {
  return {
    name: location.name || null,
    businessName: clientConfig.businessName,
    ownerName: clientConfig.ownerName,
    email: location.email || null,
    phone: location.phone || null,
    address: location.address || null,
    city: location.city || null,
    state: location.state || null,
    postalCode: location.postalCode || null,
    country: location.country || null,
    timezone: location.timezone || null,
    website: location.website || null,
    demoOnly: true,
  };
}

function saveProfileStatus(current, desired, syncStatus, blocker = null) {
  const config = {
    ...breederConfig,
    locationId,
    businessProfile: {
      ...compactProfile(current),
      desired,
      syncStatus,
      blocker,
      checkedAt: new Date().toISOString(),
    },
  };
  delete config.token;
  saveJson(BREEDER_CONFIG_PATH, config);
  saveJson(LEGACY_CONFIG_PATH, config);
  return config;
}

function expectedProfile() {
  const origin = clientConfig.shippingOrigin || {};
  return {
    name: 'SunScale Geckos - Demo',
    email: clientConfig.ownerEmail,
    phone: clientConfig.ownerPhone,
    address: (origin.streetLines || []).join(', '),
    city: origin.city,
    state: origin.stateOrProvinceCode,
    postalCode: origin.postalCode,
    country: origin.countryCode || 'US',
    timezone: clientConfig.timezone,
    website: `${DEMO_FUNNEL_BASE_URL}/store`,
  };
}

function changedFields(current, expected) {
  return Object.entries(expected)
    .filter(([key, value]) => value && String(current[key] || '') !== String(value))
    .map(([key]) => key);
}

async function updateLocation(payload) {
  const response = await ghl.put(`/locations/${locationId}`, payload);
  return unwrapLocation(response);
}

async function main() {
  const current = unwrapLocation(await ghl.get(`/locations/${locationId}`));
  if (current.id && current.id !== locationId) {
    throw new Error(`Connected to unexpected location ${current.id}`);
  }

  const expected = expectedProfile();
  const changes = changedFields(current, expected);
  let synced = current;

  console.log(`Syncing SunScale business profile for location ${locationId}`);

  if (changes.length > 0) {
    try {
      synced = await updateLocation(expected);
      console.log(`business profile updated: ${changes.join(', ')}`);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      if (/scope|authorized/i.test(message)) {
        saveProfileStatus(current, expected, 'manual_required', message);
        console.warn(`business profile update requires manual action or broader API scope: ${message}`);
        console.log(`config synced: ${path.relative(ROOT, BREEDER_CONFIG_PATH)}`);
        console.log(`legacy config synced: ${path.relative(ROOT, LEGACY_CONFIG_PATH)}`);
        return;
      }
      throw new Error(`Business profile update failed: ${message}`);
    }
  } else {
    console.log('business profile already matches expected demo values');
  }

  const verified = unwrapLocation(await ghl.get(`/locations/${locationId}`));
  saveProfileStatus(verified, expected, 'synced');

  const remainingDiffs = changedFields(verified, expected);
  console.log('Business profile sync complete.');
  console.log(`verified profile fields: ${Object.keys(expected).length - remainingDiffs.length}/${Object.keys(expected).length}`);
  console.log(`config synced: ${path.relative(ROOT, BREEDER_CONFIG_PATH)}`);
  console.log(`legacy config synced: ${path.relative(ROOT, LEGACY_CONFIG_PATH)}`);

  if (remainingDiffs.length > 0) {
    console.warn(`profile fields not confirmed by API response: ${remainingDiffs.join(', ')}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
