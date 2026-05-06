const stateCodes = require('../../data/us-state-codes.json');
const packageProfiles = require('../../data/fedex-package-profiles.json');

function normalizeStateCode(value) {
  if (!value) return '';
  const raw = String(value).trim();
  const upper = raw.toUpperCase();
  if (/^[A-Z]{2}$/.test(upper)) return upper;
  return stateCodes[upper] || upper;
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function cleanPhone(value) {
  if (!value) return '';
  return String(value).replace(/[^\d+]/g, '');
}

function normalizeAddress(address = {}) {
  return {
    streetLines: asArray(address.streetLines || address.street || address.address1),
    city: address.city || '',
    stateOrProvinceCode: normalizeStateCode(address.stateOrProvinceCode || address.state || address.province),
    postalCode: String(address.postalCode || address.zip || '').trim(),
    countryCode: address.countryCode || 'US',
    residential: Boolean(address.residential),
  };
}

function normalizeContact(contact = {}) {
  return {
    personName: contact.personName || contact.name || [contact.firstName, contact.lastName].filter(Boolean).join(' ') || '',
    phoneNumber: cleanPhone(contact.phoneNumber || contact.phone || ''),
    companyName: contact.companyName || contact.businessName || '',
    emailAddress: contact.email || contact.emailAddress || '',
  };
}

function packageProfileFor(speciesId, profileKey) {
  if (profileKey && packageProfiles[profileKey]) return packageProfiles[profileKey];
  if (speciesId === 'crested_gecko') return packageProfiles.crestedGecko;
  return packageProfiles.defaultLiveAnimal;
}

function buildFedexReviewPayload({
  shipmentDecision,
  shipDate,
  speciesId,
  profileKey,
  shipper = {},
  recipient = {},
  packageProfile,
  serviceType,
} = {}) {
  const profile = packageProfile || packageProfileFor(speciesId, profileKey);
  const shipperContact = normalizeContact(shipper.contact || shipper);
  const recipientContact = normalizeContact(recipient.contact || recipient);
  const shipperAddress = normalizeAddress(shipper.address || shipper);
  const recipientAddress = normalizeAddress(recipient.address || recipient);

  const payload = {
    labelResponseOptions: 'LABEL',
    requestedShipment: {
      shipDatestamp: shipDate || shipmentDecision?.recommendedShipDate || null,
      serviceType: serviceType || profile.serviceType || 'PRIORITY_OVERNIGHT',
      packagingType: profile.packagingType,
      pickupType: profile.pickupType || 'DROPOFF_AT_FEDEX_LOCATION',
      blockInsightVisibility: false,
      shippingChargesPayment: {
        paymentType: 'SENDER',
      },
      shipper: {
        contact: shipperContact,
        address: shipperAddress,
      },
      recipients: [
        {
          contact: recipientContact,
          address: recipientAddress,
        },
      ],
      labelSpecification: profile.labelSpecification,
      requestedPackageLineItems: [
        {
          weight: profile.weight,
          dimensions: profile.dimensions,
        },
      ],
    },
    reviewOnly: true,
    reviewNotes: [
      'Generated for operator review only. Do not submit this as a live label without human approval.',
      `Current shipping decision: ${shipmentDecision?.decision || 'UNKNOWN'}`,
      shipmentDecision?.safetyReason ? `Safety reason: ${shipmentDecision.safetyReason}` : null,
      shipmentDecision?.recommendedShipDate ? `Recommended ship date: ${shipmentDecision.recommendedShipDate}` : null,
      'Verify recipient phone, hold-at-facility choice, package details, insulation, and service before label purchase.',
    ].filter(Boolean),
  };

  return payload;
}

function validateFedexPayloadReadiness(payload) {
  const issues = [];
  const warnings = [];
  const shipment = payload?.requestedShipment;

  if (!shipment) {
    return {
      readyForLiveLabelCreation: false,
      blockingIssues: ['Payload missing requestedShipment.'],
      warnings,
    };
  }

  if (!shipment.serviceType) issues.push('Missing serviceType.');
  if (!shipment.packagingType) issues.push('Missing packagingType.');
  if (!shipment.shipDatestamp) warnings.push('Missing shipDatestamp.');

  const shipper = shipment.shipper || {};
  const recipient = asArray(shipment.recipients)[0] || {};
  const shipperContact = shipper.contact || {};
  const shipperAddress = shipper.address || {};
  const recipientContact = recipient.contact || {};
  const recipientAddress = recipient.address || {};

  if (!shipper.contact) issues.push('Missing shipper contact.');
  if (!shipper.address) issues.push('Missing shipper address.');
  if (!shipment.recipients || asArray(shipment.recipients).length === 0) issues.push('Missing recipient.');

  if (!shipperContact.personName) issues.push('Missing shipper personName.');
  if (!shipperContact.phoneNumber) issues.push('Missing shipper phoneNumber.');
  if (!shipperAddress.streetLines || asArray(shipperAddress.streetLines).length === 0) issues.push('Missing shipper streetLines.');
  if (!shipperAddress.city) issues.push('Missing shipper city.');
  if (!shipperAddress.stateOrProvinceCode) issues.push('Missing shipper stateOrProvinceCode.');
  if (!shipperAddress.postalCode) issues.push('Missing shipper postalCode.');
  if (!shipperAddress.countryCode) issues.push('Missing shipper countryCode.');
  if (shipperAddress.stateOrProvinceCode && !/^[A-Z]{2}$/.test(shipperAddress.stateOrProvinceCode)) {
    warnings.push('Shipper stateOrProvinceCode is not a 2-letter code.');
  }

  if (!recipient.contact) issues.push('Missing recipient contact.');
  if (!recipient.address) issues.push('Missing recipient address.');
  if (!recipientContact.personName) issues.push('Missing recipient personName.');
  if (!recipientContact.phoneNumber) warnings.push('Missing recipient phoneNumber.');
  if (!recipientAddress.streetLines || asArray(recipientAddress.streetLines).length === 0) issues.push('Missing recipient streetLines.');
  if (!recipientAddress.city) issues.push('Missing recipient city.');
  if (!recipientAddress.stateOrProvinceCode) issues.push('Missing recipient stateOrProvinceCode.');
  if (!recipientAddress.postalCode) issues.push('Missing recipient postalCode.');
  if (!recipientAddress.countryCode) issues.push('Missing recipient countryCode.');
  if (recipientAddress.stateOrProvinceCode && !/^[A-Z]{2}$/.test(recipientAddress.stateOrProvinceCode)) {
    warnings.push('Recipient stateOrProvinceCode is not a 2-letter code.');
  }

  const firstPackage = asArray(shipment.requestedPackageLineItems)[0];
  if (!firstPackage) {
    issues.push('Missing requestedPackageLineItems.');
  } else {
    if (!firstPackage.weight || !firstPackage.weight.value) issues.push('Missing package weight.');
    if (!firstPackage.dimensions) warnings.push('Missing package dimensions.');
  }

  return {
    readyForLiveLabelCreation: issues.length === 0,
    blockingIssues: issues,
    warnings,
  };
}

function buildOperatorSafetyGate({ shipmentDecision, payloadReadiness } = {}) {
  const decision = shipmentDecision?.decision || 'REVIEW';
  const payloadReady = Boolean(payloadReadiness?.readyForLiveLabelCreation);
  const weatherBlocked = decision === 'HOLD';
  const policyApproved = ['APPROVE', 'SAFE'].includes(decision);

  let operatorDisposition = 'REVIEW_REQUIRED';
  if (!payloadReady || weatherBlocked) {
    operatorDisposition = 'DO_NOT_CREATE_LABEL';
  } else if (policyApproved) {
    operatorDisposition = 'READY_FOR_OPERATOR_APPROVAL';
  }

  const reasons = [];
  reasons.push(payloadReady
    ? 'Shipment payload is technically ready for live label creation.'
    : 'Shipment payload is not technically ready for live label creation.');
  if (policyApproved) reasons.push('Shipment decision is approved under current weather and species policy.');
  else if (weatherBlocked) reasons.push('Shipment decision is HOLD under current weather and species policy.');
  else reasons.push('Shipment decision requires manual review.');
  if (shipmentDecision?.safetyReason) reasons.push(shipmentDecision.safetyReason);
  if (shipmentDecision?.internalNotes) reasons.push(shipmentDecision.internalNotes);

  return {
    payloadReadyForLiveLabelCreation: payloadReady,
    policyApprovedForShipment: policyApproved,
    operatorDisposition,
    blockingIssues: payloadReadiness?.blockingIssues || [],
    warnings: payloadReadiness?.warnings || [],
    reasons,
    reviewOnly: true,
  };
}

function buildShipmentOperatorReview(input = {}) {
  const payload = buildFedexReviewPayload(input);
  const readiness = validateFedexPayloadReadiness(payload);
  const operatorSafetyGate = buildOperatorSafetyGate({
    shipmentDecision: input.shipmentDecision,
    payloadReadiness: readiness,
  });

  return {
    payload,
    readiness,
    operatorSafetyGate,
  };
}

module.exports = {
  normalizeStateCode,
  normalizeAddress,
  normalizeContact,
  buildFedexReviewPayload,
  validateFedexPayloadReadiness,
  buildOperatorSafetyGate,
  buildShipmentOperatorReview,
};
