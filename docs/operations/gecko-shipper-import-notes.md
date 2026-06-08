# Gecko-shipper Import Notes

Source repo reviewed: https://github.com/Geckos-tech/Gecko-shipper

## What Was Useful

The repo is not a deployable web app. It is a set of operational skills and PowerShell scripts for a gecko shipping assistant.

The strongest ideas to reuse in Hatchkit were:

- A weather safety policy that defaults to HOLD when any checked point is unsafe.
- A structured SAFE / HOLD / REVIEW decision contract.
- A FedEx payload preflight that checks whether the label payload is technically complete.
- An operator safety gate that separates shipment safety from label payload readiness.
- A review-only boundary so automation never buys a live label without human approval.

## What We Did Not Reuse Directly

The generic 30 F to 85 F safety policy was not copied as the main Hatchkit rule because Hatchkit already has species-specific shipping tolerances in `data/species-db.json`.

For example, crested geckos are more heat-sensitive than a broad generic live-animal policy. Hatchkit keeps the stricter species rules and uses the Gecko-shipper structure as an operator workflow layer.

## What Was Added To Hatchkit

New files:

- `agents/shipping-agent/fulfillment-gate.js`
- `agents/shipping-agent/order-normalizer.js`
- `data/fedex-package-profiles.json`
- `data/us-state-codes.json`

New server endpoint:

- `POST /webhooks/shipping/operator-gate`
- `POST /webhooks/shipping/order-review`

New shipping-agent export:

- `createShipmentOperatorReview`
- `normalizeOrderForShipment`

## Operator Gate Output

The operator gate returns:

- `payloadReadyForLiveLabelCreation`
- `policyApprovedForShipment`
- `operatorDisposition`
- `blockingIssues`
- `warnings`
- `reasons`
- `reviewOnly`

Operator dispositions:

- `DO_NOT_CREATE_LABEL`
- `REVIEW_REQUIRED`
- `READY_FOR_OPERATOR_APPROVAL`

## Safety Boundary

The current implementation does not purchase FedEx labels. It prepares a review-only FedEx-style payload, validates required fields, and combines that with the Hatchkit weather/species decision.

A human must still approve the shipment before any live label purchase.

## Next Practical Upgrade

After HighLevel products/orders and FedEx credentials are available:

1. Add FedEx rate/transit lookup.
2. Compare selected service to Priority Overnight expectations.
3. Add hold-at-FedEx-office preference and address validation.
4. Keep label creation behind explicit operator approval.
