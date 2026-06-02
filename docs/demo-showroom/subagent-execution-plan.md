# Sub-Agent Execution Plan

Last updated: 2026-06-02

## Coordination Model

The master agent owns product direction, final integration, QA, and handoff.

Sub-agents own bounded workstreams. Each sub-agent must:

- state what it changed
- avoid touching unrelated files or HighLevel assets
- document blockers instead of guessing
- keep demo-only assets separate from production snapshot assets
- never expose secrets or private tokens
- never create live shipping labels

## Workstream 1: HighLevel Account Architect

Goal:

Design and verify the account structure for the master snapshot and SunScale demo account.

Owns:

- HighLevel subaccount role decision
- snapshot account structure
- custom values
- naming standards
- master snapshot QA checklist

Primary files:

- `docs/demo-showroom/master-build-plan.md`
- `docs/operations/highlevel-snapshot-build.md`
- `docs/ghl-snapshot-checklist.md`
- `NEXT_SESSION_HANDOFF.md`

HighLevel areas:

- Agency view
- Subaccounts
- Account snapshots
- Settings
- Custom values

Deliverables:

- Confirmed account architecture.
- Snapshot naming convention.
- List of assets that do and do not copy through snapshots.
- Clone/customization checklist.

Acceptance:

- Team knows which account is clean snapshot and which account is showroom.
- Snapshot export path is documented.

## Workstream 2: CRM Foundation Builder

Goal:

Build and verify the HighLevel data foundation.

Owns:

- custom fields
- tags
- smart lists
- pipelines
- demo contact tags/fields
- pipeline ID sync

Primary files:

- `scripts/setup-demo-account.js`
- `scripts/sync-pipelines.js`
- `scripts/sync-smart-list-tags.js`
- `data/ghl-config.json`
- `data/breeders/sunscale-geckos/ghl-config.json`

HighLevel areas:

- Contacts
- Tags
- Custom fields
- Smart lists
- Opportunities/pipelines

Deliverables:

- CRM setup complete.
- Demo contacts loaded.
- Smart lists populated.
- Pipeline IDs synced.

Acceptance:

- `npm run setup:demo` completes with only known/manual blockers.
- All smart lists show relevant demo records.

## Workstream 3: Storefront And Funnel Builder

Goal:

Build the prospect-facing buyer experience in HighLevel.

Owns:

- storefront
- starter guide page
- animal detail page
- reservation/deposit page
- thank-you page
- show QR page
- review/referral page
- VIP list page

Primary files:

- `templates/pages/reptiscale-storefront.html`
- `templates/pages/crested-gecko-starter-guide.html`
- `templates/pages/animal-detail.html`
- `templates/pages/reservation-offer.html`
- `templates/pages/show-qr-landing.html`
- `data/demo-products.json`

HighLevel areas:

- Sites
- Funnels
- Websites
- Forms
- Online store

Deliverables:

- Published demo pages.
- Form actions connected to workflows/webhooks.
- Mobile checked.
- Page links documented.

Acceptance:

- Buyer can go from storefront to guide to animal interest to reservation.
- The actions create/update a HighLevel contact.

## Workstream 4: Offers And Payments Builder

Goal:

Build the demo product and reservation flow.

Owns:

- products
- payment links or order forms
- order bump/upsell flow
- demo-safe payment approach
- deposit policy copy

Primary files:

- `data/demo-products.json`
- `exports/reptiscale-demo/products.csv`
- `exports/reptiscale-demo/animals.csv`
- `templates/pages/reservation-offer.html`

HighLevel areas:

- Payments
- Products
- Invoices
- Payment links
- Order forms

Deliverables:

- Demo products created.
- Reservation/deposit flow works or has a safe simulation.
- Payment/order workflow trigger documented.

Acceptance:

- Sales rep can demo "reserve this animal" without accidental live charge risk.

## Workstream 5: Workflow Automation Builder

Goal:

Build accelerated demo workflows and production snapshot workflows.

Owns:

- workflow triggers
- webhook actions
- wait timing
- internal notifications
- stop/re-entry settings
- workflow test results

Primary files:

- `docs/ghl-workflows.md`
- `exports/reptiscale-demo/highlevel-workflow-checklist.md`
- `exports/reptiscale-demo/workflow-blueprint.json`
- `exports/reptiscale-demo/webhook-payloads.json`

HighLevel areas:

- Automation
- Workflows
- Triggers
- Webhooks

Deliverables:

- `DEMO - ...` accelerated workflow set.
- `SNAPSHOT - ...` or production workflow set.
- Test contact evidence.
- Workflow settings checklist.

Acceptance:

- Full accelerated demo journey runs in about 10 minutes.
- Production workflows have real timing and safe stop conditions.

## Workstream 6: Messaging And Content Builder

Goal:

Make the demo messages sound like a real breeder and show the content/social value.

Owns:

- email templates
- SMS templates
- care guide copy
- review/referral copy
- social calendar demo
- content approval demo

Primary files:

- `templates/emails/`
- `templates/sms/`
- `templates/emails/lifecycle/`
- `templates/sms/lifecycle/`
- `data/schedules/sunscale-demo.json`
- `exports/reptiscale-demo/social-calendar.csv`

HighLevel areas:

- Marketing emails
- SMS messages
- Social planner
- Conversations

Deliverables:

- Branded messages imported or ready to import.
- Accelerated demo message copy.
- Social content approval example.
- Breeder tone notes.

Acceptance:

- Prospect can receive and read demo messages that feel realistic and useful.

## Workstream 7: Shipping And Operator Review Builder

Goal:

Connect the HighLevel order/shipping journey to the deployed webhook server.

Owns:

- order-submitted payloads
- shipping/order review webhooks
- operator review smart lists
- shipping hold and approval tags
- review-only label boundary

Primary files:

- `server.js`
- `agents/shipping-agent/`
- `lib/demo-shipping-fixture.js`
- `docs/operations/live-animal-fulfillment-gate.md`
- `docs/operations/order-to-shipping-normalization.md`
- `exports/reptiscale-demo/webhook-smoke-test.ps1`

HighLevel areas:

- Workflows
- Custom fields
- Tags
- Shipping pipeline
- Smart lists

Deliverables:

- Shipping review demo working.
- Operator approval queue populated.
- Hold/approve examples visible.

Acceptance:

- Demo order returns a clear `READY_FOR_OPERATOR_APPROVAL`, hold, or manual review status.
- No workflow creates a live carrier label.

## Workstream 8: Demo Data And Reset Builder

Goal:

Keep the SunScale demo account realistic and resettable.

Owns:

- dummy contacts
- dummy opportunities
- dummy conversations
- test emails/phones
- reset procedure
- demo run naming conventions

Primary files:

- `scripts/setup-demo-account.js`
- `scripts/load-demo-contacts.js`
- `exports/reptiscale-demo/demo-test-plan.md`
- `exports/reptiscale-demo/demo-script.md`

HighLevel areas:

- Contacts
- Opportunities
- Conversations
- Smart lists

Deliverables:

- Demo records loaded.
- Reset guide.
- Naming convention for live demo contacts.

Acceptance:

- Each sales call can create a fresh demo contact without polluting the snapshot.

## Workstream 9: Sales Walkthrough And QA

Goal:

Create the final sales demo script and verify the full experience.

Owns:

- demo script
- click path
- pass/fail checklist
- prospect-facing talking points
- post-demo follow-up assets

Primary files:

- `exports/reptiscale-demo/demo-script.md`
- `exports/reptiscale-demo/demo-test-plan.md`
- `docs/business/sales-playbook.md`
- `docs/business/pricing-and-packaging.md`

Deliverables:

- 10-minute demo script.
- 30-minute deep-dive script.
- QA checklist.
- "What you get" summary.

Acceptance:

- Sales rep can run the demo without opening backend docs.
- Prospect sees the buyer journey and breeder dashboard clearly.

## Suggested Parallel Build

Round 1:

- Workstream 1: Account Architect
- Workstream 2: CRM Foundation
- Workstream 3: Storefront/Funnels

Round 2:

- Workstream 4: Offers/Payments
- Workstream 5: Workflows
- Workstream 6: Messaging/Content

Round 3:

- Workstream 7: Shipping/Operator
- Workstream 8: Demo Data/Reset
- Workstream 9: Sales/QA

## Master Integration Checklist

Before declaring done:

- Review all HighLevel account changes.
- Confirm webhook base URL.
- Confirm accelerated demo timings.
- Confirm production workflow timings.
- Run a fresh test buyer through the whole journey.
- Check HighLevel contact record, tags, fields, workflow history, conversations, opportunities, and smart lists.
- Confirm no live label or accidental charge can happen.
- Export or update snapshot.
- Update handoff.

