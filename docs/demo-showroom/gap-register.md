# Demo Showroom Gap Register

Last updated: 2026-06-05

## Purpose

Track the specific gaps between the current technical build and a sellable prospect-facing Hatchkit demo.

## P0: Must Fix Before Sales Demo

### Separate Master Snapshot From Demo Account

Status:

Completed for the live showroom phase.

Current state:

- The Hatchkit business CRM remains separate from the reusable master snapshot account.
- The live showroom account is `SunScale Geckos - Demo`.
- Location ID: `oCn199rzTjj0rPgqXyXU`.
- Create `Hatchkit Snapshot QA - v1` only after the master snapshot is ready to import-test.

### Build Prospect-Facing Pages In HighLevel

Status:

Completed for the live demo.

Published pages:

- Storefront
- Starter guide
- Animal detail
- Reservation/deposit
- Order thank-you
- Review/referral
- VIP list
- Show QR signup
- Privacy Policy
- Terms of Service

Primary showroom URL:

- `https://demo.hatchkitai.com`

### Add Demo Visual Assets

Status:

Complete enough for live demo testing.

Required assets:

- SunScale logo or simple generated logo
- hero image
- Nova, Mango, Echo, Pepper animal images
- QR code image: created as `show-qr-live.svg`
- workflow/pipeline/smart-list screenshots

Remaining action:

- Capture final sales/demo screenshots after the full test path has been run.

### Finish Demo Products And Payment Links

Status:

Completed as a demo-safe simulation.

Required products:

- Animal Reservation Deposit, $75
- Crested Gecko Care Starter Kit, $49
- 30-Minute Setup Review, $35
- Crested Gecko Starter Guide, free
- Shipping option: `SunScale Demo - Shipping Review Only`
- Shipping rate: `Shipping quoted after weather review`, $0, not a carrier rate

Demo safety:

- Use test mode or simulation where possible.
- Do not require a real prospect payment during a demo.
- Current reservation path simulates the $75 deposit without creating real charges or live labels.

### Accelerated Demo Workflows

Status:

Completed for the live demo.

Completed action:

- Created and published 12 `DEMO - Reptiscale - ...` workflows with minute-level waits.
- Keep production snapshot workflows separate.
- Included the Social Content Approval Demo workflow.

Canonical demo event order:

1. `leadMagnet`
2. `offerClicked`
3. `orderSubmitted`
4. `orderShippingReview`
5. `operatorGate`
6. simulated shipped/delivered/LAG confirmed
7. `reviewSubmitted`
8. `referral`
9. repeat-buyer VIP invite

### A2P / SMS Compliance

Status:

Brand registered with TCR; A2P Campaign Registration was submitted for review on 2026-06-05; live sending test still required after campaign approval.

Current state:

- Local HighLevel number was purchased.
- A2P/SMS compliance was submitted.
- A2P Brand Registration is registered with TCR.
- Confirmation email was received from LeadConnector on 2026-06-05.
- A2P Campaign Registration update from LeadConnector on 2026-06-05 says the campaign has been submitted for review.
- Storefront has compliance footer, Privacy/Terms links, and the HighLevel chat widget.
- Privacy Policy and Terms pages are live.

Required action:

- Confirm campaign approval and number sending status inside HighLevel.
- Run a real opted-in SMS test after campaign approval.
- If SMS fails, capture the exact HighLevel error/status.

## P1: Should Fix Before Snapshot Export

### Reconcile Hatchkit Naming

Issue:

Older docs mixed HatchKit and Reptiscale naming.

Decision:

- Hatchkit is the official product and offer name.
- Historical backend URLs and current live workflow names may still contain Reptiscale until they are intentionally migrated.

Action:

- Demo and sales materials should say Hatchkit.
- Snapshot sanitization should rename customer-template assets away from Reptiscale labels.

### Reconcile Custom Field Count

Issue:

Some older docs mention 10 custom fields. Current setup uses 17.

Action:

- Treat the 17-field set in `scripts/setup-demo-account.js` as canonical.

### Reconcile Canonical Demo Path

Issue:

Old docs emphasize `form-submission` and show QR. New demo path uses `lead-magnet`, `offer-clicked`, `order-submitted`, shipping review, review, and referral.

Action:

- Keep show QR as one lead source.
- Use the Hatchkit buyer journey as the primary sales demo path.

### Missing Review/Referral And VIP Page Templates

Status:

Completed locally, deployed as public helper pages, and built in the HighLevel funnel.

Remaining action:

- None for the live demo. Keep helper pages as fallback.

### Snapshot Versioning

Issue:

Snapshot QA requires version number, release notes, rollback notes, and workflow trigger screenshots.

Action:

- Create snapshot release notes before first export.

## P2: Nice To Have

### Demo Reset Button Or Script

Issue:

Repeated sales calls will create many test contacts.

Action:

- Add naming/tag conventions for demo contacts.
- Consider a reset or archive process for old demo contacts.

### Public Demo Helper Pages

Issue:

The Vercel `/demo` page is technical.

Action:

- Created simpler public helper routes for:
  - `/demo/store`
  - `/demo/guide`
  - `/demo/animal/mango`
  - `/demo/reserve`
  - `/demo/review`
  - `/demo/vip`
  - `/demo/show-qr`
  - `/demo/operator`

These should support sales calls but should not replace the HighLevel showroom.

## Already Fixed Locally

- Added missing `shipping:lag-confirmed` setup tag to `scripts/setup-demo-account.js`.
- Updated demo shipping fixture date from `2026-05-11` to `2026-06-08`.
- Updated demo export payload shipping date from `2026-05-11` to `2026-06-08`.
- Updated exported social calendar source dates to June 2026.
- Created the `SunScale Geckos - Demo` subaccount and configured local source files for location `oCn199rzTjj0rPgqXyXU`.
- Built API-supported HighLevel CRM, product, trigger link, contact activity, store origin, and demo shipping zone/rate objects.
- Added public SunScale helper pages for store, guide, Mango, reservation, review/referral, VIP, show QR, and operator proof.
- Built and published the HighLevel `SunScale Demo Showroom` funnel at `https://demo.hatchkitai.com`.
- Created smart lists in the HighLevel UI.
- Built and published all 12 accelerated demo workflows.
- Added Privacy Policy and Terms pages.
- Added Storefront compliance footer and chat widget for A2P review.
- Added `docs/demo-showroom/manual-highlevel-build-queue.md`.
- Added `docs/demo-showroom/repeatable-client-snapshot-process.md`.
- Added `docs/demo-showroom/next-codex-chat-prompt.md`.
