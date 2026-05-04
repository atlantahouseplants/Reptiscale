// scripts/daily-content-run.js
// Daily cron trigger — generates and queues/publishes content for all active clients
// Run via: node scripts/daily-content-run.js
// Or triggered via POST /api/content/daily-run

// Load .env and manually apply to process.env (dotenv v17 compatibility)
const _dotenv = require('dotenv').config();
if (_dotenv.parsed) {
  Object.keys(_dotenv.parsed).forEach(function(k) {
    if (!process.env[k]) process.env[k] = _dotenv.parsed[k];
  });
}

const fs = require('fs');
const path = require('path');

const CLIENTS_FILE = path.join(__dirname, '../data/clients.json');

async function runForClient(clientConfig) {
  const { getOrCreateSchedule, markPosted } = require('../agents/content-agent/scheduler');
  const { generatePost } = require('../agents/content-agent/index');
  const { processPost } = require('../agents/content-agent/publisher');

  const clientId = clientConfig.clientId;
  const today = new Date().toISOString().slice(0, 10);

  console.log(`\n[${clientId}] Starting daily content run...`);

  // Step 1: Get or create the weekly schedule
  const schedule = getOrCreateSchedule(clientConfig);
  const todayEntry = schedule.days.find((d) => d.date === today);

  if (!todayEntry) {
    console.log(`[${clientId}] No entry found for today (${today}) in schedule.`);
    return { clientId, status: 'no_entry', date: today };
  }

  if (todayEntry.status === 'posted') {
    console.log(`[${clientId}] Today's post already published (postId: ${todayEntry.postId})`);
    return { clientId, status: 'already_posted', date: today, postId: todayEntry.postId };
  }

  if (todayEntry.status === 'skipped') {
    console.log(`[${clientId}] Today's post was marked skipped.`);
    return { clientId, status: 'skipped', date: today };
  }

  console.log(`[${clientId}] Today's category: ${todayEntry.category}`);

  // Step 2: Generate the post
  let post;
  try {
    post = await generatePost(clientConfig, todayEntry.category, new Date(today));
    console.log(`[${clientId}] Post generated: ${post.id}`);
  } catch (err) {
    console.error(`[${clientId}] Post generation failed: ${err.message}`);
    return { clientId, status: 'generation_failed', date: today, error: err.message };
  }

  // Step 3: Process the post
  const options = {
    autoPublish: clientConfig.autoPublish || false,
    imageUrl: null, // auto-publish requires an image; daily run queues for human image attachment
    phone: clientConfig.autoPublish ? null : clientConfig.ownerPhone,
    contactId: clientConfig.ghlContactId || null,
    clientConfig,
  };

  let processResult;
  try {
    processResult = await processPost(clientId, post, options);
    console.log(`[${clientId}] Post processed: action=${processResult.action}`);
  } catch (err) {
    console.error(`[${clientId}] Post processing failed: ${err.message}`);
    return { clientId, status: 'processing_failed', date: today, error: err.message };
  }

  // Step 4: Update schedule if post is in a terminal state
  if (processResult.action === 'published') {
    markPosted(clientId, today, post.id);
  }

  return {
    clientId,
    status: 'success',
    date: today,
    category: todayEntry.category,
    postId: post.id,
    action: processResult.action,
  };
}

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('  HatchKit Daily Content Run');
  console.log(`  ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET`);
  console.log('═══════════════════════════════════════════════════');

  // Load client configs
  let clients;
  try {
    clients = JSON.parse(fs.readFileSync(CLIENTS_FILE, 'utf8'));
  } catch (err) {
    console.error('Failed to load clients.json:', err.message);
    process.exit(1);
  }

  const activeClients = clients.filter((c) => c.active);
  console.log(`\nFound ${activeClients.length} active client(s)`);

  const results = [];

  for (const client of activeClients) {
    try {
      const result = await runForClient(client);
      results.push(result);
    } catch (err) {
      console.error(`Unhandled error for client ${client.clientId}: ${err.message}`);
      results.push({
        clientId: client.clientId,
        status: 'error',
        error: err.message,
      });
    }
  }

  // Print summary
  console.log('\n');
  console.log('═══════════════════════════════════════════════════');
  console.log('  Daily Run Summary');
  console.log('═══════════════════════════════════════════════════');
  for (const r of results) {
    const icon =
      r.status === 'success' ? '[OK]' :
      r.status === 'already_posted' ? '[SKIP]' :
      r.status === 'skipped' ? '[SKIP]' : '[FAIL]';
    console.log(`  ${icon} ${r.clientId}: ${r.status}${r.category ? ' | ' + r.category : ''}${r.action ? ' | ' + r.action : ''}`);
  }
  console.log('═══════════════════════════════════════════════════');

  return results;
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Daily run crashed:', err);
      process.exit(1);
    });
}

module.exports = { main, runForClient };
