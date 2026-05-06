# Live Animal Fulfillment Gate

The fulfillment gate prevents an unsafe shortcut:

"Weather looks OK" must not automatically become "buy a shipping label."

## Two Separate Decisions

1. Shipment policy decision

This comes from the Reptiscale shipping agent. It checks species tolerances, origin weather, destination weather, and carrier hub weather.

2. Label payload readiness

This checks whether the FedEx-style shipment payload has the required shipper, recipient, package, service, and address data.

## Final Operator Disposition

The gate combines both decisions:

| Weather/Policy | Payload Ready | Output |
|---|---|---|
| HOLD | Any | DO_NOT_CREATE_LABEL |
| REVIEW/DELAY | Any | REVIEW_REQUIRED |
| APPROVE | No | DO_NOT_CREATE_LABEL |
| APPROVE | Yes | READY_FOR_OPERATOR_APPROVAL |

## Endpoint

`POST /webhooks/shipping/operator-gate`

For storefront or HighLevel order events, use `POST /webhooks/shipping/order-review`. That endpoint normalizes buyer/order/address data first, then sends the result through this same operator gate.

Minimum request:

```json
{
  "species": "crested_gecko",
  "originZip": "27601",
  "destinationZip": "30339",
  "profileKey": "crestedGecko",
  "shipper": {
    "contact": {
      "personName": "Sarah Mitchell",
      "phoneNumber": "+19195550100",
      "companyName": "SunScale Geckos"
    },
    "address": {
      "streetLines": ["123 Breeder Lane"],
      "city": "Raleigh",
      "stateOrProvinceCode": "NC",
      "postalCode": "27601",
      "countryCode": "US"
    }
  },
  "recipient": {
    "contact": {
      "personName": "Demo Buyer",
      "phoneNumber": "+14045550199"
    },
    "address": {
      "streetLines": ["100 Buyer Street"],
      "city": "Atlanta",
      "stateOrProvinceCode": "GA",
      "postalCode": "30339",
      "countryCode": "US",
      "residential": true
    }
  }
}
```

## Important

This endpoint is review-only. It does not create or buy a FedEx label.

Use it before label creation so the breeder can see whether the shipment is:

- blocked by weather/species policy,
- blocked by incomplete label data,
- or ready for human approval.

## Demo Dry Run

Run this local fixture to prove the order-to-shipping path without touching live weather, HighLevel, FedEx, or any carrier account:

```bash
npm run simulate:shipping-review
```
