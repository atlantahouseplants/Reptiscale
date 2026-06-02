# Reptiscale / HatchKit Next Session Handoff

Created after the May 5, 2026 build session.

Updated May 16, 2026 after HighLevel workflows, workflow settings, smart-list tags, and smart lists were completed.

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

## Current Product Direction

The near-term sellable product is a done-for-you GoHighLevel subaccount and snapshot system for reptile breeders.

The Vercel app is the automation/webhook support layer. It is not the main prospect-facing product demo.

The next build priority is the GoHighLevel demo showroom:

- one clean master snapshot account
- one SunScale Geckos demo account
- buyer-facing storefront/funnel/reservation path
- accelerated demo workflows
- HighLevel CRM, inbox, pipelines, smart lists, shipping review, care, review, referral, and VIP proof

Source of truth for this build:

`docs/demo-showroom/`

Key files:

- `docs/demo-showroom/hatchkit-ghl-demo-showroom-prd.md`
- `docs/demo-showroom/master-build-plan.md`
- `docs/demo-showroom/subagent-execution-plan.md`
- `docs/demo-showroom/gap-register.md`
- `docs/demo-showroom/breeder-input-checklist.md`

The demo account is SunScale Geckos.

HighLevel sub-account/location ID:

`fqj4rbp2VRkvMa8GWVWn`

## Live Demo Status

Vercel project:

`reptiscale-demo`

Live alias:

`https://reptiscale-demo.vercel.app`

Vercel env helper:

`exports/reptiscale-demo/vercel-sync-env.ps1`

Run it from a normal PowerShell window to sync the local `.env` values into Vercel production and redeploy:

```powershell
cd C:\Users\wallg\OneDrive\Desktop\HatchKit
.\exports\reptiscale-demo\vercel-sync-env.ps1
```

The demo was deployed to Vercel and `/health` plus `/demo` loaded successfully after the first deploy.

Important fix now in the local code:

- Vercel API routes were returning `500` because the request logger tried to write to the local `logs` folder.
- `server.js` now writes Vercel logs to `/tmp/hatchkit-webhooks.log`.
- If file logging fails, it warns in console but does not crash the route.

Added during the May 15 resume session:

- `GET /api/demo/control-room`
- `lib/demo-control-room.js`
- A larger `/demo` control-room section showing:
  - customer journey proof
  - manual HighLevel build queue
  - offer ladder and demo cart
  - next seven social/content pushes

Redeploy before using this URL in HighLevel:

```powershell
cd C:\Users\wallg\OneDrive\Desktop\HatchKit
.\exports\reptiscale-demo\vercel-deploy.ps1 -Production
```

Then verify:

```powershell
Invoke-RestMethod -Method Get -Uri "https://reptiscale-demo.vercel.app/health"
Invoke-RestMethod -Method Get -Uri "https://reptiscale-demo.vercel.app/api/demo/readiness"
Invoke-RestMethod -Method Get -Uri "https://reptiscale-demo.vercel.app/api/demo/control-room"
Invoke-RestMethod -Method Post -Uri "https://reptiscale-demo.vercel.app/api/demo/shipping-review-fixture" -ContentType "application/json" -Body "{}"
```

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
- `d3eba5b Add demo deployment readiness packet`
- `c0e618c Add Reptiscale demo console`
- `36ba1c3 Prepare demo server for deployment`
- `b08c4ad Add Vercel deploy runbook fixes`
- `7f10f92 Fix linked Vercel deploy helper`
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
- `exports/reptiscale-demo/vercel-env-checklist.md`
- `exports/reptiscale-demo/highlevel-workflow-checklist.md`
- `exports/reptiscale-demo/demo-test-plan.md`
- `exports/reptiscale-demo/vercel-deploy.ps1`
- `exports/reptiscale-demo/webhook-smoke-test.ps1`
- `templates/pages/reptiscale-demo-console.html`
- `GET /demo`
- `GET /api/demo/readiness`
- `GET /api/demo/control-room`
- `POST /api/demo/shipping-review-fixture`

`npm run verify:demo` regenerates the demo export and checks that the main demo files, webhook payloads, endpoint references, shipping origin, and smoke-test assets are present.

The `/demo` page shows the Reptiscale journey, endpoint surface, and a safe review-only shipping fixture. It does not call live weather, HighLevel, FedEx, UPS, or any carrier API for the fixture.

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

Completed in HighLevel on May 16, 2026:

- Three main webhook workflows were tested successfully:
  - `Reptiscale - Lead Magnet Delivery`
  - `Reptiscale - Offer Clicked`
  - `Reptiscale - Order Submitted`
- Remaining workflows were built and tested successfully:
  - `Reptiscale - Review Submitted`
  - `Reptiscale - Referral Submitted`
  - `Reptiscale - Daily Shipping Weather Re-Check`
  - `Reptiscale - Shipping Hold Operator Alert`
  - `Reptiscale - Ready For Label Approval`
  - `Reptiscale - Post-Purchase Care Onboarding`
  - `Reptiscale - Review And Referral Request`
- Workflow settings were adjusted:
  - Re-entry enabled where repeat events should be allowed.
  - Stop on response enabled for nurture/care/review workflows and disabled for safety/operator workflows.
  - Shipping/weather workflows are not blocked by a customer-message time window.
- Smart-list tags were verified with `npm.cmd run sync:smart-list-tags`.
- Smart lists were created:
  - New Crested Gecko Leads
  - Hot Animal Buyers
  - Shipping Holds
  - Operator Review Queue
  - Ready For Label Approval
  - Review / Referral Candidates
  - Repeat Buyer VIP

Still blocked by HighLevel API scope:

- Creating pipelines
- Creating opportunities

Manual HighLevel work still needed or worth verifying:

1. Create/verify these pipelines:
   - `HatchKit - Lead Pipeline`
   - `HatchKit - Sales Pipeline`
   - `HatchKit - Shipping Pipeline`
2. Add the demo opportunities listed by `npm run setup:demo`.
3. Verify every workflow is published only after its test contact behaves correctly.
4. Verify smart lists show the expected demo contacts after the full smoke test.

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

If using Vercel, link with an explicit project name to avoid project-name inference errors:

```powershell
vercel link --yes --project reptiscale-demo
vercel deploy --prod
```

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
