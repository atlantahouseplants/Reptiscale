require('dotenv').config();
const fs = require('fs');
const path = require('path');
const ghl = require('../ghl/client');

const locationId = process.env.GHL_LOCATION_ID;

// ─── Custom Field Definitions ────────────────────────────────────────────────

// GHL API v2: dropdowns use dataType "SINGLE_OPTIONS" with options: [string[]]
const CUSTOM_FIELDS = [
  {
    name: 'Species Interest',
    dataType: 'SINGLE_OPTIONS',
    model: 'contact',
    options: ['Leopard Gecko', 'Ball Python', 'Crested Gecko', 'Bearded Dragon', 'Corn Snake', 'Other'],
  },
  {
    name: 'Morph Preference',
    dataType: 'TEXT',
    model: 'contact',
  },
  {
    name: 'Price Tier',
    dataType: 'SINGLE_OPTIONS',
    model: 'contact',
    options: ['Budget ($25-75)', 'Mid-Range ($75-250)', 'Premium ($250-750)', 'Designer ($750+)'],
  },
  {
    name: 'Shipping Preference',
    dataType: 'SINGLE_OPTIONS',
    model: 'contact',
    options: ['Ship to Home', 'Hold at FedEx', 'Local Pickup', 'Show Pickup'],
  },
  {
    name: 'Temperature Tolerance Min',
    dataType: 'NUMERICAL',
    model: 'contact',
  },
  {
    name: 'Temperature Tolerance Max',
    dataType: 'NUMERICAL',
    model: 'contact',
  },
  {
    name: 'Show Source',
    dataType: 'SINGLE_OPTIONS',
    model: 'contact',
    options: [
      'NARBC Arlington',
      'Tinley Park',
      'Hamburg',
      'Southeast Reptile Expo',
      'Reptile Super Show',
      'Online',
      'Referral',
      'Other',
    ],
  },
  {
    name: 'Lead Score',
    dataType: 'NUMERICAL',
    model: 'contact',
  },
  {
    name: 'Last Show Attended',
    dataType: 'TEXT',
    model: 'contact',
  },
  {
    name: 'Shipping Status',
    dataType: 'SINGLE_OPTIONS',
    model: 'contact',
    options: [
      'Not Started',
      'Pending Weather Check',
      'Approved to Ship',
      'Label Created',
      'In Transit',
      'Delivered',
      'LAG Confirmed',
    ],
  },
];

// ─── Pipeline Definitions ─────────────────────────────────────────────────────

const PIPELINES = [
  {
    name: 'HatchKit — Lead Pipeline',
    stages: ['New Lead', 'Contacted', 'Interested', 'Qualified', 'Customer', 'Lost'],
  },
  {
    name: 'HatchKit — Sales Pipeline',
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

async function createCustomField(field) {
  const payload = {
    name: field.name,
    dataType: field.dataType,
    model: field.model,
  };
  if (field.options) {
    payload.options = field.options;
  }
  const result = await ghl.post(`/locations/${locationId}/customFields`, payload);
  return result.customField || result;
}

async function createPipeline(pipeline) {
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
  return result.pipeline || result;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const config = {
    locationId,
    customFields: {},
    pipelines: {},
  };

  // ── Step 1: Create Custom Fields ──────────────────────────────────────────

  console.log('\n━━━ Creating Custom Fields ━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Fetch existing fields to avoid duplicates
  const existing = await ghl.get(`/locations/${locationId}/customFields`);
  const existingNames = new Set(
    (existing.customFields || []).map((f) => f.name.toLowerCase())
  );

  for (const field of CUSTOM_FIELDS) {
    const key = slugify(field.name);
    if (existingNames.has(field.name.toLowerCase())) {
      // Find the existing field's ID
      const found = (existing.customFields || []).find(
        (f) => f.name.toLowerCase() === field.name.toLowerCase()
      );
      config.customFields[key] = {
        id: found.id,
        fieldKey: found.fieldKey,
        name: found.name,
        dataType: found.dataType,
      };
      console.log(`  ⏭  Skipped (already exists): ${field.name}`);
    } else {
      try {
        const created = await createCustomField(field);
        config.customFields[key] = {
          id: created.id,
          fieldKey: created.fieldKey,
          name: created.name,
          dataType: created.dataType,
        };
        console.log(`  ✅ Created: ${field.name} → ${created.id}`);
      } catch (err) {
        console.error(`  ❌ Failed: ${field.name} — ${err.response?.data?.message || err.message}`);
      }
    }
  }

  // ── Step 2: Create Pipelines ──────────────────────────────────────────────

  console.log('\n━━━ Creating Pipelines ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Fetch existing pipelines to avoid duplicates
  const existingPipelines = await ghl.get('/opportunities/pipelines', { locationId });
  const existingPipelineNames = new Set(
    (existingPipelines.pipelines || []).map((p) => p.name.toLowerCase())
  );

  for (const pipeline of PIPELINES) {
    const key = slugify(pipeline.name.replace('HatchKit — ', '').replace(' Pipeline', '').trim() + '_pipeline');

    if (existingPipelineNames.has(pipeline.name.toLowerCase())) {
      const found = (existingPipelines.pipelines || []).find(
        (p) => p.name.toLowerCase() === pipeline.name.toLowerCase()
      );
      config.pipelines[key] = {
        id: found.id,
        name: found.name,
        stages: found.stages.reduce((acc, s) => {
          acc[slugify(s.name)] = { id: s.id, name: s.name, position: s.position };
          return acc;
        }, {}),
      };
      console.log(`  ⏭  Skipped (already exists): ${pipeline.name}`);
    } else {
      try {
        const created = await createPipeline(pipeline);
        config.pipelines[key] = {
          id: created.id,
          name: created.name,
          stages: (created.stages || []).reduce((acc, s) => {
            acc[slugify(s.name)] = { id: s.id, name: s.name, position: s.position };
            return acc;
          }, {}),
        };
        console.log(`  ✅ Created: ${pipeline.name} → ${created.id}`);
        for (const stage of created.stages || []) {
          console.log(`       Stage: ${stage.name} → ${stage.id}`);
        }
      } catch (err) {
        const status = err.response?.status;
        const msg = err.response?.data?.message || err.message;
        if (status === 401) {
          console.warn(`  ⚠️  Scope missing: ${pipeline.name}`);
          console.warn(`     → Add "opportunities.write" to your Private Integration in GHL:`);
          console.warn(`       Settings → Private Integrations → Edit → enable Opportunities (Write)`);
        } else {
          console.error(`  ❌ Failed: ${pipeline.name} — ${msg}`);
        }
      }
    }
  }

  // ── Step 3: Save config ───────────────────────────────────────────────────

  const configPath = path.join(__dirname, '..', 'data', 'ghl-config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`\n✅ Config saved to data/ghl-config.json`);

  // ── Step 4: Verify ────────────────────────────────────────────────────────

  console.log('\n━━━ Verification Summary ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\nCustom Fields:');
  for (const [key, f] of Object.entries(config.customFields)) {
    console.log(`  ${f.name.padEnd(30)} ${f.dataType.padEnd(12)} → ${f.id}`);
  }

  console.log('\nPipelines:');
  for (const [key, p] of Object.entries(config.pipelines)) {
    console.log(`\n  📋 ${p.name} (${p.id})`);
    for (const [, s] of Object.entries(p.stages)) {
      console.log(`       [${s.position}] ${s.name} → ${s.id}`);
    }
  }

  console.log('\n✅ CRM foundation complete.\n');
}

main().catch((err) => {
  console.error('Fatal error:', err.response?.data || err.message);
  process.exit(1);
});
