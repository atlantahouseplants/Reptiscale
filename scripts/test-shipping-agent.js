require('dotenv').config();

const WEATHER_KEY = process.env.OPENWEATHERMAP_API_KEY;
const CLAUDE_KEY = process.env.ANTHROPIC_API_KEY;

console.log('━'.repeat(60));
console.log('HatchKit Shipping Decision Agent — Test');
console.log('━'.repeat(60));
console.log(`Weather API:  ${WEATHER_KEY ? '✅ Key present' : '⚠️  No key — will use mock weather'}`);
console.log(`Claude API:   ${CLAUDE_KEY ? '✅ Key present — using Claude ' + (process.env.CLAUDE_MODEL || 'claude-sonnet-4-6') : '⚠️  No key — using rule-based fallback'}`);
console.log('');

// ─── Mock weather injection for testing without live weather API ──────────────

// Always mock weather in this test — weather accuracy is tested in test-weather.js
// This script tests the agent decision logic and Claude API integration
{
  // Monkey-patch the weather module with predictable mock data
  const weatherModule = require('../integrations/weather-api');
  const speciesDb = require('../data/species-db.json');

  const MOCK_SCENARIOS = {
    good: {
      // Good shipping weather: mild temps, no heat/cold pack needed
      originForecast: [
        { date: nextTuesday(), low: 58, high: 72 },
        { date: nextWednesday(), low: 60, high: 74 },
      ],
      destForecast: [
        { date: nextTuesday(), low: 55, high: 70 },
        { date: nextWednesday(), low: 57, high: 71 },
      ],
      hubForecast: [
        { date: nextTuesday(), low: 52, high: 68 },
        { date: nextWednesday(), low: 54, high: 69 },
      ],
    },
    hot: {
      // Hot destination — crested gecko should hold
      originForecast: [
        { date: nextTuesday(), low: 68, high: 85 },
        { date: nextWednesday(), low: 70, high: 87 },
      ],
      destForecast: [
        { date: nextTuesday(), low: 78, high: 97 },
        { date: nextWednesday(), low: 80, high: 99 },
      ],
      hubForecast: [
        { date: nextTuesday(), low: 70, high: 88 },
        { date: nextWednesday(), low: 72, high: 90 },
      ],
    },
  };

  const origCheck = weatherModule.checkShippingViability;
  const origRoute = weatherModule.getRouteWeather;

  weatherModule.checkShippingViability = async (originZip, destZip, speciesId) => {
    const scenario = destZip === '85001' ? MOCK_SCENARIOS.hot : MOCK_SCENARIOS.good;
    const species = speciesDb.species.find((s) => s.id === speciesId || s.name.toLowerCase() === speciesId.toLowerCase());
    const shipDate = destZip === '85001' ? null : nextTuesday();
    const destHigh = scenario.destForecast[0].high;
    const destLow = scenario.destForecast[0].low;

    const canShip = destHigh <= species.no_ship_above && destLow >= species.no_ship_below;

    return {
      canShip,
      reason: canShip
        ? `Safe to ship on ${shipDate}. Route temps: low ${destLow}°F / high ${destHigh}°F. [MOCK DATA]`
        : `Destination high ${destHigh}°F exceeds ${species.name} no-ship maximum (${species.no_ship_above}°F). [MOCK DATA]`,
      species: { id: species.id, name: species.name },
      recommendedShipDate: canShip ? shipDate : null,
      packingInstructions: {
        heatPack: destLow < species.heat_pack_below,
        coldPack: destHigh > species.cold_pack_above,
        insulationType: destLow < species.heat_pack_below ? '40hr_heat_pack' : destHigh > species.cold_pack_above ? 'cold_pack' : 'none_needed',
        preferredContainer: species.preferred_packing,
      },
      holdAtFacility: destHigh > species.hold_at_facility_above,
      warnings: canShip ? [] : [`${shipDate || nextTuesday()}: Cannot ship — destination ${destHigh}°F exceeds species limit`],
      routeSummary: { origin: `Mock Origin (${originZip})`, destination: `Mock Destination (${destZip})`, worstRouteHigh: destHigh, worstRouteLow: destLow },
    };
  };

  weatherModule.getRouteWeather = async (originZip, destZip) => {
    const scenario = destZip === '85001' ? MOCK_SCENARIOS.hot : MOCK_SCENARIOS.good;
    return {
      origin: { zip: originZip, name: 'Mock Origin', lat: 35.8, lon: -78.6, weather: { forecast: scenario.originForecast } },
      destination: { zip: destZip, name: 'Mock Destination', lat: 33.4, lon: -112.0, weather: { forecast: scenario.destForecast } },
      hubs: [
        { hub: { id: 'fedex_memphis', carrier: 'FedEx', city: 'Memphis' }, weather: { forecast: scenario.hubForecast } },
        { hub: { id: 'ups_louisville', carrier: 'UPS', city: 'Louisville' }, weather: { forecast: scenario.hubForecast } },
      ],
    };
  };

  console.log('[Using MOCK weather data — run test-weather.js separately for live weather tests]\n');
}

const { evaluateShipment } = require('../agents/shipping-agent/index');

// ─── Date Helpers ─────────────────────────────────────────────────────────────

function nextTuesday() {
  const d = new Date();
  const day = d.getDay();
  const daysUntil = (2 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntil);
  return d.toISOString().split('T')[0];
}

function nextWednesday() {
  const d = new Date();
  const day = d.getDay();
  const daysUntil = (3 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntil);
  return d.toISOString().split('T')[0];
}

// ─── Print Result ─────────────────────────────────────────────────────────────

function printResult(label, result) {
  const icon = { APPROVE: '✅', DELAY: '⏳', HOLD: '🚫' }[result.decision] || '❓';

  console.log(`\n${'━'.repeat(60)}`);
  console.log(`SCENARIO: ${label}`);
  console.log('━'.repeat(60));
  console.log(`\n${icon} DECISION: ${result.decision}`);
  console.log(`   Species:          ${result.input.species}`);
  console.log(`   Route:            ${result.input.originZip} → ${result.input.destinationZip}`);
  console.log(`   Ship Date:        ${result.recommendedShipDate || 'NONE — hold until safe window'}`);
  console.log(`   Carrier:          ${result.carrier || 'TBD'}`);
  console.log(`   Hold at Facility: ${result.holdAtFacility}`);
  console.log(`   Safety Reason:    ${result.safetyReason}`);
  console.log(`   Decision Source:  ${result.source}`);
  console.log(`\n   Packing Instructions:`);
  const p = result.packingInstructions;
  console.log(`     Heat Pack:      ${p.heatPack} ${p.heatPackDuration ? '(' + p.heatPackDuration + ')' : ''}`);
  console.log(`     Cold Pack:      ${p.coldPack}`);
  console.log(`     Container:      ${p.container}`);
  console.log(`     Insulation:     ${p.insulationType}`);
  console.log(`     Drop-off:       ${p.dropOffTime}`);
  console.log(`\n   Internal Notes: ${result.internalNotes}`);
  console.log(`\n   ── Customer Message ──────────────────────────────────`);
  console.log(`   ${result.customerMessage}`);
  console.log('');
}

// ─── Run Tests ────────────────────────────────────────────────────────────────

async function main() {
  const tests = [
    {
      label: 'Leopard Gecko — Raleigh NC → Dallas TX (good weather)',
      params: {
        species: 'leopard_gecko',
        originZip: '27601',
        destinationZip: '75201',
        updateGHL: false,
      },
    },
    {
      label: 'Crested Gecko — Raleigh NC → Phoenix AZ (destination 95–99°F — should HOLD)',
      params: {
        species: 'crested_gecko',
        originZip: '27601',
        destinationZip: '85001',
        updateGHL: false,
      },
    },
  ];

  for (const test of tests) {
    try {
      const result = await evaluateShipment(test.params);
      printResult(test.label, result);
    } catch (err) {
      console.error(`\n❌ Test failed: ${test.label}`);
      console.error(`   ${err.message}`);
    }
  }
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
