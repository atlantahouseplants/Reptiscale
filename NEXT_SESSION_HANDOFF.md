# Reptiscale / HatchKit Next Session Handoff

Created after the May 5, 2026 build session.

Updated May 6, 2026 morning session with demo-readiness assets.

## Project Goal

Reptiscale is the productized reptile-seller growth machine built on HighLevel:

- Online storefront and reservation funnel
- Lead magnet and buyer education
- CRM tagging, custom fields, and customer journey tracking
- Payment/order follow-up
- Live-animal shipping safety workflow
- Care onboarding
- Reviews, referrals, repeat-buyer campaigns
- Social content engine and demo/sales materials

The demo account is SunScale Geckos.

HighLevel sub-account/location ID:

`fqj4rbp2VRkvMa8GWVWn`

## Current Repo State

Workspace:

`C:\Users\wallg\OneDrive\Desktop\HatchKit`

Important git detail:

- The main repo uses `.gitroot`, not a normal `.git` folder.
- Use this pattern for git commands:

```powershell
git --git-dir=.gitroot --work-tree=. status --short --branch
```

Baseline commit before the May 6 morning continuation:

`3351105 Add next session handoff`

Recent commits:

- `a19fb4f Add order shipping review normalization`
- `138f6b7 Integrate Gecko shipper safety gate`
- `fcba3cb Point website submodule to Reptiscale offer alignment`
- `ff24c67 Add Reptiscale customer handoff guides`
- `434fe86 Add Reptiscale commercial readiness kit`
- `059ed38 Build Reptiscale customer journey demo`

The nested `HatchKit.ai` folder is its own repo/submodule-like folder. Do not delete it or treat its untracked files as part of the root cleanup unless the user explicitly asks.

## What Was Built

### Demo Readiness Assets

Added May 6:

- `scripts/verify-demo-readiness.js`
- `npm run verify:demo`
- `npm start`
- `exports/reptiscale-demo/deployment-runbook.md`
- `exports/reptiscale-demo/highlevel-workflow-checklist.md`
- `exports/reptiscale-demo/demo-test-plan.md`
- `exports/reptiscale-demo/webhook-smoke-test.ps1`

`npm run verify:demo` regenerates the demo export and checks that the main demo files, webhook payloads, endpoint references, shipping origin, and smoke-test assets are present.

### Customer Journey Demo

Core files:

- `data/reptiscale-machine.json`
- `data/demo-products.json`
- `templates/pages/reptiscale-storefront.html`
- `templates/pages/crested-gecko-starter-guide.html`
- `templates/pages/animal-detail.html`
- `templates/pages/reservation-offer.html`
- `templates/emails/lifecycle/*`
- `templates/sms/lifecycle/*`

Key journey webhooks in `server.js`:

- `POST /webhooks/ghl/lead-magnet`
- `POST /webhooks/ghl/offer-clicked`
- `POST /webhooks/ghl/order-submitted`
- `POST /webhooks/ghl/review-submitted`
- `POST /webhooks/ghl/referral`

### Gecko Shipping Safety Integration

The external Gecko-shipper repo was reviewed and its best ideas were folded into Reptiscale.

Core files:

- `agents/shipping-agent/fulfillment-gate.js`
- `agents/shipping-agent/order-normalizer.js`
- `agents/shipping-agent/index.js`
- `data/fedex-package-profiles.json`
- `data/us-state-codes.json`
- `docs/operations/live-animal-fulfillment-gate.md`
- `docs/operations/order-to-shipping-normalization.md`
- `docs/operations/gecko-shipper-import-notes.md`

Shipping endpoints:

- `POST /webhooks/shipping/evaluate`
- `POST /webhooks/shipping/operator-gate`
- `POST /webhooks/shipping/order-review`
- `POST /webhooks/shipping/weather-check`

Important safety rule:

The system prepares review-only shipping payloads. It must not buy a live carrier label without human operator approval.

### Order-To-Shipping Review

The newest completed build lets a storefront/HighLevel order become a structured shipping review package.

It normalizes:

- Buyer/contact info
- Order/product info
- Species interest
- Animal interest
- Shipping address
- Breeder origin
- Package profile

Then it runs the weather/species decision and operator safety gate.

Local dry run:

```powershell
npm run simulate:shipping-review
```

Expected result:

`operatorDisposition` should be `READY_FOR_OPERATOR_APPROVAL` for the demo fixture.

## HighLevel State

`npm run setup:demo` was run successfully.

Synced:

- 17 custom fields
- Journey/source/offer/purchase/content/care/referral tags
- 6 demo contacts
- New shipping operator tags:
  - `shipping:operator-review`
  - `shipping:ready-for-operator-approval`
  - `shipping:manual-review-required`
  - `shipping:label-blocked`

Still blocked by HighLevel API scope:

- Creating pipelines
- Creating opportunities

Manual HighLevel work still needed:

1. Create/verify these pipelines:
   - `HatchKit - Lead Pipeline`
   - `HatchKit - Sales Pipeline`
   - `HatchKit - Shipping Pipeline`
2. Add the demo opportunities listed by `npm run setup:demo`.
3. Wire HighLevel workflows to the webhook URLs once there is a deployed base URL.
4. Build smart lists for:
   - New crested gecko leads
   - Hot animal buyers
   - Shipping holds
   - Operator review queue
   - Ready for label approval
   - Review/referral candidates
   - Repeat buyer VIP

## Verification Already Passed

Run in root:

```powershell
npm test
npm run simulate:shipping-review
npm run export:demo
npm run verify:demo
npm run export:sales
npm run setup:demo
```

These passed during the last session.

`setup:demo` still reports pipeline/opportunity blockers because of HighLevel API scope. That is expected.

## Demo Export Locations

Demo buildout packet:

`exports/reptiscale-demo`

Commercial sales packet:

`exports/reptiscale-commercial-packet`

Useful generated files:

- `exports/reptiscale-demo/manual-highlevel-buildout.md`
- `exports/reptiscale-demo/workflow-blueprint.json`
- `exports/reptiscale-demo/webhook-payloads.json`
- `exports/reptiscale-demo/demo-script.md`
- `exports/reptiscale-demo/deployment-runbook.md`
- `exports/reptiscale-demo/highlevel-workflow-checklist.md`
- `exports/reptiscale-demo/demo-test-plan.md`
- `exports/reptiscale-demo/webhook-smoke-test.ps1`
- `exports/reptiscale-commercial-packet/demo-checklist.md`

## Tomorrow's Recommended Next Steps

1. Confirm GitHub is current:

```powershell
cd C:\Users\wallg\OneDrive\Desktop\HatchKit
git --git-dir=.gitroot --work-tree=. status --short --branch
git --git-dir=.gitroot --work-tree=. push origin main
```

If the push says everything is up to date, continue.

2. Decide deployment path for the webhook server:
   - local tunnel for demo testing, or
   - real hosted deployment.

3. In HighLevel, manually create the three pipelines and demo opportunities because the token cannot do this.

4. Wire the demo workflows in HighLevel using the exported webhook payloads.

5. Test the complete demo path:
   - Starter guide form
   - Offer click
   - Order submitted
   - Order shipping review
   - Shipping hold/approval tags
   - Care onboarding
   - Review/referral

6. Replace SunScale's demo `shippingOrigin` address before any real fulfillment workflow goes live.

7. Consider next product work:
   - Deployable demo server
   - HighLevel workflow setup checklist with screenshots
   - Customer-facing Reptiscale dashboard/demo UI
   - FedEx rate/address validation behind explicit human approval
   - Real social content approval flow polish

## Notes For The Next Builder

- Do not print `.env` secrets.
- Do not revert the nested `HatchKit.ai` state unless asked.
- The Gecko shipping integration is intentionally conservative. Keep the review-only boundary.
- The product positioning is Reptiscale, not generic HatchKit CRM.
- The user wants a sellable working demo for reptile breeders and online pet sellers, starting with a crested gecko breeder.
