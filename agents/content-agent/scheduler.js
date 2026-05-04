// agents/content-agent/scheduler.js
// Maintains rolling 7-day content calendar per client
// Stores/reads from data/schedules/{clientId}.json

const fs = require('fs');
const path = require('path');
const { selectCategory } = require('./index');

const SCHEDULES_DIR = path.join(__dirname, '../../data/schedules');

// ─── Directory Init ───────────────────────────────────────────────────────────

function ensureSchedulesDir() {
  if (!fs.existsSync(SCHEDULES_DIR)) {
    fs.mkdirSync(SCHEDULES_DIR, { recursive: true });
  }
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────

function dateStr(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function todayStr() {
  return dateStr(new Date());
}

// ─── Schedule I/O ─────────────────────────────────────────────────────────────

/**
 * Read a schedule from disk.
 * @param {string} clientId
 * @returns {object|null} Schedule object or null if not found
 */
function getSchedule(clientId) {
  ensureSchedulesDir();
  const filePath = path.join(SCHEDULES_DIR, `${clientId}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[Scheduler] Could not read schedule for ${clientId}: ${err.message}`);
    return null;
  }
}

/**
 * Write a schedule to disk.
 * @param {string} clientId
 * @param {object} schedule
 */
function saveSchedule(clientId, schedule) {
  ensureSchedulesDir();
  const filePath = path.join(SCHEDULES_DIR, `${clientId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(schedule, null, 2), 'utf8');
}

// ─── Calendar Building ────────────────────────────────────────────────────────

/**
 * Generate a 7-day content calendar starting from startDate.
 * Uses selectCategory with running history to enforce rotation rules.
 *
 * @param {object} clientConfig - Client configuration
 * @param {Date}   startDate    - First day of the calendar
 * @returns {Array} Array of 7 day objects: { date, category, status, postId }
 */
function buildWeeklyCalendar(clientConfig, startDate) {
  const days = [];
  const runningHistory = [];

  for (let i = 0; i < 7; i++) {
    const day = addDays(startDate, i);
    const ds = dateStr(day);
    const category = selectCategory(clientConfig, runningHistory, day);

    days.push({
      date: ds,
      category,
      status: 'planned',
      postId: null,
    });

    // Add to running history so next day's selection knows what we've done
    runningHistory.unshift(category);
  }

  return days;
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

/**
 * Get an existing valid schedule or build a fresh 7-day one.
 * A schedule is "valid" if it covers today and has at least today's date.
 *
 * @param {object} clientConfig
 * @returns {object} Schedule object
 */
function getOrCreateSchedule(clientConfig) {
  const { clientId } = clientConfig;
  const today = todayStr();
  const existing = getSchedule(clientId);

  if (existing && existing.days && existing.days.length > 0) {
    const dates = existing.days.map((d) => d.date).sort();
    const lastDate = dates[dates.length - 1];

    // Schedule is valid if it still covers today or future dates
    if (lastDate >= today) {
      return existing;
    }
  }

  // Build a fresh 7-day calendar from today
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const days = buildWeeklyCalendar(clientConfig, startDate);

  const schedule = {
    clientId,
    generatedAt: new Date().toISOString(),
    days,
  };

  saveSchedule(clientId, schedule);
  return schedule;
}

// ─── Status Updates ───────────────────────────────────────────────────────────

/**
 * Mark a day as posted and record the post ID.
 * @param {string} clientId
 * @param {string} date    - YYYY-MM-DD
 * @param {string} postId
 */
function markPosted(clientId, date, postId) {
  const schedule = getSchedule(clientId);
  if (!schedule) return;

  const day = schedule.days.find((d) => d.date === date);
  if (day) {
    day.status = 'posted';
    day.postId = postId;
    day.postedAt = new Date().toISOString();
  }

  saveSchedule(clientId, schedule);
}

/**
 * Mark a day as skipped.
 * @param {string} clientId
 * @param {string} date - YYYY-MM-DD
 */
function markSkipped(clientId, date) {
  const schedule = getSchedule(clientId);
  if (!schedule) return;

  const day = schedule.days.find((d) => d.date === date);
  if (day) {
    day.status = 'skipped';
    day.skippedAt = new Date().toISOString();
  }

  saveSchedule(clientId, schedule);
}

// ─── History Retrieval ────────────────────────────────────────────────────────

/**
 * Get the last N days of posted categories for rotation logic.
 * Returns array of category strings, most recent first.
 * Includes all days (planned, posted, skipped) for category awareness.
 *
 * @param {string} clientId
 * @param {number} days - Number of recent days to look back
 * @returns {string[]} Array of category strings
 */
function getRecentHistory(clientId, days = 14) {
  const schedule = getSchedule(clientId);
  if (!schedule || !schedule.days) return [];

  return schedule.days
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date)) // most recent first
    .slice(0, days)
    .map((d) => d.category)
    .filter(Boolean);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  getSchedule,
  saveSchedule,
  buildWeeklyCalendar,
  getOrCreateSchedule,
  markPosted,
  markSkipped,
  getRecentHistory,
};
