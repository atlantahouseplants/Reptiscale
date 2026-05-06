# Order To Shipping Review

This is the bridge between a storefront purchase and the live-animal fulfillment gate.

The goal is to let a breeder take an order from HighLevel, Shopify-style checkout, a funnel form, or a custom storefront and turn it into a review-only shipping package.

## What It Does

1. Reads the order, buyer, animal, and shipping address from common payload shapes.
2. Resolves the breeder origin from the Reptiscale client config.
3. Converts the buyer's species interest into the shipping species ID, such as `crested_gecko`.
4. Selects the default package profile, such as `crestedGecko`.
5. Runs the existing weather and species safety check.
6. Produces a review-only FedEx-style payload.
7. Blocks label creation when weather or required label data is not ready.

## Endpoint

`POST /webhooks/shipping/order-review`

This endpoint is review-only by default. It does not buy a label.

Set `updateGHL: true` only when the webhook should tag the contact with the operator disposition.

## Minimum Useful Payload

```json
{
  "locationId": "fqj4rbp2VRkvMa8GWVWn",
  "contactId": "optional-ghl-contact-id",
  "customer": {
    "firstName": "Demo",
    "lastName": "Buyer",
    "email": "demo.lead@example.com",
    "phone": "+14045550199"
  },
  "order": {
    "id": "DEMO-ORDER-1001",
    "productName": "Animal Reservation Deposit",
    "amount": 75,
    "purchaseStatus": "Deposit Paid",
    "species_interest": "Crested Gecko",
    "animalInterest": "Mango - Harlequin Dalmatian"
  },
  "shippingAddress": {
    "address1": "100 Buyer Street",
    "city": "Atlanta",
    "state": "GA",
    "postalCode": "30339",
    "countryCode": "US",
    "residential": true
  },
  "preferredShipDate": "2026-05-11"
}
```

## Accepted Payload Shapes

The normalizer accepts common aliases:

- Buyer: `customer`, `contact`, `recipient`, or direct `firstName`, `lastName`, `email`, `phone`
- Order: `order`, `lineItems`, `items`, `products`, or direct `productName`, `amount`, `purchaseStatus`
- Species: `species_interest`, `speciesInterest`, `species`, `animalSpecies`
- Address: `shippingAddress`, `shipping_address`, `shipping`, `shipTo`, `recipient`
- Destination zip: `destinationZip`, `destination_zip`, `postalCode`, `zip`, or `shippingAddress.postalCode`

## Breeder Origin

The shipper origin comes from the client config:

```json
{
  "shippingOrigin": {
    "streetLines": ["123 Breeder Lane"],
    "city": "Raleigh",
    "stateOrProvinceCode": "NC",
    "postalCode": "27601",
    "countryCode": "US"
  }
}
```

The SunScale value is demo data. Replace it before any real label workflow goes live.

## Local Dry Run

Run:

```bash
npm run simulate:shipping-review
```

The dry run does not call weather, HighLevel, FedEx, or any live carrier API. It proves that the order normalizer and operator gate can build a complete review package.

## Operator Rule

`READY_FOR_OPERATOR_APPROVAL` means the system is technically and policy-ready for a human to review the shipment.

It still does not mean "auto-buy a label." The operator must verify recipient phone, hold-at-facility choice, box size, insulation, service type, and the final ship date before creating a real label.
