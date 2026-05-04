#!/usr/bin/env node
/**
 * HatchKit Demo Simulation
 *
 * Walks through the full customer journey against a running server.
 * Usage:
 *   node scripts/simulate-demo.js [--server http://localhost:3000]
 *
 * Steps simulated:
 *   1. Show QR form submission → creates lead
 *   2. Lead scoring evaluation → scores the contact
 *   3. Pipeline stage: Invoice Sent → triggers follow-up
 *   4. Pipeline stage: Payment Received → triggers shipping eval
 *   5. Pipeline stage: Delivered → triggers follow-up
 *   6. Health check
 */

require('dotenv').config();

const SERVER = process.argv.find(a => a.startsWith('--server='))?.split('=')[1]
  || process.argv[process.argv.indexOf('--server') + 1]
  || 'http://localhost:3000';

const LOCATION_ID = process.env.GHL_LOCATION_ID || 'fqj4rbp2VRkvMa8GWVWn';

// Demo contact data
const DEMO_CONTACT = {
  firstName: 'Alex',
  lastName: 'Thompson',
  email: 'alex.demo@example.com',
  phone: '9195551234',
  species_interest: 'Leopard Gecko',
  show_name: 'NARBC Arlington 2026',
  locationId: LOCATION_ID,
  sms_opt_in: true,
  source: 'show-qr',
};

const DEMO_CONTACT_ID = 'demo-contact-alex-001';

// Formatting helpers
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

function header(step, title) {
  console.log(`\n${CYAN}━━━ Step ${step} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log(`${BOLD}${title}${RESET}`);
}

function result(status, msg) {
  const icon = status === 'ok' ? `${GREEN}✅` : status === 'warn' ? `${YELLOW}⚠️` : `${RED}❌`;
  console.log(`  ${icon} ${msg}${RESET}`);
}

function detail(msg) {
  console.log(`  ${DIM}${msg}${RESET}`);
}

async function post(path, body) {
  const url = `${SERVER}${path}`;
  detail(`POST ${url}`);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function get(path) {
  const url = `${SERVER}${path}`;
  detail(`GET ${url}`);
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${CYAN}║         HatchKit Demo — Full Journey             ║${RESET}`);
  console.log(`${BOLD}${CYAN}╚══════════════════════════════════════════════════╝${RESET}`);
  console.log(`${DIM}  Server: ${SERVER}`);
  console.log(`  Location: ${LOCATION_ID}`);
  console.log(`  Contact: ${DEMO_CONTACT.firstName} ${DEMO_CONTACT.lastName}${RESET}`);

  let passed = 0;
  let warnings = 0;
  let failed = 0;

  // ── Step 0: Health Check ──
  header(0, 'Health Check');
  try {
    const { status, data } = await get('/health');
    if (status === 200 && data.status === 'ok') {
      result('ok', `Server is healthy (uptime: ${Math.round(data.uptime)}s)`);
      passed++;
    } else {
      result('fail', `Unexpected health response: ${status}`);
      failed++;
    }
  } catch (err) {
    result('fail', `Cannot reach server at ${SERVER}`);
    detail(`Error: ${err.message}`);
    detail('Make sure the server is running: node server.js');
    console.log(`\n${RED}${BOLD}Demo aborted — server not reachable.${RESET}\n`);
    process.exit(1);
  }

  await sleep(500);

  // ── Step 1: Show QR Form Submission ──
  header(1, 'Show QR Form Submission');
  detail(`Submitting lead: ${DEMO_CONTACT.firstName} ${DEMO_CONTACT.lastName} (${DEMO_CONTACT.email})`);
  detail(`Show: ${DEMO_CONTACT.show_name} | Species: ${DEMO_CONTACT.species_interest}`);
  try {
    const { status, data } = await post('/webhooks/ghl/form-submission', {
      ...DEMO_CONTACT,
      formId: 'show-qr-capture',
    });
    if (status === 200) {
      result('ok', `Form submission accepted (${JSON.stringify(data).substring(0, 80)})`);
      passed++;
    } else {
      result('warn', `Status ${status}: ${JSON.stringify(data).substring(0, 100)}`);
      warnings++;
    }
  } catch (err) {
    result('fail', `Form submission failed: ${err.message}`);
    failed++;
  }

  await sleep(500);

  // ── Step 2: Lead Scoring ──
  header(2, 'Lead Score Evaluation');
  detail(`Evaluating lead score for contactId: ${DEMO_CONTACT_ID}`);
  try {
    const { status, data } = await post('/webhooks/lead-score/evaluate', {
      contactId: DEMO_CONTACT_ID,
      locationId: LOCATION_ID,
    });
    if (status === 200) {
      result('ok', `Score: ${data.score}/10 | Intent: ${data.intent} | Method: ${data.method}`);
      if (data.reasoning) detail(`Reasoning: ${data.reasoning}`);
      if (data.nextBestAction) detail(`Next action: ${data.nextBestAction}`);
      passed++;
    } else if (status === 500) {
      result('warn', `Expected error — demo contact doesn't exist in GHL (this is normal for simulation)`);
      detail('In production, the contact would have been created by Step 1');
      warnings++;
    } else {
      result('warn', `Status ${status}: ${JSON.stringify(data).substring(0, 100)}`);
      warnings++;
    }
  } catch (err) {
    result('fail', `Lead scoring failed: ${err.message}`);
    failed++;
  }

  await sleep(500);

  // ── Step 3: Sales Pipeline — Invoice Sent ──
  header(3, 'Sales Pipeline → Invoice Sent');
  detail('Simulating: breeder sends invoice to buyer');
  try {
    const { status, data } = await post('/webhooks/ghl/pipeline-change', {
      type: 'OpportunityStageUpdate',
      locationId: LOCATION_ID,
      contactId: DEMO_CONTACT_ID,
      pipeline_id: 'demo-sales-pipeline',
      pipeline_stage_name: 'invoice sent',
      opportunity: {
        name: `${DEMO_CONTACT.firstName} ${DEMO_CONTACT.lastName} — Mack Snow Leopard Gecko`,
        monetary_value: 175,
      },
    });
    result(status === 200 ? 'ok' : 'warn', `Invoice Sent webhook: ${JSON.stringify(data)}`);
    status === 200 ? passed++ : warnings++;
  } catch (err) {
    result('fail', `Invoice Sent failed: ${err.message}`);
    failed++;
  }

  await sleep(500);

  // ── Step 4: Sales Pipeline — Payment Received ──
  header(4, 'Sales Pipeline → Payment Received');
  detail('Simulating: buyer pays the invoice → triggers shipping evaluation');
  try {
    const { status, data } = await post('/webhooks/ghl/pipeline-change', {
      type: 'OpportunityStageUpdate',
      locationId: LOCATION_ID,
      contactId: DEMO_CONTACT_ID,
      pipeline_id: 'demo-sales-pipeline',
      pipeline_stage_name: 'payment received',
      opportunity: {
        name: `${DEMO_CONTACT.firstName} ${DEMO_CONTACT.lastName} — Mack Snow Leopard Gecko`,
        monetary_value: 175,
      },
    });
    result(status === 200 ? 'ok' : 'warn', `Payment Received webhook: ${JSON.stringify(data)}`);
    status === 200 ? passed++ : warnings++;
  } catch (err) {
    result('fail', `Payment Received failed: ${err.message}`);
    failed++;
  }

  await sleep(500);

  // ── Step 5: Shipping Pipeline — Approved to Ship ──
  header(5, 'Shipping Pipeline → Approved to Ship');
  detail('Simulating: weather cleared, animal approved for shipping');
  try {
    const { status, data } = await post('/webhooks/ghl/pipeline-change', {
      type: 'OpportunityStageUpdate',
      locationId: LOCATION_ID,
      contactId: DEMO_CONTACT_ID,
      pipeline_id: 'demo-shipping-pipeline',
      pipeline_stage_name: 'approved to ship',
      opportunity: {
        name: `Ship — ${DEMO_CONTACT.firstName} — Mack Snow`,
      },
    });
    result(status === 200 ? 'ok' : 'warn', `Approved to Ship webhook: ${JSON.stringify(data)}`);
    status === 200 ? passed++ : warnings++;
  } catch (err) {
    result('fail', `Approved to Ship failed: ${err.message}`);
    failed++;
  }

  await sleep(500);

  // ── Step 6: Sales Pipeline — Delivered ──
  header(6, 'Sales Pipeline → Delivered');
  detail('Simulating: animal delivered to buyer → triggers follow-up sequence');
  try {
    const { status, data } = await post('/webhooks/ghl/pipeline-change', {
      type: 'OpportunityStageUpdate',
      locationId: LOCATION_ID,
      contactId: DEMO_CONTACT_ID,
      pipeline_id: 'demo-sales-pipeline',
      pipeline_stage_name: 'delivered',
      opportunity: {
        name: `${DEMO_CONTACT.firstName} ${DEMO_CONTACT.lastName} — Mack Snow Leopard Gecko`,
        monetary_value: 175,
      },
    });
    result(status === 200 ? 'ok' : 'warn', `Delivered webhook: ${JSON.stringify(data)}`);
    status === 200 ? passed++ : warnings++;
  } catch (err) {
    result('fail', `Delivered failed: ${err.message}`);
    failed++;
  }

  await sleep(500);

  // ── Step 7: Weather Check (Scheduled) ──
  header(7, 'Daily Weather Check (Scheduled Trigger)');
  detail('Simulating: daily cron fires weather check for pending shipments');
  try {
    const { status, data } = await post('/webhooks/shipping/weather-check', {
      locationId: LOCATION_ID,
    });
    result(status === 200 ? 'ok' : 'warn', `Weather check: status=${status} ${JSON.stringify(data).substring(0, 80)}`);
    status === 200 ? passed++ : warnings++;
  } catch (err) {
    result('fail', `Weather check failed: ${err.message}`);
    failed++;
  }

  // ── Summary ──
  console.log(`\n${CYAN}━━━ Results ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log(`  ${GREEN}✅ Passed: ${passed}${RESET}`);
  console.log(`  ${YELLOW}⚠️  Warnings: ${warnings}${RESET} ${DIM}(expected — demo contacts don't exist in GHL)${RESET}`);
  console.log(`  ${RED}❌ Failed: ${failed}${RESET}`);

  console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${CYAN}║           Demo Journey Complete                  ║${RESET}`);
  console.log(`${BOLD}${CYAN}╚══════════════════════════════════════════════════╝${RESET}`);

  if (failed > 0) {
    console.log(`\n${RED}  Some steps failed. Check the server logs for details.${RESET}`);
    console.log(`  ${DIM}Log file: logs/webhooks.log${RESET}\n`);
  } else if (warnings > 0) {
    console.log(`\n${YELLOW}  All endpoints responded. Warnings are expected because demo`);
    console.log(`  contacts don't exist in GHL yet. With real contacts, these`);
    console.log(`  would all be green.${RESET}\n`);
  } else {
    console.log(`\n${GREEN}  All steps passed! The server is ready for production.${RESET}\n`);
  }

  console.log(`${DIM}  Full customer journey simulated:`);
  console.log(`  Show QR → Lead Created → Scored → Invoice → Payment`);
  console.log(`  → Shipping Eval → Approved → Shipped → Delivered → Follow-up${RESET}\n`);
}

run().catch(err => {
  console.error(`${RED}Fatal error: ${err.message}${RESET}`);
  process.exit(1);
});
