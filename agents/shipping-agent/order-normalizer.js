const { normalizeStateCode } = require('./fulfillment-gate');

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function firstValue(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    return value;
  }
  return '';
}

function cleanString(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function cleanPhone(value) {
  return cleanString(value).replace(/[^\d+]/g, '');
}

function tagify(value, separator = '_') {
  return cleanString(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');
}

function normalizeSpeciesId(value) {
  const raw = cleanString(value);
  if (!raw) return '';
  return tagify(raw, '_');
}

function parseCityState(location) {
  const parts = cleanString(location).split(',').map((part) => part.trim()).filter(Boolean);
  return {
    city: parts[0] || '',
    stateOrProvinceCode: normalizeStateCode(parts[1] || ''),
  };
}

function splitName(name) {
  const parts = cleanString(name).split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  };
}

function getLineItems(fields) {
  return asArray(firstValue(
    fields.lineItems,
    fields.line_items,
    fields.items,
    fields.products,
    fields.orderItems,
    fields.order_items
  ));
}

function firstLineItem(fields) {
  return asObject(getLineItems(fields)[0]);
}

function getNestedPayload(payload) {
  return {
    ...asObject(payload),
    ...asObject(payload.fields),
    ...asObject(payload.customData),
    ...asObject(payload.custom_data),
    ...asObject(payload.order),
  };
}

function addressFrom(value = {}) {
  const address = asObject(value.address || value.shippingAddress || value.shipping_address || value);
  const residentialValue = firstValue(address.residential, address.isResidential);
  const streetLines = asArray(firstValue(
    address.streetLines,
    address.street_lines,
    address.addressLines,
    address.address_lines,
    address.address1,
    address.address_1,
    address.addressLine1,
    address.address_line_1,
    address.line1,
    address.street
  )).map(cleanString).filter(Boolean);

  const line2 = cleanString(firstValue(
    address.address2,
    address.address_2,
    address.addressLine2,
    address.address_line_2,
    address.line2
  ));
  if (line2) streetLines.push(line2);

  return {
    streetLines,
    city: cleanString(firstValue(address.city, address.town)),
    stateOrProvinceCode: normalizeStateCode(firstValue(
      address.stateOrProvinceCode,
      address.state,
      address.province,
      address.region
    )),
    postalCode: cleanString(firstValue(address.postalCode, address.postal_code, address.zip, address.zipCode)),
    countryCode: cleanString(firstValue(address.countryCode, address.country_code, address.country, 'US')).toUpperCase(),
    residential: residentialValue === '' ? undefined : Boolean(residentialValue),
  };
}

function contactFrom(value = {}, fallback = {}) {
  const contact = asObject(value.contact || value.customer || value.recipient || value);
  const fallbackName = [fallback.firstName, fallback.lastName].filter(Boolean).join(' ');
  return {
    personName: cleanString(firstValue(
      contact.personName,
      contact.name,
      contact.fullName,
      contact.full_name,
      fallback.name,
      fallbackName
    )),
    phoneNumber: cleanPhone(firstValue(contact.phoneNumber, contact.phone, contact.mobile, fallback.phone)),
    companyName: cleanString(firstValue(contact.companyName, contact.businessName, fallback.companyName)),
    emailAddress: cleanString(firstValue(contact.emailAddress, contact.email, fallback.email)),
  };
}

function buildShipper(clientConfig = {}, fields = {}) {
  const originInput = asObject(firstValue(fields.shipper, fields.origin, fields.sender, {}));
  const configuredOrigin = asObject(firstValue(
    clientConfig.shippingOrigin,
    clientConfig.fulfillmentOrigin,
    clientConfig.fulfillmentAddress,
    {}
  ));
  const parsedLocation = parseCityState(clientConfig.location);
  const configuredAddress = addressFrom(configuredOrigin);
  const inputAddress = addressFrom(originInput);

  return {
    contact: contactFrom(originInput, {
      name: clientConfig.ownerName,
      phone: clientConfig.ownerPhone,
      email: clientConfig.ownerEmail,
      companyName: clientConfig.businessName,
    }),
    address: {
      streetLines: inputAddress.streetLines.length > 0 ? inputAddress.streetLines : configuredAddress.streetLines,
      city: firstValue(inputAddress.city, configuredAddress.city, parsedLocation.city),
      stateOrProvinceCode: firstValue(
        inputAddress.stateOrProvinceCode,
        configuredAddress.stateOrProvinceCode,
        parsedLocation.stateOrProvinceCode
      ),
      postalCode: firstValue(inputAddress.postalCode, configuredAddress.postalCode, fields.originZip, clientConfig.breederZip),
      countryCode: firstValue(inputAddress.countryCode, configuredAddress.countryCode, 'US'),
      residential: Boolean(firstValue(inputAddress.residential, configuredAddress.residential, false)),
    },
  };
}

function buildRecipient(fields = {}, contactPayload = {}) {
  const shippingInput = asObject(firstValue(
    fields.shipping,
    fields.shippingAddress,
    fields.shipping_address,
    fields.shipTo,
    fields.ship_to,
    fields.recipient,
    fields.customer,
    fields.billingAddress,
    fields.billing_address,
    {}
  ));
  const address = addressFrom(shippingInput);
  const fallbackName = [contactPayload.firstName, contactPayload.lastName].filter(Boolean).join(' ');

  return {
    contact: contactFrom(shippingInput, {
      name: fallbackName,
      phone: contactPayload.phone,
      email: contactPayload.email,
    }),
    address: {
      ...address,
      postalCode: firstValue(
        address.postalCode,
        fields.destinationZip,
        fields.destination_zip,
        fields.postalCode,
        fields.postal_code,
        fields.zip,
        contactPayload.postalCode
      ),
      residential: address.residential === undefined ? true : Boolean(address.residential),
    },
  };
}

function summarizeOrder(fields = {}) {
  const lineItem = firstLineItem(fields);
  const productName = firstValue(
    fields.productName,
    fields.product_name,
    fields.product,
    fields.offerName,
    fields.offer_name,
    lineItem.name,
    lineItem.productName,
    lineItem.product_name
  );
  const species = firstValue(
    fields.species_interest,
    fields.speciesInterest,
    fields.species,
    fields.animalSpecies,
    fields.animal_species,
    lineItem.species
  );

  return {
    orderId: cleanString(firstValue(fields.orderId, fields.order_id, fields.invoiceId, fields.invoice_id, fields.id)),
    productName: cleanString(productName),
    animalInterest: cleanString(firstValue(
      fields.animalInterest,
      fields.animal_interest,
      fields.animalName,
      fields.animal_name,
      lineItem.animalName,
      lineItem.animal_name
    )),
    species: cleanString(species),
    speciesId: normalizeSpeciesId(species),
    amount: firstValue(fields.amount, fields.total, fields.value, fields.subtotal, lineItem.price),
    purchaseStatus: cleanString(firstValue(fields.purchaseStatus, fields.purchase_status, fields.status, 'Deposit Paid')),
    shippingPreference: cleanString(firstValue(fields.shippingPreference, fields.shipping_preference, fields.fulfillmentMethod)),
  };
}

function buildContactPayload(fields = {}) {
  const customer = asObject(firstValue(fields.customer, fields.contact, fields.recipient, {}));
  const nameParts = splitName(firstValue(fields.name, fields.fullName, fields.full_name, customer.name, customer.fullName));
  const firstName = cleanString(firstValue(fields.firstName, fields.first_name, customer.firstName, customer.first_name, nameParts.firstName));
  const lastName = cleanString(firstValue(fields.lastName, fields.last_name, customer.lastName, customer.last_name, nameParts.lastName));

  return {
    contactId: cleanString(firstValue(fields.contactId, fields.contact_id, customer.id, customer.contactId)),
    firstName,
    lastName,
    email: cleanString(firstValue(fields.email, customer.email, fields.customerEmail, fields.customer_email)),
    phone: cleanPhone(firstValue(fields.phone, customer.phone, fields.customerPhone, fields.customer_phone)),
    postalCode: cleanString(firstValue(
      fields.postalCode,
      fields.postal_code,
      fields.zip,
      customer.postalCode,
      customer.postal_code,
      customer.zip,
      fields.destinationZip,
      fields.destination_zip
    )),
  };
}

function profileKeyForSpecies(speciesId) {
  if (speciesId === 'crested_gecko') return 'crestedGecko';
  return 'defaultLiveAnimal';
}

function findMissingShipmentInputs(shipmentInput) {
  const missing = [];
  if (!shipmentInput.species) missing.push('species');
  if (!shipmentInput.originZip) missing.push('originZip');
  if (!shipmentInput.destinationZip) missing.push('destinationZip');
  return missing;
}

function findMissingLabelInputs(shipmentInput) {
  const missing = [];
  const shipper = shipmentInput.shipper || {};
  const recipient = shipmentInput.recipient || {};

  if (!shipper.contact?.personName) missing.push('shipper.contact.personName');
  if (!shipper.contact?.phoneNumber) missing.push('shipper.contact.phoneNumber');
  if (!shipper.address?.streetLines || shipper.address.streetLines.length === 0) missing.push('shipper.address.streetLines');
  if (!shipper.address?.city) missing.push('shipper.address.city');
  if (!shipper.address?.stateOrProvinceCode) missing.push('shipper.address.stateOrProvinceCode');
  if (!shipper.address?.postalCode) missing.push('shipper.address.postalCode');

  if (!recipient.contact?.personName) missing.push('recipient.contact.personName');
  if (!recipient.address?.streetLines || recipient.address.streetLines.length === 0) missing.push('recipient.address.streetLines');
  if (!recipient.address?.city) missing.push('recipient.address.city');
  if (!recipient.address?.stateOrProvinceCode) missing.push('recipient.address.stateOrProvinceCode');
  if (!recipient.address?.postalCode) missing.push('recipient.address.postalCode');

  return missing;
}

function normalizeOrderForShipment(payload = {}, clientConfig = {}) {
  const fields = getNestedPayload(payload);
  const orderSummary = summarizeOrder(fields);
  const contactPayload = buildContactPayload(fields);
  const shipper = buildShipper(clientConfig, fields);
  const recipient = buildRecipient(fields, contactPayload);

  const species = firstValue(orderSummary.speciesId, normalizeSpeciesId(fields.species));
  const originZip = cleanString(firstValue(fields.originZip, fields.origin_zip, shipper.address.postalCode, clientConfig.breederZip));
  const destinationZip = cleanString(firstValue(
    fields.destinationZip,
    fields.destination_zip,
    recipient.address.postalCode,
    contactPayload.postalCode
  ));

  const shipmentInput = {
    contactId: contactPayload.contactId || cleanString(firstValue(fields.contactId, fields.contact_id)),
    species,
    originZip,
    destinationZip,
    preferredShipDate: cleanString(firstValue(fields.preferredShipDate, fields.preferred_ship_date, fields.shipDate, fields.ship_date)),
    profileKey: cleanString(firstValue(fields.profileKey, fields.profile_key, profileKeyForSpecies(species))),
    serviceType: cleanString(firstValue(fields.serviceType, fields.service_type, 'PRIORITY_OVERNIGHT')),
    shipper,
    recipient,
  };

  return {
    orderSummary,
    contactPayload,
    shipmentInput,
    missing: {
      weatherInputs: findMissingShipmentInputs(shipmentInput),
      labelInputs: findMissingLabelInputs(shipmentInput),
    },
  };
}

module.exports = {
  normalizeOrderForShipment,
  normalizeSpeciesId,
  profileKeyForSpecies,
};
