#!/usr/bin/env node
require('dotenv').config({ quiet: true });

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const ROOT = path.join(__dirname, '..');
const SOURCE_LOCATION_ID = process.argv.find((arg) => arg.startsWith('--source='))?.split('=')[1] || 'oCn199rzTjj0rPgqXyXU';
const MASTER_LOCATION_ID = process.argv.find((arg) => arg.startsWith('--master='))?.split('=')[1] || 'H81tekJbNbeyYsnTRKVH';
const OUT_JSON = path.join(ROOT, 'docs', 'hatchkit-master-snapshot', 'snapshot-asset-inventory.json');
const OUT_MD = path.join(ROOT, 'docs', 'hatchkit-master-snapshot', 'snapshot-asset-inventory.md');

const SOURCE_TOKEN = process.env.GHL_SOURCE_PRIVATE_TOKEN || process.env.GHL_PRIVATE_TOKEN;
const MASTER_TOKEN = process.env.GHL_MASTER_PRIVATE_TOKEN || process.env.GHL_PRIVATE_TOKEN;
const BASE_URL = process.env.GHL_API_BASE || 'https://services.leadconnectorhq.com';
const VERSION = process.env.GHL_API_VERSION || '2021-07-28';
const PRODUCTS_VERSION = process.env.GHL_PRODUCTS_API_VERSION || '2023-02-21';

if (!SOURCE_TOKEN) {
  console.error('GHL_SOURCE_PRIVATE_TOKEN or GHL_PRIVATE_TOKEN is required for the source account');
  process.exit(1);
}

if (!MASTER_TOKEN) {
  console.error('GHL_MASTER_PRIVATE_TOKEN or GHL_PRIVATE_TOKEN is required for the master account');
  process.exit(1);
}

function createGhlClient(token, version) {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      Version: version,
      Accept: 'application/json',
    },
    timeout: 20000,
    validateStatus: () => true,
  });
}

const sourceClients = {
  ghl: createGhlClient(SOURCE_TOKEN, VERSION),
  ghlProducts: createGhlClient(SOURCE_TOKEN, PRODUCTS_VERSION),
};

const masterClients = {
  ghl: createGhlClient(MASTER_TOKEN, VERSION),
  ghlProducts: createGhlClient(MASTER_TOKEN, PRODUCTS_VERSION),
};

function names(items, key = 'name') {
  return (items || [])
    .map((item) => item?.[key])
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

function publicWorkflowName(name) {
  return String(name || '').replace(/^DEMO - Reptiscale -\s*/i, '').trim();
}

function comparableName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/^demo\s*-\s*reptiscale\s*-\s*/i, '')
    .replace(/^demo\s+reptiscale\s+/i, '')
    .replace(/^hk\s*-\s*/i, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

async function getOrBlocked(client, endpoint, params) {
  const response = await client.get(endpoint, { params });
  if (response.status >= 200 && response.status < 300) return { ok: true, data: response.data };
  return {
    ok: false,
    status: response.status,
    message: response.data?.message || response.data?.error || `HTTP ${response.status}`,
  };
}

async function collect(locationId, clients) {
  const [
    location,
    fields,
    tags,
    customValues,
    pipelines,
    products,
    triggerLinks,
    workflows,
  ] = await Promise.all([
    getOrBlocked(clients.ghl, `/locations/${locationId}`),
    getOrBlocked(clients.ghl, `/locations/${locationId}/customFields`),
    getOrBlocked(clients.ghl, `/locations/${locationId}/tags`),
    getOrBlocked(clients.ghl, `/locations/${locationId}/customValues`),
    getOrBlocked(clients.ghl, '/opportunities/pipelines', { locationId }),
    getOrBlocked(clients.ghlProducts, '/products/', { locationId, limit: 100 }),
    getOrBlocked(clients.ghlProducts, '/links/', { locationId }),
    getOrBlocked(clients.ghl, '/workflows/', { locationId }),
  ]);

  const fieldItems = fields.ok ? fields.data.customFields || [] : [];
  const tagItems = tags.ok ? tags.data.tags || [] : [];
  const valueItems = customValues.ok ? customValues.data.customValues || [] : [];
  const pipelineItems = pipelines.ok ? pipelines.data.pipelines || [] : [];
  const productItems = products.ok ? products.data.products || products.data.data || [] : [];
  const linkItems = triggerLinks.ok ? triggerLinks.data.links || [] : [];
  const workflowItems = workflows.ok ? workflows.data.workflows || workflows.data.data || [] : [];

  return {
    locationId,
    location: location.ok ? {
      name: location.data.location?.name || location.data.name || null,
      timezone: location.data.location?.timezone || location.data.timezone || null,
      website: location.data.location?.website || location.data.website || null,
    } : { blocked: location.message },
    counts: {
      customFields: fieldItems.length,
      tags: tagItems.length,
      customValues: valueItems.length,
      pipelines: pipelineItems.length,
      products: productItems.length,
      triggerLinks: linkItems.length,
      workflows: workflowItems.length,
    },
    blocked: {
      customFields: fields.ok ? null : fields.message,
      tags: tags.ok ? null : tags.message,
      customValues: customValues.ok ? null : customValues.message,
      pipelines: pipelines.ok ? null : pipelines.message,
      products: products.ok ? null : products.message,
      triggerLinks: triggerLinks.ok ? null : triggerLinks.message,
      workflows: workflows.ok ? null : workflows.message,
    },
    names: {
      customFields: names(fieldItems),
      tags: names(tagItems),
      customValues: names(valueItems),
      pipelines: names(pipelineItems),
      products: names(productItems),
      triggerLinks: names(linkItems),
      workflows: names(workflowItems).map(publicWorkflowName),
    },
  };
}

function diffNames(sourceNames, masterNames) {
  const masterComparable = new Set(masterNames.map(comparableName));
  return sourceNames
    .filter((name) => !masterComparable.has(comparableName(name)))
    .sort((a, b) => a.localeCompare(b));
}

function writeAudit(audit) {
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(audit, null, 2) + '\n');

  const lines = [
    '# Hatchkit Snapshot Asset Inventory',
    '',
    `Generated: ${audit.generatedAt}`,
    '',
    `Source: ${audit.source.location.name || audit.source.locationId} (${audit.source.locationId})`,
    `Master: ${audit.master.location.name || audit.master.locationId} (${audit.master.locationId})`,
    '',
    '## Counts',
    '',
    '| Asset | Source | Master |',
    '|---|---:|---:|',
  ];

  for (const key of Object.keys(audit.source.counts)) {
    lines.push(`| ${key} | ${audit.source.counts[key]} | ${audit.master.counts[key]} |`);
  }

  lines.push('', '## Master Gaps', '');
  for (const [key, value] of Object.entries(audit.gaps)) {
    if (!Array.isArray(value) || value.length === 0) continue;
    lines.push(`### ${key}`, '');
    for (const item of value) lines.push(`- ${item}`);
    lines.push('');
  }

  const sourceBlocked = Object.entries(audit.source.blocked).filter(([, value]) => value);
  if (sourceBlocked.length > 0) {
    lines.push('## Source API Blockers', '');
    for (const [key, value] of sourceBlocked) lines.push(`- ${key}: ${value}`);
    lines.push('');
  }

  const masterBlocked = Object.entries(audit.master.blocked).filter(([, value]) => value);
  if (masterBlocked.length > 0) {
    lines.push('## Master API Blockers', '');
    for (const [key, value] of masterBlocked) lines.push(`- ${key}: ${value}`);
    lines.push('');
  }

  fs.writeFileSync(OUT_MD, `${lines.join('\n')}\n`);
}

async function main() {
  const [source, master] = await Promise.all([
    collect(SOURCE_LOCATION_ID, sourceClients),
    collect(MASTER_LOCATION_ID, masterClients),
  ]);

  const gaps = {
    customFields: diffNames(source.names.customFields, master.names.customFields),
    tags: diffNames(source.names.tags, master.names.tags),
    customValues: diffNames(source.names.customValues, master.names.customValues),
    pipelines: diffNames(source.names.pipelines, master.names.pipelines),
    products: diffNames(source.names.products, master.names.products),
    triggerLinks: diffNames(source.names.triggerLinks, master.names.triggerLinks),
    workflows: diffNames(source.names.workflows, master.names.workflows),
  };

  const audit = {
    generatedAt: new Date().toISOString(),
    source,
    master,
    gaps,
    strategy: {
      sourceSnapshot: 'Use SunScale as the prototype/source snapshot only after reusable storefront, listing, funnel, and workflow assets are complete.',
      masterSnapshot: 'Import the source snapshot into Hatchkit Master, sanitize names/copy/timing/placeholders, QA, then export the real customer snapshot.',
    },
  };

  writeAudit(audit);

  console.log(`Snapshot asset inventory written: ${path.relative(ROOT, OUT_JSON)}`);
  console.log(`Snapshot asset inventory summary: ${path.relative(ROOT, OUT_MD)}`);
  console.log(`source counts: ${JSON.stringify(source.counts)}`);
  console.log(`master counts: ${JSON.stringify(master.counts)}`);
  const sourceBlocked = Object.entries(source.blocked).filter(([, value]) => value);
  if (sourceBlocked.length > 0) {
    console.log('source blockers:');
    for (const [key, value] of sourceBlocked) console.log(`- ${key}: ${value}`);
  }
  const blocked = Object.entries(master.blocked).filter(([, value]) => value);
  if (blocked.length > 0) {
    console.log('master blockers:');
    for (const [key, value] of blocked) console.log(`- ${key}: ${value}`);
  }
}

main().catch((error) => {
  console.error(`Snapshot asset inventory failed: ${error.response?.data?.message || error.message}`);
  process.exit(1);
});
