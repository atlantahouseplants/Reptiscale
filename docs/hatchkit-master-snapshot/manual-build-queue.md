# Hatchkit Master Snapshot Build Queue

Last updated: 2026-06-08

Account:

- `Hatchkit Master Snapshot - v1`
- Location ID: `H81tekJbNbeyYsnTRKVH`

## Current Status

The current token can access `Hatchkit Master Snapshot - v1` and has created most of the reusable API foundation.

Read-back counts:

- custom fields: 17
- tags: 65
- custom values: 12
- products/prices: 4
- pipelines: 0

Current blocker:

- Pipeline creation is blocked by missing opportunities/pipelines write scope.

Preferred next move:

- Finish the real HighLevel Store in SunScale, then use the SunScale demo account as a source snapshot and load reusable Store structure, campaign funnels, pipelines, trigger links, smart-list structure, products, and workflows into this master account before recreating anything manually.

Fallback:

- Add the missing pipeline scope and rerun `npm run setup:master-snapshot`, or create the 3 pipelines manually in HighLevel if snapshot import does not carry them.

## Build Principle

This account is the clean source for future customer snapshots.

Do not add:

- demo contacts
- fake opportunities
- SunScale proof records
- accelerated demo waits
- live shipping-label automation
- real payment charges

## API-Built Foundation

The `setup:master-snapshot` command is designed to create:

- 17 reusable contact custom fields: created
- 3 Hatchkit pipelines: blocked by token scope
- structured lifecycle/source/offer/shipping/care/review tags: created
- reusable custom values with placeholders: created
- reusable product ladder:
  - `Animal Reservation Deposit`: created
  - `Care Starter Kit`: created
  - `30-Minute Setup Review`: created
  - `Starter Guide`: created

It intentionally does not create contacts or opportunities.

## Snapshot Import Pass

Before doing manual UI recreation, complete this pass:

1. Finish the real HighLevel Store/source assets in `SunScale Geckos - Demo`.
2. Create `SunScale Demo Source - Hatchkit Base v0`.
3. Load that source snapshot into `Hatchkit Master Snapshot - v1`.
4. Resolve duplicates deliberately.
5. Keep the cleaner master custom fields, structured tags, placeholder custom values, and reusable product ladder where they are better.
6. Accept imported reusable Store structure, workflows, pipelines, campaign pages, forms, trigger links, smart lists, and product examples where they save manual rebuild time.
7. Run `npm run audit:snapshot-assets` after import.

## Manual HighLevel Build

After the API foundation and snapshot import pass are complete, build only what is still missing in the HighLevel UI.

### Pipelines

Create manually if the API token is not updated.

`Hatchkit - Lead Pipeline`

- `New Lead`
- `Contacted`
- `Interested`
- `Qualified`
- `Customer`
- `Lost`

`Hatchkit - Sales Pipeline`

- `Animal Selected`
- `Invoice Sent`
- `Payment Received`
- `Shipping Scheduled`
- `Shipped`
- `Delivered`
- `Follow-Up Complete`

`Hatchkit - Shipping Pipeline`

- `Pending Review`
- `Weather Check`
- `Approved to Ship`
- `Label Created`
- `Dropped Off`
- `In Transit`
- `Delivered`
- `LAG Confirmed`
- `Complete`

### Smart Lists

- `New Animal Leads`
- `Hot Animal Buyers`
- `Shipping Holds`
- `Operator Review Queue`
- `Ready For Label Approval`
- `Review / Referral Candidates`
- `Repeat Buyer VIP`
- `Needs Follow-Up`

### HighLevel Store

Use placeholder/client-variable copy, not SunScale final copy. If these import from the SunScale source snapshot, sanitize them instead of rebuilding them:

- Store/Website homepage or Products List Page
- Product Details Page
- Cart Page
- Checkout Page
- Thank You Page
- Product collections

### Campaign Pages/Funnels

Use funnels for campaigns around the Store:

- Starter Guide lead magnet
- Featured Animal promo
- Reservation/deposit campaign
- Review/referral page
- VIP availability list
- Expo/show QR signup
- Privacy Policy
- Terms of Service

### Production-Timing Workflows

Build or sanitize production timing, not the SunScale minute-speed demo timing:

- `HK - Starter Guide Lead Capture`
- `HK - Lead Education Drip`
- `HK - Animal Interest`
- `HK - Reservation Abandonment`
- `HK - Deposit Paid`
- `HK - Shipping Review`
- `HK - Shipped`
- `HK - Delivered And LAG`
- `HK - Care Onboarding`
- `HK - Review And Referral`
- `HK - Repeat Buyer VIP`
- `HK - Content Approval`
- `HK - Store Abandoned Checkout`
- `HK - Store Order Submitted`
- `HK - Store Order Fulfilled`

Recommended timing:

- immediate lead response
- first nurture within 1 day
- follow-up availability within 2-3 days
- reservation abandonment after 1 day and 3 days
- post-purchase setup/shipping sequence immediately after deposit/payment
- care onboarding at delivery, day 3, day 7, and day 30
- review/referral after live-arrival confirmation or delivery follow-up

### Workflow Settings

For production snapshots:

- timezone should default to the client timezone during onboarding
- use business-safe quiet hours for customer SMS
- keep re-entry controlled by journey type
- stop nurture workflows when purchase tags are present
- use tag-added triggers for custom-code forms and webhook-backed paths
- keep SMS disabled or draft-safe until each client passes A2P/campaign approval

## Snapshot Export

Only export the snapshot after:

1. API foundation exists.
2. Manual pages/funnels are built.
3. Production workflows are built and published or intentionally left draft with setup notes.
4. One temporary QA contact has passed the test path.
5. Temporary QA records are deleted or clearly documented.
6. No SunScale/demo-specific content remains.

Then create the HighLevel snapshot from `Hatchkit Master Snapshot - v1`.

## QA Import

After export, create or use a fresh QA subaccount and import the snapshot.

Target name:

`Hatchkit Snapshot QA - v1`

Run the full onboarding test there before using the snapshot for a paying customer.
