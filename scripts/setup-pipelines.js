/**
 * setup-pipelines.js
 * Run this AFTER enabling "opportunities.write" scope on your GHL Private Integration:
 *   GHL → Settings → Private Integrations → Edit → Opportunities (Write) → Save
 *   Then regenerate or confirm the token is saved and re-run: node scripts/setup-pipelines.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const ghl = require('../ghl/client');

const locationId = process.env.GHL_LOCATION_ID;
const configPath = path.join(__dirname, '..', 'data', 'ghl-config.json');

const PIPELINES = [
  {
    name: 'HatchKit — Lead Pipeline',
    key: 'lead_pipeline',
    stages: ['New Lead', 'Contacted', 'Interested', 'Qualified', 'Customer', 'Lost'],
  },
  {
    name: 'HatchKit — Sales Pipeline',
    key: 'sales_pipeline',
    stages: [
      'Animal Selected',
      'Invoice Sent',
      'Payment Received',
      'Shipping Scheduled',
      'Shipped',
      'Delivered',
      'Follow-Up Complete',
    ],
  },
  {
    name: 'HatchKit — Shipping Pipeline',
    key: 'shipping_pipeline',
    stages: [
      'Pending Review',
      'Weather Check',
      'Approved to Ship',
      'Label Created',
      'Dropped Off',
      'In Transit',
      'Delivered',
      'LAG Confirmed',
      'Complete',
    ],
  },
];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

async function main() {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  console.log('\n━━━ Creating HatchKit Pipelines ━━━━━━━━━━━━━━━━━━━━━━');

  // Fetch existing pipelines
  const existingData = await ghl.get('/opportunities/pipelines', { locationId });
  const existing = existingData.pipelines || [];
  const existingNames = new Set(existing.map((p) => p.name.toLowerCase()));

  for (const pipeline of PIPELINES) {
    if (existingNames.has(pipeline.name.toLowerCase())) {
      const found = existing.find((p) => p.name.toLowerCase() === pipeline.name.toLowerCase());
      config.pipelines[pipeline.key] = buildPipelineEntry(found);
      console.log(`  ⏭  Skipped (already exists): ${pipeline.name}`);
    } else {
      const payload = {
        name: pipeline.name,
        locationId,
        stages: pipeline.stages.map((name, position) => ({
          name,
          position,
          showInFunnel: true,
          showInPieChart: true,
        })),
      };
      const result = await ghl.post('/opportunities/pipelines', payload);
      const created = result.pipeline || result;
      config.pipelines[pipeline.key] = buildPipelineEntry(created);
      console.log(`  ✅ Created: ${pipeline.name} → ${created.id}`);
      for (const s of created.stages || []) {
        console.log(`       [${s.position}] ${s.name} → ${s.id}`);
      }
    }
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('\n✅ Pipelines saved to data/ghl-config.json');

  // Summary
  console.log('\n━━━ Pipeline Summary ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  for (const [key, p] of Object.entries(config.pipelines)) {
    console.log(`\n  📋 ${p.name} (${p.id})`);
    for (const [, s] of Object.entries(p.stages)) {
      console.log(`       [${s.position}] ${s.name} → ${s.id}`);
    }
  }
  console.log('');
}

function buildPipelineEntry(pipeline) {
  return {
    id: pipeline.id,
    name: pipeline.name,
    stages: (pipeline.stages || []).reduce((acc, s) => {
      acc[slugify(s.name)] = { id: s.id, name: s.name, position: s.position };
      return acc;
    }, {}),
  };
}

main().catch((err) => {
  const status = err.response?.status;
  const msg = err.response?.data?.message || err.message;
  if (status === 401) {
    console.error('\n❌ Scope error — fix it:');
    console.error('   1. Go to GHL → Settings → Private Integrations');
    console.error('   2. Find your integration → Edit');
    console.error('   3. Enable: Opportunities → Read + Write');
    console.error('   4. Save, then re-run: node scripts/setup-pipelines.js');
  } else {
    console.error('Fatal error:', msg);
  }
  process.exit(1);
});
