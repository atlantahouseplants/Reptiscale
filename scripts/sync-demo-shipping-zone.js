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

const SHIPPING_ZONE = {
  key: 'demo_shipping_review_only',
  name: 'SunScale Demo - Shipping Review Only',
  countries: [{ code: 'US', states: [] }],
};

const SHIPPING_RATE = {
  key: 'shipping_quoted_after_weather_review',
  name: 'Shipping quoted after weather review',
  description: 'Demo-safe placeholder rate. No carrier is connected and no shipping label is created.',
  currency: 'USD',
  amount: 0,
  conditionType: 'none',
  minCondition: 0,
  maxCondition: 0,
  isCarrierRate: false,
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

function normalizeName(value) {
  return String(value || '').trim().toLowerCase();
}

function responseData(response) {
  return response.data.data || response.data;
}

function listData(response) {
  const data = response.data.data || response.data.shippingZones || response.data.shippingRates || [];
  return Array.isArray(data) ? data : [];
}

function zoneMatches(zone) {
  const countries = zone.countries || [];
  return countries.some((country) => country.code === 'US');
}

function rateMatches(rate) {
  return (
    normalizeName(rate.name) === normalizeName(SHIPPING_RATE.name) &&
    Number(rate.amount || 0) === SHIPPING_RATE.amount &&
    rate.currency === SHIPPING_RATE.currency &&
    rate.conditionType === SHIPPING_RATE.conditionType &&
    Boolean(rate.isCarrierRate) === SHIPPING_RATE.isCarrierRate
  );
}

async function listZones() {
  const response = await ghl.get('/store/shipping-zone', {
    params: { altId: locationId, altType: 'location', limit: 100, offset: 0, withShippingRate: true },
  });
  return listData(response);
}

async function ensureZone() {
  const zones = await listZones();
  const existing = zones.find((zone) => normalizeName(zone.name) === normalizeName(SHIPPING_ZONE.name));
  if (existing) {
    if (!zoneMatches(existing)) {
      const response = await ghl.put(`/store/shipping-zone/${existing._id}`, {
        altId: locationId,
        altType: 'location',
        name: SHIPPING_ZONE.name,
        countries: SHIPPING_ZONE.countries,
      });
      console.log(`shipping zone updated: ${SHIPPING_ZONE.name}`);
      return responseData(response);
    }
    console.log(`shipping zone exists: ${SHIPPING_ZONE.name}`);
    return existing;
  }

  const response = await ghl.post('/store/shipping-zone', {
    altId: locationId,
    altType: 'location',
    name: SHIPPING_ZONE.name,
    countries: SHIPPING_ZONE.countries,
  });
  console.log(`shipping zone created: ${SHIPPING_ZONE.name}`);
  return responseData(response);
}

async function listRates(zoneId) {
  const response = await ghl.get(`/store/shipping-zone/${zoneId}/shipping-rate`, {
    params: { altId: locationId, altType: 'location', limit: 100, offset: 0 },
  });
  return listData(response);
}

async function ensureRate(zoneId) {
  const rates = await listRates(zoneId);
  const existing = rates.find((rate) => normalizeName(rate.name) === normalizeName(SHIPPING_RATE.name));
  const payload = {
    altId: locationId,
    altType: 'location',
    name: SHIPPING_RATE.name,
    description: SHIPPING_RATE.description,
    currency: SHIPPING_RATE.currency,
    amount: SHIPPING_RATE.amount,
    conditionType: SHIPPING_RATE.conditionType,
    minCondition: SHIPPING_RATE.minCondition,
    maxCondition: SHIPPING_RATE.maxCondition,
    isCarrierRate: SHIPPING_RATE.isCarrierRate,
  };

  if (existing) {
    if (!rateMatches(existing)) {
      const response = await ghl.put(`/store/shipping-zone/${zoneId}/shipping-rate/${existing._id}`, payload);
      console.log(`shipping rate updated: ${SHIPPING_RATE.name}`);
      return responseData(response);
    }
    console.log(`shipping rate exists: ${SHIPPING_RATE.name}`);
    return existing;
  }

  const response = await ghl.post(`/store/shipping-zone/${zoneId}/shipping-rate`, payload);
  console.log(`shipping rate created: ${SHIPPING_RATE.name}`);
  return responseData(response);
}

function saveShippingConfig(zone, rate) {
  const config = {
    ...breederConfig,
    locationId,
    shippingZone: {
      [SHIPPING_ZONE.key]: {
        id: zone._id,
        name: zone.name,
        countries: zone.countries || SHIPPING_ZONE.countries,
        rate: {
          id: rate._id,
          name: rate.name,
          description: rate.description,
          currency: rate.currency,
          amount: Number(rate.amount || 0),
          conditionType: rate.conditionType,
          isCarrierRate: Boolean(rate.isCarrierRate),
        },
        demoOnly: true,
        syncStatus: 'synced',
        checkedAt: new Date().toISOString(),
      },
    },
  };
  delete config.token;
  saveJson(BREEDER_CONFIG_PATH, config);
  saveJson(LEGACY_CONFIG_PATH, config);
}

async function main() {
  console.log(`Syncing SunScale demo shipping zone for location ${locationId}`);
  const zone = await ensureZone();
  const rate = await ensureRate(zone._id);
  saveShippingConfig(zone, rate);
  console.log('Demo shipping zone sync complete.');
  console.log(`shipping zone: ${zone.name}`);
  console.log(`shipping rate: ${rate.name}`);
  console.log(`config synced: ${path.relative(ROOT, BREEDER_CONFIG_PATH)}`);
  console.log(`legacy config synced: ${path.relative(ROOT, LEGACY_CONFIG_PATH)}`);
}

main().catch((error) => {
  const message = error.response?.data?.message || error.message;
  const details = error.response?.data ? JSON.stringify(error.response.data) : '';
  console.error(`Demo shipping zone sync failed: ${message}`);
  if (details && details !== JSON.stringify(message)) console.error(details);
  process.exit(1);
});
