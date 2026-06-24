/**
 * verify-journey-data.js — drive the 4 buyer steps through a running backend and
 * snapshot exactly what lands on the SunScale GHL contact after each step.
 *
 * Usage:
 *   node scripts/verify-journey-data.js [email] [baseUrl]
 *   BASE=http://localhost:3939 node scripts/verify-journey-data.js me+wf1@gmail.com
 *
 * Reads the SunScale custom-field map from data/breeders/sunscale-geckos so it can
 * print field IDs as human names. Queries GHL directly via ghl/contacts (.env token).
 */
require('dotenv').config();
const axios = require('axios');
const contacts = require('../ghl/contacts');

const SUNSCALE_LOCATION = 'oCn199rzTjj0rPgqXyXU';
const BASE = process.argv[3] || process.env.BASE || 'http://localhost:3939';
const EMAIL = process.argv[2] || `service+wf${Date.now()}@atlantahouseplants.com`;
const PHONE = process.env.TEST_PHONE || '+14045550123'; // fake 555 number; no SMS in workflow mode

// Reverse map: custom-field id -> readable name
const cfg = require('../data/breeders/sunscale-geckos/ghl-config.json');
const FIELD_NAMES = {};
for (const [key, v] of Object.entries(cfg.customFields || {})) {
  if (v && v.id) FIELD_NAMES[v.id] = v.name || key;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const STEPS = [
  {
    label: '1 · Get Starter Guide',
    path: '/webhooks/ghl/lead-magnet',
    body: {
      locationId: SUNSCALE_LOCATION,
      firstName: 'Journey',
      lastName: 'Verify',
      email: EMAIL,
      phone: PHONE,
      species_interest: 'Crested Gecko',
      source: 'website-self-demo',
      offerKey: 'crested_gecko_starter_guide',
    },
  },
  {
    label: '2 · Interested in Mango',
    path: '/webhooks/ghl/offer-clicked',
    body: {
      locationId: SUNSCALE_LOCATION,
      email: EMAIL,
      species_interest: 'Crested Gecko',
      animalInterest: 'Mango',
      offerKey: 'animal_reservation',
    },
  },
  {
    label: '3 · Place $75 Deposit',
    path: '/webhooks/ghl/order-submitted',
    body: {
      locationId: SUNSCALE_LOCATION,
      email: EMAIL,
      species_interest: 'Crested Gecko',
      animalInterest: 'Mango',
      offerKey: 'animal_reservation',
      productName: 'Animal Reservation Deposit',
      amount: 75,
      postalCode: '30301', // Atlanta — exercises the shipping-review path
    },
  },
  {
    label: '4 · Leave Review',
    path: '/webhooks/ghl/review-submitted',
    body: {
      locationId: SUNSCALE_LOCATION,
      email: EMAIL,
      species_interest: 'Crested Gecko',
    },
  },
];

function fmtFields(customFields = []) {
  return customFields
    .map((f) => `      • ${(FIELD_NAMES[f.id] || f.id).padEnd(24)} = ${f.value}`)
    .join('\n');
}

async function snapshot(prevTags) {
  // small delay + retry so GHL search index catches up
  let c = null;
  for (let i = 0; i < 6 && !c; i++) {
    if (i) await wait(1000);
    const found = await contacts.searchContacts(EMAIL, SUNSCALE_LOCATION);
    c = found[0] || null;
  }
  if (!c) {
    console.log('   (contact not found yet)');
    return prevTags;
  }
  const tags = c.tags || [];
  const added = tags.filter((t) => !prevTags.includes(t));
  console.log(`   contactId : ${c.id}`);
  console.log(`   phone     : ${c.phone || '(none)'}`);
  console.log(`   NEW tags  : ${added.length ? added.join(', ') : '(none new)'}`);
  console.log(`   all tags  : ${tags.join(', ')}`);
  console.log(`   custom fields:`);
  console.log(fmtFields(c.customFields));
  return tags;
}

(async () => {
  console.log(`\n=== Journey data verification ===`);
  console.log(`base : ${BASE}`);
  console.log(`email: ${EMAIL}`);
  console.log(`phone: ${PHONE} (workflow mode → no SMS actually sent)\n`);

  let prevTags = [];
  for (const step of STEPS) {
    process.stdout.write(`\n── POST ${step.label}  (${step.path})\n`);
    try {
      const r = await axios.post(BASE + step.path, step.body, { timeout: 30000 });
      console.log(`   response  : ${r.status} ${JSON.stringify(r.data).slice(0, 180)}`);
    } catch (err) {
      console.log(`   HTTP ERROR: ${err.response?.status} ${JSON.stringify(err.response?.data) || err.message}`);
    }
    await wait(1500);
    prevTags = await snapshot(prevTags);
  }
  console.log(`\n=== done — contact: ${EMAIL} ===\n`);
})();
