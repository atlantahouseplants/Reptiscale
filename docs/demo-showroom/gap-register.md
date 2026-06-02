# Demo Showroom Gap Register

Last updated: 2026-06-02

## Purpose

Track the specific gaps between the current technical build and a sellable prospect-facing HatchKit/Reptiscale demo.

## P0: Must Fix Before Sales Demo

### Separate Master Snapshot From Demo Account

Issue:

The current HighLevel setup appears to mix reusable snapshot assets and demo/showroom data.

Why it matters:

The master snapshot must stay clean. The SunScale demo account can be messy and full of dummy data.

Required action:

- Use the existing `HatchKit` subaccount as the working master/snapshot account unless an audit proves it is too messy.
- Create one new `SunScale Geckos - Demo` subaccount for the live showroom.
- Create a temporary `Reptiscale Snapshot QA - v1` account only when it is time to test snapshot import.

### Build Prospect-Facing Pages In HighLevel

Issue:

Local templates exist, but many still contain placeholders and are not the live HighLevel showroom.

Required pages:

- Storefront
- Starter guide
- Animal detail
- Reservation/deposit
- Order thank-you
- Review/referral
- VIP list
- Show QR signup

### Add Demo Visual Assets

Issue:

The local page templates reference image variables, but no final demo logo, hero images, animal photos, QR image, or HighLevel screenshots are present.

Required assets:

- SunScale logo or simple generated logo
- hero image
- Nova, Mango, Echo, Pepper animal images
- QR code image
- workflow/pipeline/smart-list screenshots

### Finish Demo Products And Payment Links

Issue:

Products are defined in JSON/CSV, but the final HighLevel product/payment/order-form links need to exist in the demo account.

Required products:

- Animal Reservation Deposit, $75
- Crested Gecko Care Starter Kit, $49
- 30-Minute Setup Review, $35
- Crested Gecko Starter Guide, free

Demo safety:

- Use test mode or simulation where possible.
- Do not require a real prospect payment during a demo.

### Accelerated Demo Workflows

Issue:

Existing workflows may use real lifecycle timing or mixed old/new trigger paths.

Required action:

- Create `DEMO - ...` workflows with minute-level waits.
- Keep production snapshot workflows separate.

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

## P1: Should Fix Before Snapshot Export

### Reconcile HatchKit/Reptiscale Naming

Issue:

Older docs lead with HatchKit and show-QR setup. Newer docs position the product as Reptiscale.

Decision:

- HatchKit can remain the agency/platform name.
- Reptiscale is the reptile-breeder offer/product.

Action:

- Demo and sales materials should say Reptiscale unless they are agency/admin docs.

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
- Use the Reptiscale buyer journey as the primary sales demo path.

### Missing Review/Referral And VIP Page Templates

Issue:

Snapshot requirements include review/referral and VIP pages, but local page templates are incomplete or missing for these.

Action:

- Add templates and build matching HighLevel pages.

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

- Optionally create simpler public helper pages:
  - `/demo/store`
  - `/demo/guide`
  - `/demo/animal/mango`
  - `/demo/reserve`
  - `/demo/operator`

These should support sales calls but should not replace the HighLevel showroom.

## Already Fixed Locally

- Added missing `shipping:lag-confirmed` setup tag to `scripts/setup-demo-account.js`.
- Updated demo shipping fixture date from `2026-05-11` to `2026-06-08`.
- Updated demo export payload shipping date from `2026-05-11` to `2026-06-08`.
- Updated exported social calendar source dates to June 2026.
