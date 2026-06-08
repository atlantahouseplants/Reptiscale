/**
 * Creates (idempotently) the "HatchKit Discovery Call" booking calendar in the
 * HATCHKIT business sub-account (not the SunScale demo account). Geoff and Brianna
 * are assigned as round-robin hosts so either can take a demo and both are notified.
 *
 * Requires a Private Integration token for the HatchKit sub-account, separate from
 * the SunScale token used by the demo backend. Add to .env:
 *
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
const NAME = 'HatchKit Discovery Call';

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

function businessHours() {
  // Mon–Fri, 9:00–17:00
  return [1, 2, 3, 4, 5].map((day) => ({
    daysOfTheWeek: [day],
    hours: [{ openHour: 9, openMinute: 0, closeHour: 17, closeMinute: 0 }],
  }));
}

async function main() {
  console.log(`Target HatchKit location: ${LOCATION_ID}`);

  // Confirm token reaches this location
  try {
    const loc = await get('/locations/' + LOCATION_ID);
    console.log('Location:', loc.location?.name || loc.name);
  } catch (e) {
    console.error('Cannot access location with this token:', e.response?.status, e.response?.data?.message);
    process.exit(1);
  }

  // Find host users by email
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

  // Idempotency: skip if calendar already exists
  const existing = (await get('/calendars/', { locationId: LOCATION_ID })).calendars || [];
  const found = existing.find((c) => c.slug === SLUG || c.name === NAME);
  if (found) {
    console.log(`Calendar already exists: ${found.name} (id=${found.id})`);
    console.log(`Booking widget: https://api.leadconnectorhq.com/widget/booking/${found.id}`);
    return;
  }

  const payload = {
    locationId: LOCATION_ID,
    name: NAME,
    description:
      'Book a 30-minute HatchKit demo and breeder-business strategy call. Tell us how you ' +
      'sell and where buyers find you, and we will walk you through a live demo account.',
    calendarType: 'round_robin',
    widgetType: 'default',
    slug: SLUG,
    widgetSlug: SLUG,
    eventTitle: 'HatchKit Demo — {{contact.name}}',
    eventColor: '#2F80ED',
    slotDuration: 30,
    slotDurationUnit: 'mins',
    slotInterval: 30,
    slotIntervalUnit: 'mins',
    slotBuffer: 0,
    slotBufferUnit: 'mins',
    preBuffer: 0,
    preBufferUnit: 'mins',
    appoinmentPerSlot: 1,
    appoinmentPerDay: 0,
    allowBookingAfter: 2,
    allowBookingAfterUnit: 'hours',
    allowBookingFor: 30,
    allowBookingForUnit: 'days',
    openHours: businessHours(),
    availabilityType: 0,
    teamMembers: hosts.map((u, i) => ({ userId: u.id, priority: 1, isPrimary: i === 0 })),
    isActive: true,
    autoConfirm: true,
  };

  const res = await post('/calendars/', payload);
  const cal = res.calendar || res;
  console.log(`\nCreated calendar: ${cal.name} (id=${cal.id})`);
  console.log(`Booking widget: https://api.leadconnectorhq.com/widget/booking/${cal.id}`);
  console.log('\nNext: update components/BookingCalendar.tsx default ID to this calendar id,');
  console.log('then delete the temporary SunScale calendar (id=5ruqyowyf7CaxeFsKxle).');
}

main().catch((e) => {
  console.error('Calendar setup failed:', e.response?.status, JSON.stringify(e.response?.data || e.message));
  process.exit(1);
});
