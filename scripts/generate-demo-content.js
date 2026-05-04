// scripts/generate-demo-content.js
// Generates 7-day content calendar for SunScale Geckos and prints all posts
// Run: node scripts/generate-demo-content.js

// Load .env and manually apply to process.env (dotenv v17 compatibility)
const dotenvResult = require('dotenv').config();
if (dotenvResult.parsed) {
  Object.keys(dotenvResult.parsed).forEach(function(k) {
    if (!process.env[k]) process.env[k] = dotenvResult.parsed[k];
  });
}

const fs = require('fs');
const path = require('path');

const { generatePost, selectCategory } = require('../agents/content-agent/index');
const { saveSchedule } = require('../agents/content-agent/scheduler');

const CLIENTS_FILE = path.join(__dirname, '../data/clients.json');
const DEMO_SCHEDULE_FILE = path.join(__dirname, '../data/schedules/sunscale-demo.json');
const DEMO_START_DATE = new Date('2026-03-15T00:00:00.000Z'); // March 15, 2026

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function printDivider() {
  console.log('═══════════════════════════════════════════════════════════════════════');
}

function printPost(dayNum, date, category, post) {
  printDivider();
  console.log(`DAY ${dayNum} — ${formatDate(date)} | CATEGORY: ${category.replace(/_/g, ' ').toUpperCase()}`);
  printDivider();
  console.log('');
  console.log('CAPTION:');
  console.log('─────────────────────────────────────────────────────────────────────');
  console.log(post.caption);
  console.log('');
  console.log('HASHTAGS:');
  console.log('─────────────────────────────────────────────────────────────────────');
  console.log((post.hashtags || []).join(' '));
  console.log('');
  console.log('PHOTO DIRECTION:');
  console.log('─────────────────────────────────────────────────────────────────────');
  console.log(post.photoDirection);
  console.log('');
  console.log(`SUGGESTED TIME: ${new Date(post.suggestedTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
    timeZoneName: 'short',
  })}`);
  console.log('');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('');
  console.log('┌─────────────────────────────────────────────────────────────────┐');
  console.log('│     HatchKit AI Content Engine — 7-Day Demo Calendar            │');
  console.log('│     Client: SunScale Geckos | Start: March 15, 2026             │');
  console.log('└─────────────────────────────────────────────────────────────────┘');
  console.log('');
  console.log('Generating 7 posts using Claude Sonnet... this will take ~2 minutes.');
  console.log('');

  // Load client config
  let clients;
  try {
    clients = JSON.parse(fs.readFileSync(CLIENTS_FILE, 'utf8'));
  } catch (err) {
    console.error('Failed to load data/clients.json:', err.message);
    process.exit(1);
  }

  const client = clients.find((c) => c.clientId === 'sunscale-geckos');
  if (!client) {
    console.error('sunscale-geckos client not found in data/clients.json');
    process.exit(1);
  }

  const generatedPosts = [];
  const scheduleDays = [];
  const runningHistory = [];
  const summary = [];

  for (let i = 0; i < 7; i++) {
    const date = addDays(DEMO_START_DATE, i);
    const dateStr = date.toISOString().slice(0, 10);

    // Select category using seeded scheduler (with running history for rotation)
    const category = selectCategory(client, runningHistory, date);
    runningHistory.unshift(category);

    console.log(`[Day ${i + 1}/7] ${formatDate(date)} — Generating: ${category.replace(/_/g, ' ')}`);

    let post;
    try {
      post = await generatePost(client, category, date);
      generatedPosts.push({ dayNum: i + 1, date, category, post });
      scheduleDays.push({ date: dateStr, category, status: 'planned', postId: post.id });
      summary.push({ day: i + 1, date: dateStr, category });
      console.log(`  ✓ Generated (${post.caption.length} chars)`);
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`);
      scheduleDays.push({ date: dateStr, category, status: 'failed', postId: null });
      summary.push({ day: i + 1, date: dateStr, category, error: err.message });
      // Continue to next day even if one fails
      if (i < 6) {
        console.log('  Waiting 3 seconds before next attempt...');
        await sleep(3000);
      }
      continue;
    }

    // Rate limit buffer between API calls
    if (i < 6) {
      await sleep(2000);
    }
  }

  // Save demo schedule to disk
  try {
    const scheduleData = {
      clientId: 'sunscale-demo',
      generatedAt: new Date().toISOString(),
      startDate: DEMO_START_DATE.toISOString().slice(0, 10),
      days: scheduleDays,
    };
    fs.mkdirSync(path.dirname(DEMO_SCHEDULE_FILE), { recursive: true });
    fs.writeFileSync(DEMO_SCHEDULE_FILE, JSON.stringify(scheduleData, null, 2), 'utf8');
    console.log(`\nSchedule saved to: data/schedules/sunscale-demo.json`);
  } catch (err) {
    console.warn(`Could not save schedule: ${err.message}`);
  }

  // Print all generated posts
  console.log('\n');
  console.log('┌─────────────────────────────────────────────────────────────────┐');
  console.log('│                  GENERATED CONTENT CALENDAR                     │');
  console.log('└─────────────────────────────────────────────────────────────────┘');
  console.log('');

  for (const { dayNum, date, category, post } of generatedPosts) {
    printPost(dayNum, date, category, post);
  }

  // Print final summary
  printDivider();
  console.log('7-DAY CONTENT CALENDAR SUMMARY — SunScale Geckos');
  printDivider();
  for (const s of summary) {
    const icon = s.error ? '[FAIL]' : '[OK]  ';
    const label = s.category.replace(/_/g, ' ').padEnd(20);
    const error = s.error ? ` — ERROR: ${s.error}` : '';
    console.log(`  ${icon} Day ${s.day} | ${s.date} | ${label}${error}`);
  }
  printDivider();
  console.log(`Generated ${generatedPosts.length}/7 posts successfully`);
  console.log('');
}

main().catch((err) => {
  console.error('\nFatal error:', err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
