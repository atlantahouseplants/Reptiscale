#!/usr/bin/env node
require('dotenv').config({ quiet: true });
const axios = require('axios');

const locationId = process.env.GHL_LOCATION_ID || 'fqj4rbp2VRkvMa8GWVWn';
const token = process.env.GHL_PRIVATE_TOKEN;
const baseURL = process.env.GHL_API_BASE || 'https://services.leadconnectorhq.com';
const version = process.env.GHL_API_VERSION || '2021-07-28';

const requiredTags = [
  'interest:crested-gecko',
  'status:new-lead',
  'journey:offer-presented',
  'status:hot-lead',
  'shipping:hold',
  'shipping:pending-weather-check',
  'shipping:operator-review',
  'shipping:ready-for-operator-approval',
  'journey:advocacy',
  'review:received',
  'journey:repeat-buyer',
  'status:repeat-buyer',
];

if (!token) {
  console.error('GHL_PRIVATE_TOKEN is missing from .env');
  process.exit(1);
}

const ghl = axios.create({
  baseURL,
  headers: {
    Authorization: `Bearer ${token}`,
    Version: version,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

async function main() {
  const existingResponse = await ghl.get(`/locations/${locationId}/tags`);
  const existingTags = existingResponse.data.tags || [];
  const existingNames = new Set(existingTags.map((tag) => String(tag.name || '').toLowerCase()));

  const results = [];
  for (const name of requiredTags) {
    if (existingNames.has(name.toLowerCase())) {
      results.push({ tag: name, status: 'exists' });
      continue;
    }

    try {
      await ghl.post(`/locations/${locationId}/tags`, { name });
      results.push({ tag: name, status: 'created' });
    } catch (err) {
      results.push({
        tag: name,
        status: 'skipped',
        message: err.response?.data?.message || err.message || 'unknown error',
      });
    }
  }

  for (const result of results) {
    const suffix = result.message ? ` (${result.message})` : '';
    console.log(`${result.status.padEnd(7)} ${result.tag}${suffix}`);
  }
}

main().catch((err) => {
  const message = err.response?.data?.message || err.message || 'HighLevel smart-list tag sync failed';
  console.error(message);
  process.exit(1);
});
