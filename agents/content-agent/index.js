// agents/content-agent/index.js
// HatchKit AI Content Engine — Core Generator
// Accepts client config, determines category, calls Claude, returns post object

// Load .env and manually apply to process.env (dotenv v17 compatibility)
const _dotenv = require('dotenv').config();
if (_dotenv.parsed) {
  Object.keys(_dotenv.parsed).forEach(function(k) {
    if (!process.env[k]) process.env[k] = _dotenv.parsed[k];
  });
}

const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const SYSTEM_PROMPT = fs.readFileSync(path.join(__dirname, 'prompts', 'system.md'), 'utf8');
const CATEGORY_TEMPLATES = fs.readFileSync(path.join(__dirname, 'prompts', 'category-templates.md'), 'utf8');

const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const CATEGORIES = [
  'animal_spotlight',
  'care_tips',
  'behind_the_scenes',
  'morph_education',
  'customer_stories',
  'seasonal',
  'engagement',
  'promotional',
];

// ─── Seeded PRNG (mulberry32) ─────────────────────────────────────────────────
// Same seed always produces same sequence. Used for deterministic scheduling.

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// ─── Season Helpers ───────────────────────────────────────────────────────────

function getSeason(month) {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
}

function getSeasonalContext(season) {
  const contexts = {
    spring:
      'It is spring — breeding season is in full swing. Females are laying clutches, eggs are in incubators, ' +
      'first shows of the year are happening or coming up soon. This is the most exciting time of year for gecko breeders.',
    summer:
      'It is summer — hatchlings are emerging weekly, heat shipping challenges are real (early morning pickups, ' +
      'cold packs, careful weather monitoring). Summer expos are happening. Energy is high.',
    fall:
      'It is fall — peak show season. NARBC, major regional expos, the last big buying season before winter. ' +
      'Animals need homes before the cooling period. Breeders are planning next year\'s pairings.',
    winter:
      'It is winter — planning season. Animals are in brumation or slowing down. Breeders are reviewing last ' +
      'year\'s results, shopping for new breeding stock, dreaming about next season\'s hatchlings. Slower pace.',
  };
  return contexts[season] || contexts.spring;
}

// ─── Show Proximity Check ─────────────────────────────────────────────────────

function checkShowProximity(clientConfig, date) {
  const shows = clientConfig.showSchedule || [];
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  for (const show of shows) {
    const showDate = new Date(show.date);
    showDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((showDate - checkDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 3 || diffDays === 2 || diffDays === 1) {
      return { force: 'seasonal', reason: `show_preview:${show.name}`, show };
    }
    if (diffDays === -1) {
      return { force: 'seasonal', reason: `show_recap:${show.name}`, show };
    }
  }
  return null;
}

// ─── Category Selection ───────────────────────────────────────────────────────

/**
 * Select a content category using smart rotation + seasonal weighting.
 *
 * @param {object} clientConfig - Client configuration object
 * @param {Array}  recentHistory - Array of recently used category strings (most recent first)
 * @param {Date}   date - The date this post is for
 * @returns {string} Selected category
 */
function selectCategory(clientConfig, recentHistory, date) {
  const dateObj = date instanceof Date ? date : new Date(date);

  // Check show proximity first (hard overrides)
  const showProximity = checkShowProximity(clientConfig, dateObj);
  if (showProximity && showProximity.force) {
    return showProximity.force;
  }

  const month = dateObj.getMonth() + 1; // 1-12
  const season = getSeason(month);
  const inventory = clientConfig.inventoryCount || 0;

  // Seed PRNG with date + clientId for determinism
  const seedStr = `${dateObj.toISOString().slice(0, 10)}-${clientConfig.clientId}`;
  const rand = mulberry32(seedFromString(seedStr));

  // Determine what categories are blocked by rotation rules
  const lastPost = recentHistory[0] || null;
  const last7 = recentHistory.slice(0, 7);
  const last5 = recentHistory.slice(0, 5);

  // Count recent usage
  const promotionalCount7 = last7.filter((c) => c === 'promotional').length;
  const customerStoriesCount5 = last5.filter((c) => c === 'customer_stories').length;
  const promotionalMax = inventory > 20 ? 2 : 1;

  // Build weighted pool
  const pool = [];

  function addCategory(category, weight) {
    // Apply rotation constraints
    if (category === 'promotional') {
      if (lastPost === 'promotional') return; // never back to back
      if (promotionalCount7 >= promotionalMax) return; // max per 7 days
    }
    if (category === 'customer_stories') {
      if (customerStoriesCount5 >= 1) return; // max once per 5 days
    }
    for (let i = 0; i < weight; i++) {
      pool.push(category);
    }
  }

  // Base weights (sum ~100 for readability)
  const baseWeights = {
    animal_spotlight: inventory > 10 ? 40 : 15,
    care_tips: 15,
    behind_the_scenes: 15,
    morph_education: 15,
    customer_stories: 10,
    seasonal: 10,
    engagement: 10,
    promotional: inventory > 10 ? 10 : 5,
  };

  // Seasonal weight adjustments
  if (season === 'spring') {
    baseWeights.seasonal += 10;
    baseWeights.animal_spotlight += 10;
    baseWeights.behind_the_scenes += 5;
  } else if (season === 'summer') {
    baseWeights.behind_the_scenes += 15;
    baseWeights.care_tips += 10;
  } else if (season === 'fall') {
    baseWeights.seasonal += 15;
    baseWeights.promotional += 10;
    baseWeights.animal_spotlight += 5;
  } else if (season === 'winter') {
    baseWeights.morph_education += 15;
    baseWeights.engagement += 15;
    baseWeights.care_tips += 5;
  }

  // Build pool
  for (const [cat, weight] of Object.entries(baseWeights)) {
    addCategory(cat, Math.max(1, weight));
  }

  // Fallback: if pool is empty (all constrained), allow everything
  if (pool.length === 0) {
    CATEGORIES.forEach((cat) => pool.push(cat));
  }

  // Pick from pool using seeded PRNG
  const index = Math.floor(rand() * pool.length);
  return pool[index];
}

// ─── Post Generator ───────────────────────────────────────────────────────────

/**
 * Generate a social media post using Claude.
 *
 * @param {object} clientConfig - Client configuration object
 * @param {string} category     - Content category (from CATEGORIES list)
 * @param {Date}   date         - Date this post is intended for
 * @returns {Promise<object>}   Structured post object
 */
async function generatePost(clientConfig, category, date) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set in environment variables.');
  }

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const dateObj = date instanceof Date ? date : new Date(date);
  const month = dateObj.getMonth() + 1;
  const season = getSeason(month);
  const seasonContext = getSeasonalContext(season);
  const dateStr = dateObj.toISOString().slice(0, 10);

  // Check show proximity for context
  const showProximity = checkShowProximity(clientConfig, dateObj);
  let showContext = '';
  if (showProximity && showProximity.show) {
    const diff = Math.round(
      (new Date(showProximity.show.date) - dateObj) / (1000 * 60 * 60 * 24)
    );
    if (diff > 0) {
      showContext = `\nSHOW PREVIEW: "${showProximity.show.name}" is ${diff} day(s) away (${showProximity.show.date}) in ${showProximity.show.location}. This post should build excitement for the show.`;
    } else {
      showContext = `\nSHOW RECAP: "${showProximity.show.name}" was yesterday (${showProximity.show.date}) in ${showProximity.show.location}. This post should recap the show experience.`;
    }
  }

  // Find upcoming shows in next 30 days
  const upcomingShows = (clientConfig.showSchedule || []).filter((show) => {
    const showDate = new Date(show.date);
    const diff = Math.round((showDate - dateObj) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 30;
  });

  // Extract category-specific template section from CATEGORY_TEMPLATES
  const categoryKey = category.replace(/_/g, '_').toUpperCase();
  const categorySection = extractCategorySection(CATEGORY_TEMPLATES, category);

  const userMessage = `
## Today's Post Request

**Date:** ${dateStr} (${dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })})
**Season:** ${season.charAt(0).toUpperCase() + season.slice(1)}
**Seasonal Context:** ${seasonContext}
${showContext}

## Breeder Profile
- **Name:** ${clientConfig.ownerName}
- **Business:** ${clientConfig.businessName}
- **Location:** ${clientConfig.location}
- **Brand Voice:** ${clientConfig.brandVoice}

## Collection & Inventory
- **Species:** ${(clientConfig.species || []).join(', ')}
- **Available Morphs:** ${(clientConfig.morphs || []).join(', ')}
- **Current Inventory:** Approximately ${clientConfig.inventoryCount || 'unknown'} animals available
- **Price Range:** $${clientConfig.priceRange?.min || 'N/A'} – $${clientConfig.priceRange?.max || 'N/A'}

## Upcoming Shows (next 30 days)
${upcomingShows.length > 0 ? upcomingShows.map((s) => `- ${s.name} | ${s.date} | ${s.location}`).join('\n') : 'No shows in the next 30 days'}

## Post Category
**Category:** ${category.replace(/_/g, ' ').toUpperCase()}
**Why this category was selected:** ${getCategoryReason(category, season, clientConfig)}

## Category-Specific Guidance
${categorySection}

## Output Format

Return a JSON object with exactly these fields:
\`\`\`json
{
  "caption": "The full caption text WITHOUT hashtags — hook first line, body, then CTA",
  "hashtags": ["array", "of", "hashtag", "strings", "with", "#", "prefix"],
  "photoDirection": "Specific, practical photo direction for the breeder"
}
\`\`\`

Write the caption as ${clientConfig.ownerName} — first person, in her voice. The caption should sound like she wrote it herself, not like it was generated by AI. Include real gecko knowledge naturally. Follow the Instagram caption structure: hook (line 1), body (2-4 sentences), CTA (one ask). Do NOT include hashtags in the caption field — they go in the hashtags array only.
`.trim();

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = response.content[0].text.trim();

  // Parse JSON from response
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  if (!jsonMatch) {
    throw new Error('Claude response did not contain valid JSON. Response: ' + text.slice(0, 200));
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[1]);
  } catch (e) {
    throw new Error('Failed to parse Claude JSON response: ' + e.message);
  }

  // Build structured post object
  const postId = generatePostId(clientConfig.clientId, dateStr, category);
  const scheduledHour = 18 + Math.floor(Math.random() * 2); // 6-7 PM
  const scheduledMinute = Math.random() > 0.5 ? 30 : 0;
  const scheduledTime = new Date(dateObj);
  scheduledTime.setHours(scheduledHour, scheduledMinute, 0, 0);

  return {
    id: postId,
    clientId: clientConfig.clientId,
    category,
    caption: parsed.caption || '',
    hashtags: parsed.hashtags || [],
    photoDirection: parsed.photoDirection || '',
    suggestedTime: scheduledTime.toISOString(),
    platform: 'instagram',
    requiresPhoto: true,
    autoPublish: clientConfig.autoPublish || false,
    generatedAt: new Date().toISOString(),
    scheduledFor: dateStr,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generatePostId(clientId, dateStr, category) {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${clientId}-${dateStr}-${category.slice(0, 4)}-${rand}`;
}

function getCategoryReason(category, season, clientConfig) {
  const inventory = clientConfig.inventoryCount || 0;
  const reasons = {
    animal_spotlight:
      inventory > 10
        ? `High inventory (${inventory} animals) — featuring individual animals drives inquiries and builds connection.`
        : 'Featuring an individual animal builds community connection and drives organic inquiries.',
    care_tips:
      'Educational content builds authority, trust, and long-term follower loyalty. Great for search discovery.',
    behind_the_scenes:
      season === 'spring' || season === 'summer'
        ? 'Active breeding/hatch season — followers love seeing the behind-the-scenes reality right now.'
        : 'Behind-the-scenes content builds the deepest emotional connection with the breeder community.',
    morph_education:
      season === 'winter'
        ? 'Winter planning season — followers are researching morphs and planning their next purchase or project.'
        : 'Morph education establishes expertise and attracts serious hobbyists and prospective buyers.',
    customer_stories:
      'Community celebration content builds social proof and invites others to engage and share their animals.',
    seasonal:
      'Timely content anchored to the current moment in the reptile calendar drives relevance and engagement.',
    engagement:
      season === 'winter'
        ? 'Winter slow season — engagement posts maintain community warmth during quieter months.'
        : 'Engagement posts build two-way conversation and strengthen community bonds.',
    promotional:
      inventory > 10
        ? `Inventory is elevated (${inventory} animals) — featuring available animals helps move stock.`
        : 'Soft promotional content keeps followers aware of what is available without being pushy.',
  };
  return reasons[category] || 'Selected as part of smart content rotation.';
}

function extractCategorySection(templates, category) {
  // Map category to the section header in the templates file
  const headerMap = {
    animal_spotlight: '## 1. ANIMAL_SPOTLIGHT',
    care_tips: '## 2. CARE_TIPS',
    behind_the_scenes: '## 3. BEHIND_THE_SCENES',
    morph_education: '## 4. MORPH_EDUCATION',
    customer_stories: '## 5. CUSTOMER_STORIES',
    seasonal: '## 6. SEASONAL',
    engagement: '## 7. ENGAGEMENT',
    promotional: '## 8. PROMOTIONAL',
  };

  const header = headerMap[category];
  if (!header) return '';

  const startIdx = templates.indexOf(header);
  if (startIdx === -1) return '';

  // Find next section header (## [number].) or end of file
  const nextHeaderMatch = templates.slice(startIdx + header.length).match(/\n## \d+\./);
  const endIdx = nextHeaderMatch
    ? startIdx + header.length + nextHeaderMatch.index
    : templates.length;

  return templates.slice(startIdx, endIdx).trim();
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = { generatePost, selectCategory, CATEGORIES };
