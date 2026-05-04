require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createContact, updateContact, addTag, moveContactPipelineStage } = require('../ghl/contacts');
const { sendSMS } = require('../ghl/conversations');

// Load config — pipelines optional (may not exist on fresh subaccount)
const configPath = path.join(__dirname, '..', 'data', 'ghl-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const SHOW_NAME = 'NARBC Arlington 2026';
const SHOW_TAG = 'show:narbc-arlington-2026';
const INTEREST_TAG = 'interest:leopard-gecko';

// Simulated show attendee who scanned QR code at the table
const DEMO_CONTACT = {
  firstName: 'Jordan',
  lastName: 'Rivera',
  email: `jordan.rivera.demo.${Date.now()}@example.com`, // unique to avoid duplicates
  phone: '+19195550147',
  tags: [SHOW_TAG, INTEREST_TAG, 'source:show-qr'],
  customFields: buildCustomFields({
    show_source: 'NARBC Arlington',
    species_interest: 'Leopard Gecko',
    price_tier: 'Mid-Range ($75-250)',
    last_show_attended: SHOW_NAME,
    lead_score: '10',
  }),
};

function buildCustomFields(values) {
  const fieldMap = config.customFields || {};
  return Object.entries(values)
    .filter(([key]) => fieldMap[key]?.id)
    .map(([key, value]) => ({ id: fieldMap[key].id, value: String(value) }));
}

const SMS_WELCOME = `Hey Jordan! You're in 🦎 Thanks for visiting SunScale Geckos at ${SHOW_NAME}. I'll send a few follow-ups with available animals and care tips. Reply STOP anytime. — Sarah @ SunScale`;

async function main() {
  console.log('\n━━━ Simulating Show Lead Capture ━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Show: ${SHOW_NAME}`);
  console.log('Scenario: Attendee scanned QR code at table, opted in via mobile form\n');

  // ── 1. Create Contact ──────────────────────────────────────────────────────
  console.log('Step 1: Creating contact...');
  let contact;
  try {
    contact = await createContact(DEMO_CONTACT);
    console.log(`  ✅ Contact created: ${contact.firstName} ${contact.lastName}`);
    console.log(`     ID: ${contact.id}`);
    console.log(`     Email: ${contact.email}`);
    console.log(`     Phone: ${contact.phone}`);
  } catch (err) {
    console.error(`  ❌ Failed to create contact: ${err.response?.data?.message || err.message}`);
    process.exit(1);
  }

  // ── 2. Add Tags ────────────────────────────────────────────────────────────
  console.log('\nStep 2: Adding show tags...');
  try {
    await addTag(contact.id, [SHOW_TAG, INTEREST_TAG, 'source:show-qr', 'status:new-lead']);
    console.log(`  ✅ Tags added: ${SHOW_TAG}, ${INTEREST_TAG}, source:show-qr, status:new-lead`);
  } catch (err) {
    console.warn(`  ⚠️  Tagging failed (non-fatal): ${err.response?.data?.message || err.message}`);
  }

  // ── 3. Move to Pipeline Stage ──────────────────────────────────────────────
  console.log('\nStep 3: Adding to Lead Pipeline — "New Lead" stage...');
  const leadPipeline = config.pipelines?.lead_pipeline;
  if (!leadPipeline?.id) {
    console.warn('  ⚠️  Lead Pipeline not configured in ghl-config.json yet.');
    console.warn('     Create the HatchKit pipelines in GHL UI then run: node scripts/sync-pipelines.js');
  } else {
    const newLeadStage = leadPipeline.stages?.new_lead;
    if (!newLeadStage?.id) {
      console.warn('  ⚠️  "New Lead" stage ID not found in config.');
    } else {
      try {
        const opp = await moveContactPipelineStage(contact.id, leadPipeline.id, newLeadStage.id);
        console.log(`  ✅ Added to Lead Pipeline — "New Lead" stage`);
        console.log(`     Opportunity ID: ${opp.id || opp}`);
      } catch (err) {
        console.warn(`  ⚠️  Pipeline stage failed (non-fatal): ${err.response?.data?.message || err.message}`);
      }
    }
  }

  // ── 4. Send Welcome SMS ────────────────────────────────────────────────────
  console.log('\nStep 4: Sending welcome SMS...');
  try {
    await sendSMS(contact.id, SMS_WELCOME);
    console.log('  ✅ Welcome SMS sent');
    console.log(`     Message: "${SMS_WELCOME}"`);
  } catch (err) {
    console.warn(`  ⚠️  SMS failed (non-fatal — phone number may not be SMS-capable): ${err.response?.data?.message || err.message}`);
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n━━━ Summary ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Contact:       ${contact.firstName} ${contact.lastName} (${contact.id})`);
  console.log(`  Show:          ${SHOW_NAME}`);
  console.log(`  Tags:          ${SHOW_TAG}, ${INTEREST_TAG}`);
  console.log(`  Pipeline:      ${leadPipeline ? 'Lead Pipeline → New Lead' : 'Not configured yet'}`);
  console.log(`  Custom Fields: ${DEMO_CONTACT.customFields.length} set`);
  console.log(`  SMS:           Welcome message sent`);
  console.log('\n  Next automated steps (via GHL workflow):'  );
  console.log('    Day 1:  Show welcome email');
  console.log('    Day 3:  Featured animals email');
  console.log('    Day 7:  Care guide email');
  console.log('    Day 14: 10% off offer email');
  console.log('');
}

main().catch((err) => {
  console.error('Fatal error:', err.response?.data || err.message);
  process.exit(1);
});
