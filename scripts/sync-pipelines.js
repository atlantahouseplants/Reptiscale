/**
 * sync-pipelines.js
 * Run this AFTER manually creating the 3 HatchKit pipelines in GHL UI.
 * Fetches all pipelines, finds the HatchKit ones by name, and saves their
 * IDs + stage IDs into data/ghl-config.json.
 *
 * Usage: node scripts/sync-pipelines.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const ghl = require('../ghl/client');

const locationId = process.env.GHL_LOCATION_ID;
const configPath = path.join(__dirname, '..', 'data', 'ghl-config.json');

const EXPECTED_PIPELINES = [
  { key: 'lead_pipeline',     name: 'HatchKit — Lead Pipeline' },
  { key: 'sales_pipeline',    name: 'HatchKit — Sales Pipeline' },
  { key: 'shipping_pipeline', name: 'HatchKit — Shipping Pipeline' },
];

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

async function main() {
  console.log('\nFetching pipelines from GHL...\n');

  const data = await ghl.get('/opportunities/pipelines', { locationId });
  const all = data.pipelines || [];

  console.log(`Found ${all.length} total pipeline(s) in location.\n`);

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const found = [];
  const missing = [];

  for (const expected of EXPECTED_PIPELINES) {
    const match = all.find(p => p.name.trim() === expected.name.trim());

    if (!match) {
      missing.push(expected.name);
      console.log(`  ❌ NOT FOUND: "${expected.name}"`);
      continue;
    }

    config.pipelines[expected.key] = {
      id: match.id,
      name: match.name,
      stages: (match.stages || []).reduce((acc, s) => {
        acc[slugify(s.name)] = { id: s.id, name: s.name, position: s.position };
        return acc;
      }, {}),
    };

    console.log(`  ✅ Found: ${match.name} → ${match.id}`);
    for (const s of match.stages || []) {
      console.log(`       [${s.position}] ${s.name} → ${s.id}`);
    }
    found.push(expected.name);
  }

  if (found.length > 0) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`\n✅ Saved ${found.length} pipeline(s) to data/ghl-config.json`);
  }

  if (missing.length > 0) {
    console.log('\n⚠️  Missing pipelines (create these in GHL UI then re-run):');
    missing.forEach(name => console.log(`   • ${name}`));
    console.log('\n   GHL → Opportunities → Settings → Pipelines → + New Pipeline');
  }

  if (missing.length === 0) {
    console.log('\n🎉 All 3 HatchKit pipelines synced. CRM foundation complete!\n');
  }
}

main().catch(err => {
  console.error('Error:', err.response?.data?.message || err.message);
  process.exit(1);
});
