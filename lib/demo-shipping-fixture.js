const client = require('../data/breeders/sunscale-geckos/client.json');
const { normalizeOrderForShipment } = require('../agents/shipping-agent/order-normalizer');
const { buildShipmentOperatorReview } = require('../agents/shipping-agent/fulfillment-gate');

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
  preferredShipDate: '2026-06-08',
};

function buildDemoShippingFixture(order = sampleOrder) {
  const normalizedShipment = normalizeOrderForShipment(order, client);
  const shipmentDecision = {
    decision: 'APPROVE',
    recommendedShipDate: order.preferredShipDate || sampleOrder.preferredShipDate,
    carrier: 'FedEx Priority Overnight',
    safetyReason: 'Fixture decision for local operator-gate testing.',
    internalNotes: 'No live weather, HighLevel, FedEx, UPS, or carrier API was called for this simulation.',
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

  return {
    client: {
      businessName: client.businessName,
      locationId: client.ghlLocationId,
      breederZip: client.breederZip,
    },
    sampleOrder: order,
    normalizedShipment,
    review,
  };
}

module.exports = {
  sampleOrder,
  buildDemoShippingFixture,
};
