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
const CSV_PATH = path.join(ROOT, 'docs', 'demo-showroom', 'import-data', 'custom-values.csv');

const TOKEN = process.env.GHL_PRIVATE_TOKEN;
const BASE_URL = process.env.GHL_API_BASE || 'https://services.leadconnectorhq.com';
const VERSION = process.env.GHL_API_VERSION || '2021-07-28';

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

function cleanValue(row, locationId) {
  const value = row.value === 'REPLACE_WITH_SUNSCALE_DEMO_LOCATION_ID' ? locationId : row.value;
  return value;
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
  return String(value || '').trim().toLowerCase().replace(/[_-]+/g, ' ');
}

async function main() {
  const config = {
    ...breederConfig,
    locationId,
    customValues: breederConfig.customValues || {},
  };

  const rows = parseCsv(fs.readFileSync(CSV_PATH, 'utf8'));
  const response = await ghl.get(`/locations/${locationId}/customValues`);
  const existing = response.data.customValues || [];
  const existingByName = new Map(existing.map((item) => [normalizeName(item.name), item]));

  console.log(`Syncing SunScale custom values for location ${locationId}`);

  for (const row of rows) {
    const name = row.name;
    const value = cleanValue(row, locationId);
    const match = existingByName.get(normalizeName(name));
    const payload = { name, value };

    if (match) {
      const currentValue = String(match.value || '');
      if (currentValue === value) {
        console.log(`custom value exists: ${name}`);
      } else {
        const updateResponse = await ghl.put(`/locations/${locationId}/customValues/${match.id}`, payload);
        const updated = updateResponse.data.customValue || updateResponse.data;
        console.log(`custom value updated: ${name}`);
        config.customValues[name] = {
          id: updated.id || match.id,
          fieldKey: updated.fieldKey || match.fieldKey,
          name: updated.name || name,
          value,
        };
      }
      if (!config.customValues[name]) {
        config.customValues[name] = {
          id: match.id,
          fieldKey: match.fieldKey,
          name: match.name,
          value: match.value,
        };
      }
      continue;
    }

    const createResponse = await ghl.post(`/locations/${locationId}/customValues`, payload);
    const created = createResponse.data.customValue || createResponse.data;
    console.log(`custom value created: ${name}`);
    config.customValues[name] = {
      id: created.id,
      fieldKey: created.fieldKey,
      name: created.name || name,
      value,
    };
  }

  saveJson(BREEDER_CONFIG_PATH, config);
  saveJson(LEGACY_CONFIG_PATH, config);
  console.log('Custom value sync complete.');
  console.log(`custom values: ${Object.keys(config.customValues).length}`);
  console.log(`config synced: ${path.relative(ROOT, BREEDER_CONFIG_PATH)}`);
  console.log(`legacy config synced: ${path.relative(ROOT, LEGACY_CONFIG_PATH)}`);
}

main().catch((error) => {
  const message = error.response?.data?.message || error.message;
  const details = error.response?.data ? JSON.stringify(error.response.data) : '';
  console.error(`Custom value sync failed: ${message}`);
  if (details && details !== JSON.stringify(message)) console.error(details);
  process.exit(1);
});
