require('dotenv').config();

const API_KEY = process.env.OPENWEATHERMAP_API_KEY;

if (!API_KEY) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  OPENWEATHERMAP_API_KEY not set in .env');
  console.log('   Sign up free at: openweathermap.org/api');
  console.log('   Add to .env: OPENWEATHERMAP_API_KEY=your_key_here');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\nRunning with MOCK DATA instead:\n');
  runMock();
  process.exit(0);
}

const { checkShippingViability } = require('../integrations/weather-api');

async function runLive() {
  const tests = [
    {
      label: 'Leopard Gecko — Raleigh NC (27601) → Phoenix AZ (85001)',
      originZip: '27601',
      destZip: '85001',
      species: 'leopard_gecko',
    },
    {
      label: 'Ball Python — Atlanta GA (30301) → Chicago IL (60601)',
      originZip: '30301',
      destZip: '60601',
      species: 'ball_python',
    },
  ];

  let keyInactive = false;

  for (const test of tests) {
    console.log(`\n${'━'.repeat(60)}`);
    console.log(`TEST: ${test.label}`);
    console.log('━'.repeat(60));

    try {
      const result = await checkShippingViability(test.originZip, test.destZip, test.species);
      printDecision(result);
    } catch (err) {
      if (err.response?.status === 401) {
        console.log('⚠️  OpenWeatherMap key not yet active (new keys take up to 2 hours).');
        keyInactive = true;
      } else {
        console.error(`❌ Error: ${err.message}`);
      }
    }
  }

  if (keyInactive) {
    console.log('\n[Showing mock data to demonstrate decision engine output]\n');
    runMock();
  }
}

function printDecision(d) {
  const icon = d.canShip ? '✅' : '🚫';
  console.log(`\n${icon} CAN SHIP: ${d.canShip}`);
  console.log(`   Species:       ${d.species.name}`);
  console.log(`   Reason:        ${d.reason}`);
  console.log(`   Ship Date:     ${d.recommendedShipDate || 'NONE — hold until conditions improve'}`);
  console.log(`\n   Packing Instructions:`);
  console.log(`     Heat Pack:   ${d.packingInstructions.heatPack}`);
  console.log(`     Cold Pack:   ${d.packingInstructions.coldPack}`);
  console.log(`     Insulation:  ${d.packingInstructions.insulationType}`);
  console.log(`     Container:   ${d.packingInstructions.preferredContainer}`);
  console.log(`\n   Hold at Facility: ${d.holdAtFacility}`);
  console.log(`\n   Route:`);
  console.log(`     Origin:      ${d.routeSummary.origin}`);
  console.log(`     Destination: ${d.routeSummary.destination}`);
  if (d.routeSummary.worstRouteLow !== null) {
    console.log(`     Route Low:   ${d.routeSummary.worstRouteLow}°F`);
    console.log(`     Route High:  ${d.routeSummary.worstRouteHigh}°F`);
  }
  if (d.warnings.length > 0) {
    console.log(`\n   Warnings:`);
    d.warnings.forEach((w) => console.log(`     ⚠️  ${w}`));
  }
}

function runMock() {
  const mockDecisions = [
    {
      canShip: true,
      reason: 'Safe to ship on 2026-03-17 (Tuesday). Route temps: low 48°F / high 74°F.',
      species: { id: 'leopard_gecko', name: 'Leopard Gecko' },
      recommendedShipDate: '2026-03-17',
      packingInstructions: {
        heatPack: true,
        coldPack: false,
        insulationType: '40hr_heat_pack',
        preferredContainer: 'deli_cup',
      },
      holdAtFacility: false,
      warnings: [],
      routeSummary: {
        origin: 'Raleigh (27601)',
        destination: 'Phoenix (85001)',
        worstRouteHigh: 74,
        worstRouteLow: 48,
      },
    },
    {
      canShip: false,
      reason:
        'No safe ship days (Mon–Wed) found in the 5-day forecast for Ball Python. ' +
        'Temperature extremes exceed species tolerances at one or more points on the route.',
      species: { id: 'ball_python', name: 'Ball Python' },
      recommendedShipDate: null,
      packingInstructions: {
        heatPack: false,
        coldPack: false,
        insulationType: 'none_needed',
        preferredContainer: 'cloth_bag',
      },
      holdAtFacility: false,
      warnings: [
        '2026-03-17: Cannot ship — Low 14°F below species no-ship minimum (38°F)',
        '2026-03-18: Cannot ship — Low 11°F below species no-ship minimum (38°F)',
        '2026-03-19: Cannot ship — Low 16°F below species no-ship minimum (38°F)',
      ],
      routeSummary: {
        origin: 'Atlanta (30301)',
        destination: 'Chicago (60601)',
        worstRouteHigh: null,
        worstRouteLow: null,
      },
    },
  ];

  const labels = [
    'Leopard Gecko — Raleigh NC (27601) → Phoenix AZ (85001)',
    'Ball Python — Atlanta GA (30301) → Chicago IL (60601)',
  ];

  mockDecisions.forEach((d, i) => {
    console.log(`\n${'━'.repeat(60)}`);
    console.log(`TEST: ${labels[i]} [MOCK]`);
    console.log('━'.repeat(60));
    printDecision(d);
  });

  console.log('\n\n[Add OPENWEATHERMAP_API_KEY to .env to run with live weather data]\n');
}

runLive()
  .then(() => {
    console.log('\n[Re-run after OpenWeatherMap key activates to see live data]\n');
  })
  .catch((err) => {
    console.error('Fatal:', err.message);
    process.exit(1);
  });
