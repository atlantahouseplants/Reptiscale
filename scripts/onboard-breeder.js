/**
 * onboard-breeder.js — Master Breeder Onboarding Script
 *
 * Sets up everything code-controllable for a new breeder:
 *   1. Validates breeder config
 *   2. Creates per-breeder directory and config files
 *   3. Creates custom fields + pipelines in GHL (via API)
 *   4. Customizes email/SMS templates with breeder branding
 *   5. Runs connection tests
 *   6. Outputs summary + remaining manual steps
 *
 * Usage:
 *   Interactive:  node scripts/onboard-breeder.js
 *   From file:    node scripts/onboard-breeder.js --config path/to/intake.json
 *   Demo:         node scripts/onboard-breeder.js --demo
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const BREEDERS_DIR = path.join(__dirname, '..', 'data', 'breeders');
const { shouldCreatePipeline, getTierConfig } = require('../lib/feature-gates');
const { customizeAllTemplates } = require('./customize-templates');

// ─── Interactive Prompts ─────────────────────────────────────────────────────

function createRL() {
  return readline.createInterface({ input: process.stdin, output: process.stdout });
}

async function ask(rl, question, defaultVal = '') {
  return new Promise((resolve) => {
    const prompt = defaultVal ? `${question} [${defaultVal}]: ` : `${question}: `;
    rl.question(prompt, (answer) => resolve(answer.trim() || defaultVal));
  });
}

async function collectBreederInfo() {
  const rl = createRL();

  console.log('\n━━━ HatchKit Breeder Onboarding ━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Enter the new breeder\'s information:\n');

  const info = {};
  info.businessName = await ask(rl, 'Business name');
  info.clientId = await ask(rl, 'Client ID (URL-safe slug)', info.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-'));
  info.ownerName = await ask(rl, 'Owner full name');
  info.ownerFirstName = info.ownerName.split(' ')[0];
  info.ownerEmail = await ask(rl, 'Owner email');
  info.ownerPhone = await ask(rl, 'Owner phone (with country code, e.g. +1...)');
  info.location = await ask(rl, 'Location (City, State)');
  info.breederZip = await ask(rl, 'Breeder ZIP code');
  info.timezone = await ask(rl, 'Timezone', 'America/New_York');

  const speciesInput = await ask(rl, 'Species they breed (comma-separated)', 'Leopard Gecko');
  info.species = speciesInput.split(',').map(s => s.trim());

  const morphInput = await ask(rl, 'Morphs they sell (comma-separated)', '');
  info.morphs = morphInput ? morphInput.split(',').map(s => s.trim()) : [];

  const priceMin = await ask(rl, 'Minimum price ($)', '50');
  const priceMax = await ask(rl, 'Maximum price ($)', '500');
  info.priceRange = { min: parseInt(priceMin), max: parseInt(priceMax) };

  info.brandVoice = await ask(rl, 'Brand voice description (how do they talk?)', 'Friendly, knowledgeable, passionate about their animals');

  const primaryColor = await ask(rl, 'Primary brand color (hex)', '#1B5E20');
  const accentColor = await ask(rl, 'Accent brand color (hex)', '#E65100');
  info.brandColors = { primary: primaryColor, accent: accentColor };

  info.tier = await ask(rl, 'Pricing tier (starter/growth/pro)', 'growth');

  const ghlLocationId = await ask(rl, 'GHL Location ID (from sub-account)');
  const ghlToken = await ask(rl, 'GHL Private Integration Token (or press Enter to use default from .env)', '');

  info.ghlLocationId = ghlLocationId;
  info.ghlToken = ghlToken || process.env.GHL_PRIVATE_TOKEN;

  info.active = true;
  info.autoPublish = false;
  info.platforms = ['instagram'];
  info.instagramPageId = null;
  info.facebookPageId = null;
  info.inventoryCount = 0;
  info.showSchedule = [];

  rl.close();
  return info;
}

// ─── Demo Config ─────────────────────────────────────────────────────────────

function getDemoConfig() {
  return {
    clientId: 'sunscale-geckos',
    businessName: 'SunScale Geckos',
    ownerName: 'Sarah Mitchell',
    ownerFirstName: 'Sarah',
    ownerEmail: 'sarah@sunscalegeckos.com',
    ownerPhone: '+19195550100',
    location: 'Raleigh, NC',
    breederZip: '27601',
    timezone: 'America/New_York',
    species: ['Crested Gecko', 'Leopard Gecko'],
    morphs: ['Lilly White', 'Harlequin', 'Dalmatian', 'Pinstripe', 'Tricolor', 'Phantom'],
    priceRange: { min: 75, max: 3500 },
    brandVoice: 'Warm, knowledgeable, and safety-first.',
    brandColors: { primary: '#1B5E20', accent: '#E65100' },
    tier: 'growth',
    ghlLocationId: process.env.GHL_LOCATION_ID || 'WqufL3g68csT0LiuvBkt',
    ghlToken: process.env.GHL_PRIVATE_TOKEN,
    active: true,
    autoPublish: false,
    platforms: ['instagram'],
    instagramPageId: null,
    facebookPageId: null,
    inventoryCount: 14,
    showSchedule: [
      { name: 'Southeast Reptile Expo', location: 'Raleigh, NC', date: '2026-04-04', type: 'expo' },
    ],
  };
}

// ─── Validation ──────────────────────────────────────────────────────────────

function validate(info) {
  const required = ['clientId', 'businessName', 'ownerName', 'tier', 'ghlLocationId'];
  const missing = required.filter(k => !info[k]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  if (!['starter', 'growth', 'pro'].includes(info.tier)) {
    throw new Error(`Invalid tier: ${info.tier}. Must be starter, growth, or pro`);
  }
  return true;
}

// ─── Main Onboarding Flow ────────────────────────────────────────────────────

async function onboard(info) {
  console.log('\n━━━ Starting Onboarding ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`  Business:  ${info.businessName}`);
  console.log(`  Client ID: ${info.clientId}`);
  console.log(`  Owner:     ${info.ownerName}`);
  console.log(`  Tier:      ${info.tier.toUpperCase()}`);
  console.log(`  Location:  ${info.ghlLocationId}`);
  console.log('');

  const tierConfig = getTierConfig(info.tier);

  // ── Step 1: Create per-breeder directory ──────────────────────────────

  console.log('1. Creating breeder directory...');
  const breederDir = path.join(BREEDERS_DIR, info.clientId);
  fs.mkdirSync(breederDir, { recursive: true });

  // Save client config
  const clientConfig = { ...info };
  delete clientConfig.ghlToken; // Don't store the token in client.json
  fs.writeFileSync(
    path.join(breederDir, 'client.json'),
    JSON.stringify(clientConfig, null, 2)
  );
  console.log(`   ✅ Created data/breeders/${info.clientId}/client.json`);

  // ── Step 2: Create GHL config (attempt API setup) ─────────────────────

  console.log('\n2. Setting up GHL...');

  let ghlConfig = {
    locationId: info.ghlLocationId,
    customFields: {},
    pipelines: {},
  };

  if (info.ghlToken && info.ghlLocationId) {
    try {
      // Try to create custom fields and pipelines via API
      const axios = require('axios');
      const BASE_URL = process.env.GHL_API_BASE || 'https://services.leadconnectorhq.com';
      const VERSION = process.env.GHL_API_VERSION || '2021-07-28';

      const ghlApi = axios.create({
        baseURL: BASE_URL,
        headers: {
          Authorization: `Bearer ${info.ghlToken}`,
          Version: VERSION,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });

      // Test connection
      const locationData = await ghlApi.get(`/locations/${info.ghlLocationId}`);
      const locationName = locationData.data?.location?.name || locationData.data?.name || 'Unknown';
      console.log(`   ✅ Connected to GHL: "${locationName}"`);

      // Fetch existing custom fields
      const existingFields = await ghlApi.get(`/locations/${info.ghlLocationId}/customFields`);
      const existingFieldNames = new Set(
        (existingFields.data?.customFields || []).map(f => f.name.toLowerCase())
      );

      // Create custom fields (same definitions as setup-crm.js)
      const FIELDS = [
        { name: 'Species Interest', dataType: 'SINGLE_OPTIONS', model: 'contact', options: info.species.concat(['Other']) },
        { name: 'Morph Preference', dataType: 'TEXT', model: 'contact' },
        { name: 'Price Tier', dataType: 'SINGLE_OPTIONS', model: 'contact', options: ['Budget ($25-75)', 'Mid-Range ($75-250)', 'Premium ($250-750)', 'Designer ($750+)'] },
        { name: 'Shipping Preference', dataType: 'SINGLE_OPTIONS', model: 'contact', options: ['Ship to Home', 'Hold at FedEx', 'Local Pickup', 'Show Pickup'] },
        { name: 'Temperature Tolerance Min', dataType: 'NUMERICAL', model: 'contact' },
        { name: 'Temperature Tolerance Max', dataType: 'NUMERICAL', model: 'contact' },
        { name: 'Show Source', dataType: 'SINGLE_OPTIONS', model: 'contact', options: ['Online', 'Referral', 'Other'] },
        { name: 'Lead Score', dataType: 'NUMERICAL', model: 'contact' },
        { name: 'Last Show Attended', dataType: 'TEXT', model: 'contact' },
        { name: 'Shipping Status', dataType: 'SINGLE_OPTIONS', model: 'contact', options: ['Not Started', 'Pending Weather Check', 'Approved to Ship', 'Label Created', 'In Transit', 'Delivered', 'LAG Confirmed'] },
      ];

      const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

      for (const field of FIELDS) {
        const key = slugify(field.name);
        if (existingFieldNames.has(field.name.toLowerCase())) {
          const found = (existingFields.data?.customFields || []).find(f => f.name.toLowerCase() === field.name.toLowerCase());
          ghlConfig.customFields[key] = { id: found.id, fieldKey: found.fieldKey, name: found.name, dataType: found.dataType };
          console.log(`   ⏭  Field exists: ${field.name}`);
        } else {
          try {
            const payload = { name: field.name, dataType: field.dataType, model: field.model };
            if (field.options) payload.options = field.options;
            const result = await ghlApi.post(`/locations/${info.ghlLocationId}/customFields`, payload);
            const created = result.data?.customField || result.data;
            ghlConfig.customFields[key] = { id: created.id, fieldKey: created.fieldKey, name: created.name, dataType: created.dataType };
            console.log(`   ✅ Created field: ${field.name}`);
          } catch (err) {
            console.warn(`   ⚠️  Failed to create field: ${field.name} — ${err.response?.data?.message || err.message}`);
          }
        }
      }

      // Create pipelines based on tier
      const PIPELINES = [
        { name: 'HatchKit — Lead Pipeline', key: 'lead_pipeline', stages: ['New Lead', 'Contacted', 'Interested', 'Qualified', 'Customer', 'Lost'] },
        { name: 'HatchKit — Sales Pipeline', key: 'sales_pipeline', stages: ['Animal Selected', 'Invoice Sent', 'Payment Received', 'Shipping Scheduled', 'Shipped', 'Delivered', 'Follow-Up Complete'] },
        { name: 'HatchKit — Shipping Pipeline', key: 'shipping_pipeline', stages: ['Pending Review', 'Weather Check', 'Approved to Ship', 'Label Created', 'Dropped Off', 'In Transit', 'Delivered', 'LAG Confirmed', 'Complete'] },
      ];

      const existingPipelines = await ghlApi.get('/opportunities/pipelines', { params: { locationId: info.ghlLocationId } });
      const existingPipelineNames = new Set((existingPipelines.data?.pipelines || []).map(p => p.name.toLowerCase()));

      for (const pipeline of PIPELINES) {
        if (!shouldCreatePipeline(info.tier, pipeline.key)) {
          console.log(`   ⏭  Pipeline skipped (not in ${info.tier} tier): ${pipeline.name}`);
          continue;
        }

        if (existingPipelineNames.has(pipeline.name.toLowerCase())) {
          const found = (existingPipelines.data?.pipelines || []).find(p => p.name.toLowerCase() === pipeline.name.toLowerCase());
          ghlConfig.pipelines[pipeline.key] = {
            id: found.id,
            name: found.name,
            stages: (found.stages || []).reduce((acc, s) => {
              acc[slugify(s.name)] = { id: s.id, name: s.name, position: s.position };
              return acc;
            }, {}),
          };
          console.log(`   ⏭  Pipeline exists: ${pipeline.name}`);
        } else {
          try {
            const payload = {
              name: pipeline.name,
              locationId: info.ghlLocationId,
              stages: pipeline.stages.map((name, position) => ({ name, position, showInFunnel: true, showInPieChart: true })),
            };
            const result = await ghlApi.post('/opportunities/pipelines', payload);
            const created = result.data?.pipeline || result.data;
            ghlConfig.pipelines[pipeline.key] = {
              id: created.id,
              name: created.name,
              stages: (created.stages || []).reduce((acc, s) => {
                acc[slugify(s.name)] = { id: s.id, name: s.name, position: s.position };
                return acc;
              }, {}),
            };
            console.log(`   ✅ Created pipeline: ${pipeline.name}`);
          } catch (err) {
            console.warn(`   ⚠️  Failed to create pipeline: ${pipeline.name} — ${err.response?.data?.message || err.message}`);
          }
        }
      }

    } catch (err) {
      console.warn(`   ⚠️  GHL API setup failed: ${err.response?.data?.message || err.message}`);
      console.warn('   → You can set up fields and pipelines manually, then run sync-pipelines.js');
    }
  } else {
    console.log('   ⏭  No GHL token provided — skipping API setup');
    console.log('   → Create fields and pipelines manually, then run sync-pipelines.js');
  }

  // Save GHL config. Tokens stay in .env and are never persisted to JSON.
  delete ghlConfig.token;
  fs.writeFileSync(
    path.join(breederDir, 'ghl-config.json'),
    JSON.stringify(ghlConfig, null, 2)
  );
  console.log(`   ✅ Saved data/breeders/${info.clientId}/ghl-config.json`);

  // ── Step 3: Customize templates ───────────────────────────────────────

  console.log('\n3. Customizing templates...');
  const templateResults = customizeAllTemplates(clientConfig);
  console.log(`   ✅ Emails: ${templateResults.emails.length} templates`);
  console.log(`   ✅ SMS: ${templateResults.sms.length} templates`);

  // ── Step 4: Connection tests ──────────────────────────────────────────

  console.log('\n4. Running connection tests...');

  // Weather API
  const weatherKey = process.env.OPENWEATHERMAP_API_KEY;
  if (weatherKey) {
    console.log('   ✅ Weather API key configured');
  } else {
    console.log('   ⚠️  OPENWEATHERMAP_API_KEY not set — shipping agent will use fallback rules');
  }

  // Claude API
  const claudeKey = process.env.ANTHROPIC_API_KEY;
  if (claudeKey) {
    console.log('   ✅ Claude API key configured');
  } else {
    console.log('   ⚠️  ANTHROPIC_API_KEY not set — AI features will use rule-based fallback');
  }

  // ── Step 5: Summary ───────────────────────────────────────────────────

  console.log('\n━━━ Onboarding Complete ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`  ✅ ${info.businessName} (${info.clientId}) is registered`);
  console.log(`  ✅ Tier: ${info.tier.toUpperCase()} ($${tierConfig.price.monthly}/mo + $${tierConfig.price.setup} setup)`);
  console.log(`  ✅ Config: data/breeders/${info.clientId}/`);
  console.log(`  ✅ Templates: data/breeders/${info.clientId}/templates/`);

  console.log('\n  📋 REMAINING MANUAL STEPS:');
  console.log('  ─────────────────────────────────────────────────────');
  console.log('  1. In GHL UI: Import email templates from the templates folder');
  console.log('  2. In GHL UI: Create all 10 workflows (see docs/ghl-workflows.md)');
  console.log('  3. In GHL UI: Set webhook URLs to your deployed server');
  console.log('  4. In GHL UI: Upload breeder\'s logo');
  console.log('  5. In GHL UI: Create Show QR Landing Page');
  console.log('  6. Deploy webhook server: vercel --prod');
  console.log('  7. In Make.com: Import scenario blueprints');
  console.log('  8. Test: node scripts/simulate-show-lead.js');
  console.log('  9. Test: node scripts/test-shipping-agent.js');
  console.log('  10. Go live: enable workflows + print QR codes\n');

  return { clientId: info.clientId, breederDir, ghlConfig };
}

// ─── CLI Entry Point ─────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  let info;

  if (args.includes('--demo')) {
    info = getDemoConfig();
    console.log('\n  Running in DEMO mode with SunScale Geckos config\n');
  } else if (args.includes('--config')) {
    const configPath = args[args.indexOf('--config') + 1];
    if (!fs.existsSync(configPath)) {
      console.error(`Config file not found: ${configPath}`);
      process.exit(1);
    }
    info = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (!info.ownerFirstName && info.ownerName) {
      info.ownerFirstName = info.ownerName.split(' ')[0];
    }
  } else {
    info = await collectBreederInfo();
  }

  validate(info);
  await onboard(info);
}

main().catch((err) => {
  console.error('\n❌ Onboarding failed:', err.message);
  process.exit(1);
});
