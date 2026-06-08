#!/usr/bin/env node
require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const CLIENT_ID = process.argv.find((arg) => arg.startsWith('--client='))?.split('=')[1] || 'sunscale-geckos';
const explicitLocationId = process.argv.find((arg) => arg.startsWith('--location='))?.split('=')[1];
const ROOT = path.join(__dirname, '..');
const BREEDER_DIR = path.join(ROOT, 'data', 'breeders', CLIENT_ID);
const BREEDER_CONFIG_PATH = path.join(BREEDER_DIR, 'ghl-config.json');
const CLIENT_CONFIG_PATH = path.join(BREEDER_DIR, 'client.json');
const LEGACY_CONFIG_PATH = path.join(ROOT, 'data', 'ghl-config.json');
const CSV_PATH = path.join(ROOT, 'docs', 'demo-showroom', 'import-data', 'contact-activity.csv');

const TOKEN = process.env.GHL_PRIVATE_TOKEN;
const BASE_URL = process.env.GHL_API_BASE || 'https://services.leadconnectorhq.com';
const VERSION = process.env.GHL_CONTACT_ACTIVITY_API_VERSION || '2023-02-21';
const MARKER_PREFIX = 'HATCHKIT_DEMO_ACTIVITY';

function readJson(filePath, fallback = {}) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
}

function parseCsv(text) {
  const rows = [];
  let current = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(current);
      current = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(current);
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
      current = '';
    } else {
      current += char;
    }
  }

  if (current || row.length) {
    row.push(current);
    if (row.some((value) => value !== '')) rows.push(row);
  }

  const [headers, ...body] = rows;
  return body.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
}

const breederConfig = readJson(BREEDER_CONFIG_PATH);
const clientConfig = readJson(CLIENT_CONFIG_PATH);
const locationId = explicitLocationId || breederConfig.locationId || clientConfig.ghlLocationId || process.env.GHL_LOCATION_ID;

if (!TOKEN) {
  console.error('GHL_PRIVATE_TOKEN is missing in .env');
  process.exit(1);
}

if (!locationId || /^(PENDING|REPLACE_WITH)/.test(locationId)) {
  console.error('SunScale demo location ID is missing or still pending.');
  process.exit(1);
}

const ghl = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    Version: VERSION,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 20000,
});

function markerFor(email) {
  return `${MARKER_PREFIX}:${email.toLowerCase()}`;
}

function dueDateFor(row) {
  const minutes = Number(row.due_offset_minutes || 30);
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

async function findContactByEmail(email) {
  const response = await ghl.get('/contacts/', {
    params: { locationId, query: email },
  });
  const contacts = response.data.contacts || [];
  return contacts.find((contact) => contact.email?.toLowerCase() === email.toLowerCase()) || null;
}

async function listNotes(contactId) {
  const response = await ghl.get(`/contacts/${contactId}/notes`);
  return response.data.notes || response.data.data || [];
}

async function listTasks(contactId) {
  const response = await ghl.get(`/contacts/${contactId}/tasks`);
  return response.data.tasks || response.data.data || [];
}

async function ensureNote(contactId, row) {
  const marker = markerFor(row.email);
  const notes = await listNotes(contactId);
  const existing = notes.find((note) => `${note.title || ''}\n${note.body || ''}`.includes(marker));
  if (existing) return { id: existing.id, status: 'exists' };

  const response = await ghl.post(`/contacts/${contactId}/notes`, {
    title: row.note_title,
    body: `${row.note_body}\n\n${marker}`,
    color: '#1B5E20',
    pinned: true,
  });
  const note = response.data.note || response.data;
  return { id: note.id, status: 'created' };
}

async function ensureTask(contactId, row) {
  const marker = markerFor(row.email);
  const tasks = await listTasks(contactId);
  const existing = tasks.find((task) => `${task.title || ''}\n${task.body || ''}`.includes(marker));
  if (existing) return { id: existing.id, status: 'exists' };

  const response = await ghl.post(`/contacts/${contactId}/tasks`, {
    title: row.task_title,
    body: `${row.task_body}\n\n${marker}`,
    dueDate: dueDateFor(row),
    completed: false,
  });
  const task = response.data.task || response.data;
  return { id: task.id, status: 'created' };
}

async function main() {
  const rows = parseCsv(fs.readFileSync(CSV_PATH, 'utf8'));
  const config = {
    ...breederConfig,
    locationId,
    contactActivity: breederConfig.contactActivity || {},
  };

  console.log(`Syncing SunScale contact notes and tasks for location ${locationId}`);

  let notesCreated = 0;
  let notesExisting = 0;
  let tasksCreated = 0;
  let tasksExisting = 0;
  const blockers = [];

  for (const row of rows) {
    const contact = await findContactByEmail(row.email);
    if (!contact) {
      blockers.push(`missing contact: ${row.email}`);
      console.warn(`contact missing: ${row.email}`);
      continue;
    }

    config.contactActivity[row.email] = config.contactActivity[row.email] || { contactId: contact.id };
    config.contactActivity[row.email].contactId = contact.id;

    try {
      const note = await ensureNote(contact.id, row);
      if (note.status === 'created') notesCreated += 1;
      else notesExisting += 1;
      config.contactActivity[row.email].noteId = note.id;
      console.log(`note ${note.status}: ${row.email}`);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      blockers.push(`note blocked for ${row.email}: ${message}`);
      console.warn(`note blocked: ${row.email} (${message})`);
    }

    try {
      const task = await ensureTask(contact.id, row);
      if (task.status === 'created') tasksCreated += 1;
      else tasksExisting += 1;
      config.contactActivity[row.email].taskId = task.id;
      console.log(`task ${task.status}: ${row.email}`);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      blockers.push(`task blocked for ${row.email}: ${message}`);
      console.warn(`task blocked: ${row.email} (${message})`);
    }
  }

  saveJson(BREEDER_CONFIG_PATH, config);
  saveJson(LEGACY_CONFIG_PATH, config);

  console.log('Contact activity sync complete.');
  console.log(`notes created: ${notesCreated}`);
  console.log(`notes existing: ${notesExisting}`);
  console.log(`tasks created: ${tasksCreated}`);
  console.log(`tasks existing: ${tasksExisting}`);
  console.log(`config synced: ${path.relative(ROOT, BREEDER_CONFIG_PATH)}`);
  console.log(`legacy config synced: ${path.relative(ROOT, LEGACY_CONFIG_PATH)}`);

  if (blockers.length > 0) {
    console.log('');
    console.log('Manual/API-scope blockers:');
    for (const blocker of [...new Set(blockers)]) {
      console.log(`- ${blocker}`);
    }
  }
}

main().catch((error) => {
  const message = error.response?.data?.message || error.message;
  const details = error.response?.data ? JSON.stringify(error.response.data) : '';
  console.error(`Contact activity sync failed: ${message}`);
  if (details && details !== JSON.stringify(message)) console.error(details);
  process.exit(1);
});
