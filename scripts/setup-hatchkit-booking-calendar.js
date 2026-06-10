/**
 * Upserts the "Free HatchKit Demo" booking calendar in the HATCHKIT business
 * sub-account (not the SunScale demo account). Geoff and Brianna are assigned as
 * round-robin hosts so either can take a demo and both are notified.
 *
 * Re-runnable: if the calendar already exists (matched by slug) it UPDATES the
 * name, copy, and slot length in place. The booking widget id never changes.
 *
 * Requires a Private Integration token for the HatchKit sub-account in .env:
 *   HATCHKIT_GHL_TOKEN=pit-xxxxxxxx
 *   HATCHKIT_LOCATION_ID=fqj4rbp2VRkvMa8GWVWn   (optional; this is the default)
 *
 * Usage: node scripts/setup-hatchkit-booking-calendar.js
 */
require('dotenv').config();
const axios = require('axios');

const TOKEN = process.env.HATCHKIT_GHL_TOKEN;
const LOCATION_ID = process.env.HATCHKIT_LOCATION_ID || 'fqj4rbp2VRkvMa8GWVWn';
const HOST_EMAILS = ['brianna@hatchkitai.com', 'service@atlantahouseplants.com'];
const SLUG = 'hatchkit-discovery-call';
const NAME = 'Free HatchKit Demo';
const DESCRIPTION =
  'A free, no-pressure 15-minute look at how HatchKit helps reptile breeders get more sales. ' +
  'We will learn how you sell and show you what is working for other breeders. No cost, no obligation.';
const EVENT_TITLE = 'Free HatchKit Demo with {{contact.name}}';
const SLOT_MINUTES = 15;

if (!TOKEN) {
  console.error(
    'HATCHKIT_GHL_TOKEN is not set. Create a Private Integration token in the HatchKit\n' +
    'sub-account (Settings -> Private Integrations) with Calendars, Contacts, Opportunities,\n' +
    'and Users scopes, then add it to .env as HATCHKIT_GHL_TOKEN.'
  );
  process.exit(1);
}

const client = axios.create({
  baseURL: process.env.GHL_API_BASE || 'https://services.leadconnectorhq.com',
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    Version: process.env.GHL_API_VERSION || '2021-07-28',
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

const get = (url, params) => client.get(url, { params }).then((r) => r.data);
const post = (url, data) => client.post(url, data).then((r) => r.data);
const put = (url, data) => client.put(url, data).then((r) => r.data);

function businessHours() {
  // Mon–Fri, 9:00–17:00
  return [1, 2, 3, 4, 5].map((day) => ({
    daysOfTheWeek: [day],
    hours: [{ openHour: 9, openMinute: 0, closeHour: 17, closeMinute: 0 }],
  }));
}

// Mutable settings shared by create + update.
function commonSettings(hosts) {
  return {
    name: NAME,
    description: DESCRIPTION,
    eventTitle: EVENT_TITLE,
    eventColor: '#2F80ED',
    slotDuration: SLOT_MINUTES,
    slotDurationUnit: 'mins',
    slotInterval: SLOT_MINUTES,
    slotIntervalUnit: 'mins',
    openHours: businessHours(),
    teamMembers: hosts.map((u, i) => ({ userId: u.id, priority: 1, isPrimary: i === 0 })),
    isActive: true,
  };
}

async function main() {
  console.log(`Target HatchKit location: ${LOCATION_ID}`);
  try {
    const loc = await get('/locations/' + LOCATION_ID);
    console.log('Location:', loc.location?.name || loc.name);
  } catch (e) {
    console.error('Cannot access location with this token:', e.response?.status, e.response?.data?.message);
    process.exit(1);
  }

  const usersRes = await get('/users/', { locationId: LOCATION_ID });
  const users = usersRes.users || [];
  const hosts = HOST_EMAILS
    .map((email) => users.find((u) => (u.email || '').toLowerCase() === email))
    .filter(Boolean);
  if (hosts.length === 0) {
    console.error('No host users found. Users present:', users.map((u) => u.email).join(', '));
    console.error('Add Geoff and/or Brianna to the HatchKit sub-account, then re-run.');
    process.exit(1);
  }
  console.log('Hosts assigned:', hosts.map((u) => `${u.name} <${u.email}>`).join(' | '));

  const existing = ((await get('/calendars/', { locationId: LOCATION_ID })).calendars || [])
    .find((c) => c.slug === SLUG || c.name === NAME || c.name === 'HatchKit Discovery Call');

  if (existing) {
    const upd = await put('/calendars/' + existing.id, commonSettings(hosts));
    const cal = upd.calendar || upd;
    console.log(`\nUpdated calendar: ${cal.name} (id=${existing.id}) — ${SLOT_MINUTES}-minute slots`);
    console.log(`Booking widget: https://api.leadconnectorhq.com/widget/booking/${existing.id}`);
    return;
  }

  const created = await post('/calendars/', {
    locationId: LOCATION_ID,
    calendarType: 'round_robin',
    widgetType: 'default',
    slug: SLUG,
    widgetSlug: SLUG,
    allowBookingAfter: 2,
    allowBookingAfterUnit: 'hours',
    allowBookingFor: 30,
    allowBookingForUnit: 'days',
    availabilityType: 0,
    autoConfirm: true,
    ...commonSettings(hosts),
  });
  const cal = created.calendar || created;
  console.log(`\nCreated calendar: ${cal.name} (id=${cal.id}) — ${SLOT_MINUTES}-minute slots`);
  console.log(`Booking widget: https://api.leadconnectorhq.com/widget/booking/${cal.id}`);
}

main().catch((e) => {
  console.error('Calendar setup failed:', e.response?.status, JSON.stringify(e.response?.data || e.message));
  process.exit(1);
});
