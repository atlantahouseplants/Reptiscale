# HatchKit Demo Showroom Master Build Plan

Last updated: 2026-06-02

## Objective

Build a complete SunScale Geckos demo subaccount and clean HatchKit/Reptiscale master snapshot in GoHighLevel.

The final result must let a reptile breeder prospect experience the buyer journey, then see the same activity inside HighLevel as the breeder/operator.

## Current State

Already built:

- Vercel webhook server
- Reptiscale demo endpoint at `https://reptiscale-demo.vercel.app`
- `/demo` technical console
- shipping/order review logic
- SunScale Geckos demo data
- custom field, tag, pipeline, and contact setup scripts
- email/SMS templates
- demo export packet
- commercial sales packet
- workflow setup documentation

Main gap:

- The working HighLevel showroom experience is not yet assembled into a prospect-facing demo.

## Build Phases

### Phase 0: Account Strategy

Deliverables:

- Confirm whether current HatchKit HighLevel account is the master snapshot, the SunScale demo account, or both.
- Create separate accounts if needed:
  - `HatchKit - Master Snapshot`
  - `SunScale Geckos - Demo`
- Decide whether the demo uses HighLevel SaaS mode now or manual subaccount creation first.
- Confirm agency owner access and snapshot permissions.

Acceptance:

- There is one clean account for snapshot export.
- There is one messy/showroom account for demo use.
- The two roles are not confused.

Owner:

- User / HighLevel admin

### Phase 1: Snapshot Foundation

Deliverables:

- Custom fields created and verified.
- Tags created and verified.
- Pipelines created and stage names verified.
- Smart lists created and verified.
- Custom values added for reusable branding and URLs.
- Demo-only tags added to keep test records organized.

Key files:

- `scripts/setup-demo-account.js`
- `docs/operations/highlevel-snapshot-build.md`
- `docs/ghl-snapshot-checklist.md`
- `exports/reptiscale-demo/manual-highlevel-buildout.md`

Acceptance:

- `npm run setup:demo` can sync fields/tags/demo contacts.
- Pipeline IDs are synced to config.
- Smart lists show expected demo contacts after test data is loaded.

Owner:

- HighLevel foundation builder

### Phase 2: Storefront And Buyer Pages

Deliverables:

- SunScale storefront page.
- Starter guide capture page.
- Animal detail page for Mango.
- Reservation/deposit offer page.
- Order/thank-you page.
- Review/referral page.
- VIP availability page.
- Show QR signup page.

Demo requirement:

- Pages must look like a real crested gecko breeder business.
- Forms/buttons must trigger the demo workflows/webhooks.
- Pages must be mobile-friendly.

Key files:

- `templates/pages/reptiscale-storefront.html`
- `templates/pages/crested-gecko-starter-guide.html`
- `templates/pages/animal-detail.html`
- `templates/pages/reservation-offer.html`
- `templates/pages/show-qr-landing.html`
- `data/demo-products.json`

Acceptance:

- A prospect can complete the buyer path from storefront to guide to animal interest to reservation.
- The buyer path creates or updates a HighLevel contact.

Owner:

- Storefront/funnel builder

### Phase 3: Products And Offers

Deliverables:

- Products/payment links/order forms for:
  - Animal Reservation Deposit, $75
  - Crested Gecko Care Starter Kit, $49
  - 30-Minute Setup Review, $35
  - Crested Gecko Starter Guide, free
- Product collections or store sections if using HighLevel ecommerce.
- Demo-only deposit flow that can be triggered without a real prospect charge, if possible.

Acceptance:

- Sales rep can show how a buyer reserves an animal.
- Deposit/order simulation triggers the order-submitted journey.
- No accidental live charge is required for a demo.

Owner:

- Offers/payments builder

### Phase 4: Accelerated Demo Workflows

Deliverables:

- Demo workflow folder or naming prefix: `DEMO - Reptiscale - ...`
- Accelerated workflows using minute-level waits.
- Production/snapshot workflows with real timing.
- Workflow documentation showing which are demo-only and which ship in the snapshot.

Required demo workflows:

- Starter Guide Lead Capture
- Lead Magnet Delivery
- New Lead Education Drip
- Animal Interest / Offer Clicked
- Reservation Abandonment
- Deposit Paid / Order Submitted
- Order Shipping Review
- Shipping Hold Operator Alert
- Ready For Label Approval
- Simulated Shipped
- Simulated Delivered
- Post-Purchase Care Onboarding
- Review And Referral Request
- Repeat Buyer VIP Invite
- Social Content Approval Demo

Acceptance:

- Full accelerated journey can run in 10 minutes.
- Workflow history is visible on the demo contact.
- Messages are sent only to demo-approved contacts/numbers.

Owner:

- Workflow/automation builder

### Phase 5: Demo Data And Sales Scenarios

Deliverables:

- Demo contacts:
  - Ava Bennett: hot lead
  - Marcus Hill: paid, shipping hold
  - Jenna Ortiz: nurture lead
  - Noah Parker: show QR lead
  - Priya Raman: approved shipment
  - Drew Coleman: delivered/review candidate
- Demo opportunities across lead, sales, and shipping pipelines.
- Demo conversations/inbox examples.
- Demo social posts/content approval examples.
- Demo images or placeholders for animals.

Acceptance:

- Sales rep can open HighLevel and immediately show realistic records.
- Smart lists have records in each important queue.
- Pipelines are not empty.

Owner:

- Demo data builder

### Phase 6: Breeder Dashboard Walkthrough

Deliverables:

- A sales walkthrough script.
- A breeder operator guide for what to click in HighLevel.
- A prospect experience script for the buyer-side journey.
- A "what you get" page or PDF summary.

Acceptance:

- Sales rep can demo without reading technical docs.
- The demo order is clear:
  1. Buyer storefront
  2. HighLevel contact
  3. Workflows
  4. Pipelines
  5. Shipping review
  6. Care/review/referral/VIP
  7. Snapshot/customization offer

Owner:

- Sales enablement builder

### Phase 7: QA And Snapshot Export

Deliverables:

- End-to-end demo test.
- Snapshot QA checklist completed.
- Demo account reset instructions.
- Snapshot export notes.
- Clone/customization checklist for a new breeder.

Acceptance:

- New dummy buyer can complete the demo journey.
- All messages and workflows fire as expected.
- No real shipping labels are purchased.
- No live customer data is used.
- Snapshot can be cloned into a fresh subaccount and customized.

Owner:

- QA/release lead

## Recommended Execution Order

1. Separate master snapshot and demo account roles.
2. Finish HighLevel foundation in the demo account.
3. Build the buyer-facing pages in HighLevel.
4. Build accelerated demo workflows.
5. Load demo contacts/opportunities.
6. Run the full buyer journey.
7. Polish sales walkthrough.
8. Copy clean assets to master snapshot account.
9. Export snapshot.
10. Test snapshot import into a fresh account.

## Master Agent Responsibilities

The master agent owns:

- overall architecture
- naming standards
- avoiding duplicated workflows
- keeping demo-only timing separate from production timing
- reviewing all sub-agent outputs
- verifying the end-to-end journey
- updating the handoff

## Human Inputs Needed

From user:

- HighLevel agency/subaccount access decisions.
- Whether to create a new separate SunScale demo subaccount.
- Whether demo emails/SMS can send to the user's phone/email.
- Any billing/payment constraints in the demo account.
- Permission before live HighLevel destructive changes.

From breeder friend:

- real breeder language
- deposit policy
- shipping policy
- care guidance
- common buyer objections
- realistic animal photos or permission to use generated/placeholders
- what dashboard views matter most

## Risks

- HighLevel API scopes may block automated pipeline/opportunity creation.
- Snapshot imports may not perfectly preserve users, integrations, phone numbers, payment settings, or workflow publish states.
- SMS/email deliverability requires correct sender setup and opt-out compliance.
- Demo timing must be clearly separated from production timing.
- Store/payment demo must avoid accidental live charges.

## Definition Of Done

The project is ready to sell when:

- The SunScale demo subaccount is showable on a live sales call.
- A new test buyer can complete the accelerated journey.
- The breeder-side HighLevel views prove the journey happened.
- The master snapshot can be cloned.
- A new breeder onboarding checklist exists.
- The sales rep has a simple script and does not need to explain the backend.

