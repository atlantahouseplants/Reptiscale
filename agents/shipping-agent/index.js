require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { checkShippingViability, getRouteWeather } = require('../../integrations/weather-api');
const speciesDb = require('../../data/species-db.json');

// Lazy-load GHL client so agent works without GHL config during testing
let ghlContacts;
function getGHLContacts() {
  if (!ghlContacts) ghlContacts = require('../../ghl/contacts');
  return ghlContacts;
}

const SYSTEM_PROMPT = fs.readFileSync(
  path.join(__dirname, 'prompts', 'system.md'),
  'utf8'
);

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';

// ─── Rule-Based Fallback (no Claude API) ─────────────────────────────────────

function ruleBasedDecision(viability, species) {
  const { canShip, recommendedShipDate, packingInstructions, holdAtFacility, warnings, reason } = viability;

  let decision, customerMessage, internalNotes;

  if (canShip) {
    decision = recommendedShipDate ? 'APPROVE' : 'DELAY';

    const packSummary = packingInstructions.heatPack
      ? `a ${packingInstructions.insulationType.replace('_', ' ')}`
      : packingInstructions.coldPack
      ? 'a cold pack'
      : 'no heat or cold pack (ideal temps)';

    if (holdAtFacility) {
      customerMessage =
        `Your ${species.name} is ready to ship on ${recommendedShipDate}! ` +
        `Because temperatures along the route require extra care, I'm setting this up as a ` +
        `hold-at-facility shipment — you'll pick up at your local FedEx or UPS location rather than residential delivery. ` +
        `I'll send the hold address and tracking number the morning of shipment.`;
    } else {
      customerMessage =
        `Great news — your ${species.name} is all set to ship on ${recommendedShipDate}! ` +
        `I'll be sending via FedEx Priority Overnight with ${packSummary}. ` +
        `You'll receive a tracking number that morning and your gecko should arrive by 10:30 AM the next day.`;
    }

    internalNotes =
      `Route low: ${viability.routeSummary?.worstRouteLow}°F, high: ${viability.routeSummary?.worstRouteHigh}°F. ` +
      `Packing: ${packingInstructions.insulationType}. Hold: ${holdAtFacility}.`;
  } else {
    decision = 'HOLD';

    customerMessage =
      `I've been monitoring the weather along your shipping route and unfortunately ` +
      `I need to hold your ${species.name} a bit longer — ${reason.split('.')[0].toLowerCase()}. ` +
      `I'm watching the forecast daily and will reach out as soon as a safe window opens up. ` +
      `Your gecko is comfortable and eating well here in the meantime!`;

    internalNotes = `No safe ship days in 5-day window. Warnings: ${warnings.join(' | ')}`;
  }

  return {
    decision,
    recommendedShipDate: recommendedShipDate || null,
    carrier: 'FedEx Priority Overnight',
    packingInstructions: {
      heatPack: packingInstructions.heatPack,
      heatPackDuration: packingInstructions.insulationType.includes('72') ? '72hr' : packingInstructions.heatPack ? '40hr' : null,
      coldPack: packingInstructions.coldPack,
      container: species.preferred_packing,
      insulationType: packingInstructions.insulationType === 'none_needed' ? 'standard' : 'extra',
      dropOffTime: holdAtFacility ? 'after_5pm' : 'standard',
    },
    holdAtFacility,
    safetyReason: reason,
    customerMessage,
    internalNotes,
    source: 'rule_based_fallback',
  };
}

// ─── Claude-Powered Decision ──────────────────────────────────────────────────

async function claudeDecision(viability, species, routeData) {
  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const userPrompt = `
## Shipment Request

**Species:** ${species.name} (${species.scientific_name})
**Preferred Container:** ${species.preferred_packing}

**Species Temperature Tolerances:**
- Safe shipping range: ${species.min_ship_temp}°F – ${species.max_ship_temp}°F
- Heat pack required below: ${species.heat_pack_below}°F
- Cold pack required above: ${species.cold_pack_above}°F
- Absolute no-ship below: ${species.no_ship_below}°F
- Absolute no-ship above: ${species.no_ship_above}°F
- Hold at facility above: ${species.hold_at_facility_above}°F

**Route:** ${routeData.origin.zip} → ${routeData.destination.zip}

**Origin Weather (${routeData.origin.name || routeData.origin.zip}):**
${routeData.origin.weather.forecast.map((d) => `  ${d.date}: Low ${d.low}°F / High ${d.high}°F`).join('\n')}

**Destination Weather (${routeData.destination.name || routeData.destination.zip}):**
${routeData.destination.weather.forecast.map((d) => `  ${d.date}: Low ${d.low}°F / High ${d.high}°F`).join('\n')}

**Carrier Hub Weather:**
${routeData.hubs
  .map(
    ({ hub, weather }) =>
      `${hub.carrier} ${hub.city}:\n` +
      weather.forecast.map((d) => `  ${d.date}: Low ${d.low}°F / High ${d.high}°F`).join('\n')
  )
  .join('\n\n')}

**Rule-Based Pre-Analysis:**
- Can Ship: ${viability.canShip}
- Recommended Date: ${viability.recommendedShipDate || 'None found'}
- Packing: ${viability.packingInstructions.insulationType}
- Hold at Facility: ${viability.holdAtFacility}
- Warnings: ${viability.warnings.length > 0 ? viability.warnings.join('; ') : 'None'}

Please evaluate this shipment and return your decision as a JSON object exactly matching the output format in your system prompt. Write the customerMessage as if you are the breeder sending it directly to the customer.
`.trim();

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const text = response.content[0].text.trim();

  // Extract JSON from response (Claude may wrap it in markdown code fences)
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  if (!jsonMatch) throw new Error('Claude response did not contain valid JSON');

  const parsed = JSON.parse(jsonMatch[1]);
  parsed.source = 'claude';
  return parsed;
}

// ─── Update GHL Contact ───────────────────────────────────────────────────────

async function updateGHLContact(contactId, decision) {
  if (!contactId) return;

  try {
    const contacts = getGHLContacts();
    const statusMap = {
      APPROVE: 'Approved to Ship',
      DELAY: 'Pending Weather Check',
      HOLD: 'Pending Weather Check',
    };

    const customFields = [
      {
        id: require('../../data/ghl-config.json').customFields?.shipping_status?.id,
        value: statusMap[decision.decision] || 'Pending Weather Check',
      },
    ].filter((f) => f.id);

    if (customFields.length > 0) {
      await contacts.updateContact(contactId, { customFields });
    }
  } catch (err) {
    console.warn(`[ShippingAgent] Could not update GHL contact ${contactId}: ${err.message}`);
  }
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Evaluate a shipment and return a structured decision + customer message.
 *
 * @param {object} params
 * @param {string} [params.contactId]       - GHL contact ID (optional; skips GHL update if absent)
 * @param {string} params.species           - Species ID from species-db.json (e.g. "leopard_gecko")
 * @param {string} params.originZip         - Breeder's zip code
 * @param {string} params.destinationZip    - Buyer's zip code
 * @param {string} [params.preferredShipDate] - ISO date string (used for context only; agent finds best day)
 * @param {boolean} [params.updateGHL=true] - Whether to update GHL contact on completion
 * @returns {Promise<object>} Shipping decision object
 */
async function evaluateShipment({ contactId, species: speciesId, originZip, destinationZip, preferredShipDate, updateGHL = true }) {
  // 1. Resolve species
  const species = speciesDb.species.find(
    (s) => s.id === speciesId || s.name.toLowerCase() === speciesId.toLowerCase()
  );
  if (!species) throw new Error(`Unknown species: "${speciesId}"`);

  // 2. Get weather data
  let viability, routeData;
  try {
    [viability, routeData] = await Promise.all([
      checkShippingViability(originZip, destinationZip, speciesId),
      getRouteWeather(originZip, destinationZip),
    ]);
  } catch (err) {
    if (err.response?.status === 401) {
      throw new Error('Weather API key inactive. Add a valid OPENWEATHERMAP_API_KEY to .env');
    }
    throw err;
  }

  // 3. Generate decision (Claude or rule-based)
  let result;
  if (ANTHROPIC_API_KEY) {
    try {
      result = await claudeDecision(viability, species, routeData);
    } catch (err) {
      console.warn(`[ShippingAgent] Claude API error, falling back to rules: ${err.message}`);
      result = ruleBasedDecision(viability, species);
    }
  } else {
    result = ruleBasedDecision(viability, species);
  }

  // 4. Update GHL contact if requested
  if (updateGHL && contactId) {
    await updateGHLContact(contactId, result);
  }

  return {
    ...result,
    input: { contactId, species: speciesId, originZip, destinationZip, preferredShipDate },
  };
}

module.exports = { evaluateShipment };
