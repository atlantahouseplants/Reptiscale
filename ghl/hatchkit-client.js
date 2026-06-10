/**
 * GHL client scoped to the HATCHKIT sales sub-account (fqj4rbp2VRkvMa8GWVWn),
 * separate from the SunScale demo client in ghl/client.js. Used to capture
 * self-guided-demo prospects as HatchKit sales leads and notify Brianna.
 *
 * Requires HATCHKIT_GHL_TOKEN in the environment. If it is not set, isConfigured()
 * returns false and callers should skip capture gracefully (no crash).
 */
const axios = require('axios');

const TOKEN = process.env.HATCHKIT_GHL_TOKEN;
const LOCATION_ID = process.env.HATCHKIT_LOCATION_ID || 'fqj4rbp2VRkvMa8GWVWn';
const BRIANNA_USER_ID = process.env.HATCHKIT_BRIANNA_USER_ID || 'd9ZB2kZwklRh8KYG7Zvx';

const client = TOKEN
  ? axios.create({
      baseURL: process.env.GHL_API_BASE || 'https://services.leadconnectorhq.com',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Version: process.env.GHL_API_VERSION || '2021-07-28',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 15000,
    })
  : null;

function isConfigured() {
  return Boolean(client);
}

function splitName(name = '') {
  const parts = String(name).trim().split(/\s+/);
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') };
}

/** Upsert a contact by email/phone in the HatchKit account. Returns the contact. */
async function upsertContact({ name, firstName, lastName, email, phone, tags = [], source }) {
  if (!client) throw new Error('HATCHKIT_GHL_TOKEN not configured');
  let fn = firstName;
  let ln = lastName;
  if (!fn && name) ({ firstName: fn, lastName: ln } = splitName(name));
  const body = { locationId: LOCATION_ID };
  if (email) body.email = email;
  if (phone) body.phone = phone;
  if (fn) body.firstName = fn;
  if (ln) body.lastName = ln;
  if (tags.length) body.tags = tags;
  if (source) body.source = source;
  const res = await client.post('/contacts/upsert', body);
  return res.data.contact || res.data;
}

/** Create a follow-up task on a HatchKit contact, assigned to Brianna by default. */
async function createTask(contactId, { title, body = '', assignedTo = BRIANNA_USER_ID, dueDate } = {}) {
  if (!client) throw new Error('HATCHKIT_GHL_TOKEN not configured');
  const due = dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const payload = { title, body, dueDate: due, completed: false };
  if (assignedTo) payload.assignedTo = assignedTo;
  const res = await client.post(`/contacts/${contactId}/tasks`, payload);
  return res.data;
}

module.exports = { isConfigured, upsertContact, createTask, BRIANNA_USER_ID, LOCATION_ID };
