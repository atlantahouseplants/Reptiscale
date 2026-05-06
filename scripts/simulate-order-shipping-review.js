#!/usr/bin/env node
/**
 * Build a local order-to-shipping review fixture without calling weather,
 * HighLevel, FedEx, or any live carrier API.
 */
const client = require('../data/breeders/sunscale-geckos/client.json');
const { normalizeOrderForShipment } = require('../agents/shipping-agent/order-normalizer');
const { buildShipmentOperatorReview } = require('../agents/shipping-agent/fulfillment-gate');

const quiet = process.argv.includes('--quiet');

const sampleOrder = {
  locationId: client.ghlLocationId,
  contactId: 'demo-contact-id',
  customer: {
    firstName: 'Demo',
    lastName: 'Buyer',
    email: 'demo.lead@example.com',
    phone: '+14045550199',
  },
  order: {
    id: 'DEMO-ORDER-1001',
    productName: 'Animal Reservation Deposit',
    amount: 75,
    purchaseStatus: 'Deposit Paid',
    species_interest: 'Crested Gecko',
    animalInterest: 'Mango - Harlequin Dalmatian',
  },
  shippingAddress: {
    address1: '100 Buyer Street',
    city: 'Atlanta',
    state: 'GA',
    postalCode: '30339',
    countryCode: 'US',
    residential: true,
  },
  preferredShipDate: '2026-05-11',
};

function buildFixture() {
  const normalizedShipment = normalizeOrderForShipment(sampleOrder, client);
  const shipmentDecision = {
    decision: 'APPROVE',
    recommendedShipDate: sampleOrder.preferredShipDate,
    carrier: 'FedEx Priority Overnight',
    safetyReason: 'Fixture decision for local operator-gate testing.',
    internalNotes: 'No live weather API was called for this simulation.',
  };

  const review = {
    shipmentDecision,
    ...buildShipmentOperatorReview({
      ...normalizedShipment.shipmentInput,
      shipmentDecision,
      shipDate: shipmentDecision.recommendedShipDate,
      speciesId: normalizedShipment.shipmentInput.species,
    }),
  };

  return { normalizedShipment, review };
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
