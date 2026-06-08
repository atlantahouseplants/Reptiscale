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
const VERSION = process.env.GHL_TRIGGER_LINKS_API_VERSION || '2023-02-21';
const SUNSCALE_URLS = {
  starterGuide: 'https://demo.hatchkitai.com/guide',
  mangoDetail: 'https://demo.hatchkitai.com/mango',
  reserveMango: 'https://demo.hatchkitai.com/reserve',
  reviewReferral: 'https://demo.hatchkitai.com/review',
  vipList: 'https://demo.hatchkitai.com/vip',
  showQr: 'https://demo.hatchkitai.com/show-qr',
};

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

const LINKS = [
  {
    key: 'starter_guide',
    name: 'SunScale Demo - Starter Guide',
    redirectTo: SUNSCALE_URLS.starterGuide,
  },
  {
    key: 'mango_detail',
    name: 'SunScale Demo - Mango Detail',
    redirectTo: SUNSCALE_URLS.mangoDetail,
  },
  {
    key: 'reserve_mango',
    name: 'SunScale Demo - Reserve Mango',
    redirectTo: SUNSCALE_URLS.reserveMango,
  },
  {
    key: 'review_referral',
    name: 'SunScale Demo - Review Referral',
    redirectTo: SUNSCALE_URLS.reviewReferral,
  },
  {
    key: 'vip_list',
    name: 'SunScale Demo - VIP List',
    redirectTo: SUNSCALE_URLS.vipList,
  },
  {
    key: 'show_qr',
    name: 'SunScale Demo - Expo QR Signup',
    redirectTo: SUNSCALE_URLS.showQr,
  },
];

async function main() {
  const config = {
    ...breederConfig,
    locationId,
    triggerLinks: breederConfig.triggerLinks || {},
  };

  const existingResponse = await ghl.get('/links/', { params: { locationId } });
  const existingLinks = existingResponse.data.links || [];
  const existingByName = new Map(existingLinks.map((link) => [String(link.name || '').trim().toLowerCase(), link]));

  console.log(`Syncing SunScale trigger links for location ${locationId}`);

  for (const link of LINKS) {
    const existing = existingByName.get(link.name.trim().toLowerCase());
    const payload = {
      locationId,
      name: link.name,
      redirectTo: link.redirectTo,
    };

    let synced = existing;
    if (existing) {
      if (existing.redirectTo === link.redirectTo) {
        console.log(`trigger link exists: ${link.name}`);
      } else {
        const updatePayload = { ...payload };
        delete updatePayload.locationId;
        const response = await ghl.put(`/links/${existing.id}`, updatePayload);
        synced = response.data.link || response.data;
        console.log(`trigger link updated: ${link.name}`);
      }
    } else {
      const response = await ghl.post('/links/', payload);
      synced = response.data.link || response.data;
      console.log(`trigger link created: ${link.name}`);
    }

    config.triggerLinks[link.key] = {
      id: synced.id,
      name: synced.name,
      fieldKey: synced.fieldKey,
      redirectTo: synced.redirectTo || link.redirectTo,
    };
  }

  saveJson(BREEDER_CONFIG_PATH, config);
  saveJson(LEGACY_CONFIG_PATH, config);
  console.log('Trigger link sync complete.');
  console.log(`trigger links: ${Object.keys(config.triggerLinks).length}`);
  console.log(`config synced: ${path.relative(ROOT, BREEDER_CONFIG_PATH)}`);
  console.log(`legacy config synced: ${path.relative(ROOT, LEGACY_CONFIG_PATH)}`);
}

main().catch((error) => {
  const message = error.response?.data?.message || error.message;
  const details = error.response?.data ? JSON.stringify(error.response.data) : '';
  console.error(`Trigger link sync failed: ${message}`);
  if (details && details !== JSON.stringify(message)) console.error(details);
  process.exit(1);
});
