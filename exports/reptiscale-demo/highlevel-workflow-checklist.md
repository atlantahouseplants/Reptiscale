# HighLevel Workflow Checklist

Client: SunScale Geckos
Location ID: oCn199rzTjj0rPgqXyXU

Use this after the webhook server has a public `BASE_URL`.

## Endpoint Map

| Event | Endpoint | Purpose |
|---|---|---|
| Lead magnet form | `/webhooks/ghl/lead-magnet` | Creates or updates the contact, tags buyer interest, and starts lead nurture. |
| Offer click | `/webhooks/ghl/offer-clicked` | Marks animal/offer interest and starts reservation follow-up. |
| Order submitted | `/webhooks/ghl/order-submitted` | Marks purchase, sends confirmation, checks shipping, and builds operator review when possible. |
| Review submitted | `/webhooks/ghl/review-submitted` | Moves the buyer into advocacy, referral, and proof collection. |
| Referral submitted | `/webhooks/ghl/referral` | Captures referred leads and starts the buyer journey. |
| Shipping evaluate | `/webhooks/shipping/evaluate` | Runs weather/species decision for a route. |
| Operator gate | `/webhooks/shipping/operator-gate` | Checks weather decision plus label payload readiness. Review-only. |
| Order shipping review | `/webhooks/shipping/order-review` | Normalizes an order into the operator gate. Review-only. |
| Weather re-check | `/webhooks/shipping/weather-check` | Re-checks pending shipments on a schedule. |

## Workflows To Build

### 1. Lead Magnet Delivery

Trigger: Starter guide form submitted.

Webhook action:

`POST {BASE_URL}/webhooks/ghl/lead-magnet`

Required payload fields:

- `locationId`
- `firstName`
- `email`
- `phone`
- `species_interest`
- `source`
- `offerKey`

### 2. Offer Clicked / Animal Interest

Trigger: Animal detail CTA, reservation page visit, or manual workflow action.

Webhook action:

`POST {BASE_URL}/webhooks/ghl/offer-clicked`

Required payload fields:

- `locationId`
- `email` or `contactId`
- `species_interest`
- `animalInterest`
- `offerKey`

### 3. Order Submitted

Trigger: Payment received, order form submitted, or deposit paid.

Webhook action:

`POST {BASE_URL}/webhooks/ghl/order-submitted`

Recommended payload fields:

- `locationId`
- `contactId`, `email`, or `phone`
- `species_interest`
- `animalInterest`
- `productName`
- `amount`
- `purchaseStatus`
- `shippingAddress`
- `preferredShipDate`

### 4. Order Shipping Review

Trigger: Same order/payment event, or a separate internal fulfillment workflow.

Webhook action:

`POST {BASE_URL}/webhooks/shipping/order-review`

Use this to show the operator review package directly.

### 5. Shipping Weather Re-Check

Trigger: Daily scheduled workflow, early morning in the breeder's timezone.

Webhook action:

`POST {BASE_URL}/webhooks/shipping/weather-check`

### 6. Review Submitted

Trigger: Review form submitted or manual review received.

Webhook action:

`POST {BASE_URL}/webhooks/ghl/review-submitted`

### 7. Referral Submitted

Trigger: Referral form submitted.

Webhook action:

`POST {BASE_URL}/webhooks/ghl/referral`

## Smart Lists

- New crested gecko leads: `interest:crested-gecko` and `status:new-lead`
- Hot animal buyers: `journey:offer-presented` or `status:hot-lead`
- Shipping holds: `shipping:hold` or `shipping:pending-weather-check`
- Operator review queue: `shipping:operator-review` and not `shipping:ready-for-operator-approval`
- Ready for label approval: `shipping:ready-for-operator-approval`
- Review/referral candidates: `journey:advocacy` or `review:received`
- Repeat buyer VIP: `journey:repeat-buyer` or `status:repeat-buyer`

## Manual Blocker

The current API setup has created the CRM foundation, products, demo contacts, opportunities, trigger links, store origin, and demo shipping option. The remaining blockers are the visual HighLevel builders: pages/funnels, smart lists, payment/order-form layout, accelerated workflows, and inbox examples if no conversation provider is configured.
