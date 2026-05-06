#!/usr/bin/env node
/**
 * Build a local order-to-shipping review fixture without calling weather,
 * HighLevel, FedEx, or any live carrier API.
 */
const { buildDemoShippingFixture } = require('../lib/demo-shipping-fixture');

const quiet = process.argv.includes('--quiet');

function buildFixture() {
  const fixture = buildDemoShippingFixture();
  return {
    normalizedShipment: fixture.normalizedShipment,
    review: fixture.review,
  };
}

function main() {
  const result = buildFixture();
  const disposition = result.review.operatorSafetyGate.operatorDisposition;
  if (disposition !== 'READY_FOR_OPERATOR_APPROVAL') {
    throw new Error(`Expected READY_FOR_OPERATOR_APPROVAL, got ${disposition}`);
  }

  if (result.normalizedShipment.missing.weatherInputs.length > 0) {
    throw new Error(`Missing weather inputs: ${result.normalizedShipment.missing.weatherInputs.join(', ')}`);
  }

  if (result.normalizedShipment.missing.labelInputs.length > 0) {
    throw new Error(`Missing label inputs: ${result.normalizedShipment.missing.labelInputs.join(', ')}`);
  }

  if (!quiet) {
    console.log(JSON.stringify(result, null, 2));
  }
}

if (require.main === module) {
  main();
}

module.exports = { buildFixture };
