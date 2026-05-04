require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createContact, addTag } = require('../ghl/contacts');

const configPath = path.join(__dirname, '..', 'data', 'ghl-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

function buildCustomFields(values) {
  const fieldMap = config.customFields || {};
  return Object.entries(values)
    .filter(([key]) => fieldMap[key]?.id)
    .map(([key, value]) => ({ id: fieldMap[key].id, value: String(value) }));
}

// 20 demo contacts across species, shows, price tiers, and pipeline stages
const DEMO_CONTACTS = [
  {
    firstName: 'Alex', lastName: 'Thompson',
    email: `alex.thompson.demo.${Date.now() + 1}@example.com`, phone: '+19195550101',
    tags: ['show:narbc-arlington-2026', 'interest:leopard-gecko', 'stage:new-lead'],
    fields: { species_interest: 'Leopard Gecko', show_source: 'NARBC Arlington', price_tier: 'Mid-Range ($75-250)', lead_score: '8', last_show_attended: 'NARBC Arlington 2026' },
  },
  {
    firstName: 'Maya', lastName: 'Chen',
    email: `maya.chen.demo.${Date.now() + 2}@example.com`, phone: '+19195550102',
    tags: ['show:tinley-park-2026', 'interest:ball-python', 'stage:contacted'],
    fields: { species_interest: 'Ball Python', show_source: 'Tinley Park', price_tier: 'Premium ($250-750)', lead_score: '35', last_show_attended: 'Tinley Park 2026' },
  },
  {
    firstName: 'Derek', lastName: 'Williams',
    email: `derek.williams.demo.${Date.now() + 3}@example.com`, phone: '+14045550103',
    tags: ['source:morphmarket', 'interest:crested-gecko', 'stage:interested'],
    fields: { species_interest: 'Crested Gecko', show_source: 'Online', price_tier: 'Budget ($25-75)', lead_score: '22', morph_preference: 'Dalmatian' },
  },
  {
    firstName: 'Priya', lastName: 'Patel',
    email: `priya.patel.demo.${Date.now() + 4}@example.com`, phone: '+17045550104',
    tags: ['show:southeast-reptile-expo-2026', 'interest:bearded-dragon', 'stage:qualified'],
    fields: { species_interest: 'Bearded Dragon', show_source: 'Southeast Reptile Expo', price_tier: 'Mid-Range ($75-250)', lead_score: '60', last_show_attended: 'Southeast Reptile Expo 2026' },
  },
  {
    firstName: 'Carlos', lastName: 'Martinez',
    email: `carlos.martinez.demo.${Date.now() + 5}@example.com`, phone: '+18325550105',
    tags: ['show:narbc-arlington-2026', 'interest:corn-snake', 'stage:qualified', 'interest:leopard-gecko'],
    fields: { species_interest: 'Corn Snake', show_source: 'NARBC Arlington', price_tier: 'Budget ($25-75)', lead_score: '45', last_show_attended: 'NARBC Arlington 2026' },
  },
  {
    firstName: 'Taylor', lastName: 'Brooks',
    email: `taylor.brooks.demo.${Date.now() + 6}@example.com`, phone: '+16195550106',
    tags: ['show:reptile-super-show-2026', 'interest:leopard-gecko', 'stage:customer', 'purchased'],
    fields: { species_interest: 'Leopard Gecko', show_source: 'Reptile Super Show', price_tier: 'Designer ($750+)', lead_score: '95', morph_preference: 'Black Night', shipping_preference: 'Ship to Home' },
  },
  {
    firstName: 'Jordan', lastName: 'Kim',
    email: `jordan.kim.demo.${Date.now() + 7}@example.com`, phone: '+19175550107',
    tags: ['source:referral', 'interest:ball-python', 'stage:contacted'],
    fields: { species_interest: 'Ball Python', show_source: 'Referral', price_tier: 'Premium ($250-750)', lead_score: '30', morph_preference: 'Pastel Clown' },
  },
  {
    firstName: 'Sam', lastName: 'Garcia',
    email: `sam.garcia.demo.${Date.now() + 8}@example.com`, phone: '+13055550108',
    tags: ['show:tinley-park-2026', 'interest:crested-gecko', 'stage:new-lead'],
    fields: { species_interest: 'Crested Gecko', show_source: 'Tinley Park', price_tier: 'Mid-Range ($75-250)', lead_score: '5', last_show_attended: 'Tinley Park 2026' },
  },
  {
    firstName: 'Morgan', lastName: 'Lee',
    email: `morgan.lee.demo.${Date.now() + 9}@example.com`, phone: '+16465550109',
    tags: ['source:instagram', 'interest:leopard-gecko', 'stage:interested'],
    fields: { species_interest: 'Leopard Gecko', show_source: 'Online', price_tier: 'Premium ($250-750)', lead_score: '28', morph_preference: 'Super Mack Snow' },
  },
  {
    firstName: 'Riley', lastName: 'Johnson',
    email: `riley.johnson.demo.${Date.now() + 10}@example.com`, phone: '+15125550110',
    tags: ['show:hamburg-2026', 'interest:bearded-dragon', 'stage:customer', 'purchased', 'shipping:delivered'],
    fields: { species_interest: 'Bearded Dragon', show_source: 'Hamburg', price_tier: 'Mid-Range ($75-250)', lead_score: '88', shipping_preference: 'Ship to Home', shipping_status: 'Delivered' },
  },
  {
    firstName: 'Cameron', lastName: 'Davis',
    email: `cameron.davis.demo.${Date.now() + 11}@example.com`, phone: '+14055550111',
    tags: ['show:southeast-reptile-expo-2026', 'interest:corn-snake', 'stage:new-lead'],
    fields: { species_interest: 'Corn Snake', show_source: 'Southeast Reptile Expo', price_tier: 'Budget ($25-75)', lead_score: '7', last_show_attended: 'Southeast Reptile Expo 2026' },
  },
  {
    firstName: 'Avery', lastName: 'Wilson',
    email: `avery.wilson.demo.${Date.now() + 12}@example.com`, phone: '+12025550112',
    tags: ['source:morphmarket', 'interest:leopard-gecko', 'stage:interested', 'high-value'],
    fields: { species_interest: 'Leopard Gecko', show_source: 'Online', price_tier: 'Designer ($750+)', lead_score: '55', morph_preference: 'Eclipse Enigma', temperature_tolerance_min: '50', temperature_tolerance_max: '85' },
  },
  {
    firstName: 'Quinn', lastName: 'Anderson',
    email: `quinn.anderson.demo.${Date.now() + 13}@example.com`, phone: '+17135550113',
    tags: ['show:narbc-arlington-2026', 'interest:ball-python', 'stage:qualified'],
    fields: { species_interest: 'Ball Python', show_source: 'NARBC Arlington', price_tier: 'Premium ($250-750)', lead_score: '50', morph_preference: 'Lesser Yellowbelly', last_show_attended: 'NARBC Arlington 2026' },
  },
  {
    firstName: 'Blake', lastName: 'Thomas',
    email: `blake.thomas.demo.${Date.now() + 14}@example.com`, phone: '+16025550114',
    tags: ['show:reptile-super-show-2026', 'interest:crested-gecko', 'stage:customer', 'purchased', 'shipping:in-transit'],
    fields: { species_interest: 'Crested Gecko', show_source: 'Reptile Super Show', price_tier: 'Mid-Range ($75-250)', lead_score: '78', shipping_status: 'In Transit', shipping_preference: 'Hold at FedEx' },
  },
  {
    firstName: 'Jamie', lastName: 'Robinson',
    email: `jamie.robinson.demo.${Date.now() + 15}@example.com`, phone: '+13125550115',
    tags: ['source:referral', 'interest:leopard-gecko', 'stage:new-lead'],
    fields: { species_interest: 'Leopard Gecko', show_source: 'Referral', price_tier: 'Budget ($25-75)', lead_score: '12' },
  },
  {
    firstName: 'Skyler', lastName: 'Jackson',
    email: `skyler.jackson.demo.${Date.now() + 16}@example.com`, phone: '+14155550116',
    tags: ['show:hamburg-2026', 'interest:bearded-dragon', 'stage:contacted', 'cold-lead'],
    fields: { species_interest: 'Bearded Dragon', show_source: 'Hamburg', price_tier: 'Budget ($25-75)', lead_score: '15', last_show_attended: 'Hamburg 2026' },
  },
  {
    firstName: 'Reese', lastName: 'Martinez',
    email: `reese.martinez.demo.${Date.now() + 17}@example.com`, phone: '+18135550117',
    tags: ['source:instagram', 'interest:corn-snake', 'interest:ball-python', 'stage:interested'],
    fields: { species_interest: 'Corn Snake', show_source: 'Online', price_tier: 'Mid-Range ($75-250)', lead_score: '33', morph_preference: 'Okeetee' },
  },
  {
    firstName: 'Drew', lastName: 'White',
    email: `drew.white.demo.${Date.now() + 18}@example.com`, phone: '+13035550118',
    tags: ['show:tinley-park-2026', 'interest:leopard-gecko', 'stage:customer', 'purchased', 'shipping:approved'],
    fields: { species_interest: 'Leopard Gecko', show_source: 'Tinley Park', price_tier: 'Premium ($250-750)', lead_score: '82', shipping_status: 'Approved to Ship', shipping_preference: 'Ship to Home', morph_preference: 'APTOR', last_show_attended: 'Tinley Park 2026' },
  },
  {
    firstName: 'Parker', lastName: 'Harris',
    email: `parker.harris.demo.${Date.now() + 19}@example.com`, phone: '+14045550119',
    tags: ['show:southeast-reptile-expo-2026', 'interest:crested-gecko', 'stage:new-lead'],
    fields: { species_interest: 'Crested Gecko', show_source: 'Southeast Reptile Expo', price_tier: 'Mid-Range ($75-250)', lead_score: '9', last_show_attended: 'Southeast Reptile Expo 2026' },
  },
  {
    firstName: 'Finley', lastName: 'Scott',
    email: `finley.scott.demo.${Date.now() + 20}@example.com`, phone: '+16785550120',
    tags: ['source:referral', 'interest:ball-python', 'stage:customer', 'purchased', 'shipping:lag-confirmed'],
    fields: { species_interest: 'Ball Python', show_source: 'Referral', price_tier: 'Designer ($750+)', lead_score: '99', shipping_status: 'LAG Confirmed', shipping_preference: 'Ship to Home', morph_preference: 'Coral Glow Banana' },
  },
];

async function main() {
  console.log('\n━━━ Loading Demo Contacts into GHL ━━━━━━━━━━━━━━━━━━━━');
  console.log(`Creating ${DEMO_CONTACTS.length} demo contacts...\n`);

  const results = { success: [], failed: [] };

  for (let i = 0; i < DEMO_CONTACTS.length; i++) {
    const demo = DEMO_CONTACTS[i];
    const customFields = buildCustomFields(demo.fields);

    const contactData = {
      firstName: demo.firstName,
      lastName: demo.lastName,
      email: demo.email,
      phone: demo.phone,
      tags: demo.tags,
      customFields,
    };

    try {
      const contact = await createContact(contactData);
      results.success.push({ name: `${demo.firstName} ${demo.lastName}`, id: contact.id, tags: demo.tags.slice(0, 2) });
      console.log(`  [${i + 1}/20] ✅ ${demo.firstName} ${demo.lastName} — ${demo.tags.find(t => t.startsWith('stage:')) || ''} — ${demo.fields.species_interest}`);

      // Small delay to respect rate limits
      if (i < DEMO_CONTACTS.length - 1) await delay(300);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      results.failed.push({ name: `${demo.firstName} ${demo.lastName}`, error: msg });
      console.error(`  [${i + 1}/20] ❌ ${demo.firstName} ${demo.lastName} — ${msg}`);
    }
  }

  // Summary
  console.log('\n━━━ Summary ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  ✅ Created: ${results.success.length} contacts`);
  if (results.failed.length > 0) {
    console.log(`  ❌ Failed:  ${results.failed.length} contacts`);
    results.failed.forEach(f => console.log(`     - ${f.name}: ${f.error}`));
  }

  // Distribution summary
  const stages = {};
  const species = {};
  const shows = {};
  DEMO_CONTACTS.forEach(c => {
    const stage = c.tags.find(t => t.startsWith('stage:'))?.replace('stage:', '') || 'unknown';
    stages[stage] = (stages[stage] || 0) + 1;
    species[c.fields.species_interest] = (species[c.fields.species_interest] || 0) + 1;
    shows[c.fields.show_source] = (shows[c.fields.show_source] || 0) + 1;
  });

  console.log('\n  Distribution:');
  console.log('  Pipeline Stages:');
  Object.entries(stages).forEach(([k, v]) => console.log(`    ${k.padEnd(18)} ${v}`));
  console.log('  Species Interest:');
  Object.entries(species).forEach(([k, v]) => console.log(`    ${k.padEnd(18)} ${v}`));
  console.log('  Show Sources:');
  Object.entries(shows).forEach(([k, v]) => console.log(`    ${k.padEnd(26)} ${v}`));
  console.log('');
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch((err) => {
  console.error('Fatal error:', err.response?.data || err.message);
  process.exit(1);
});
