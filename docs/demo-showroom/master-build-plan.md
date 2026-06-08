# HatchKit Demo Showroom Master Build Plan

Last updated: 2026-06-05

## Objective

Build a complete SunScale Geckos demo subaccount and clean Hatchkit master snapshot in HighLevel.

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

- The API-supported HighLevel foundation is built in `SunScale Geckos - Demo`.
- The first manual HighLevel visual-builder layer was built as a funnel showroom. The revised product direction requires a real HighLevel Store/Website before source snapshot creation.
- The remaining gap is live SMS retesting, inbox examples, social planner proof, and final outside-in demo QA.

## Build Phases

### Phase 0: Account Strategy

Status:

- Complete for the live showroom phase.
- `HatchKit` remains the working master/snapshot account.
- `SunScale Geckos - Demo` is the live demo account.
- Location ID: `oCn199rzTjj0rPgqXyXU`.

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

Status:

- API-supported demo foundation is complete in `SunScale Geckos - Demo`.
- Master snapshot cleanup/import remains a later phase after the SunScale Store source prototype is complete.

Deliverables:

- Custom fields created and verified.
- Tags created and verified.
- Pipelines created and stage names verified.
- Smart-list support tags created and verified.
- Smart lists created and verified manually in HighLevel.
- Custom values added for reusable branding and URLs.
- Demo-only tags added to keep test records organized.

Key files:

- `scripts/setup-demo-account.js`
- `docs/operations/highlevel-snapshot-build.md`
- `docs/ghl-snapshot-checklist.md`
- `exports/reptiscale-demo/manual-highlevel-buildout.md`

Acceptance:

- `npm run setup:showroom` can sync fields, tags, pipelines, demo contacts, opportunities, custom values, products, trigger links, store settings, shipping zone/rate, and contact activity.
- Pipeline IDs are synced to config.
- Smart lists show expected demo contacts after test data is loaded.

Owner:

- HighLevel foundation builder

### Phase 2: Store-First Commerce Surface

Status:

- Public Vercel helper pages are live and verified.
- A real HighLevel Store/Website is built for SunScale and published as the primary online storefront.
- Existing HighLevel funnel pages remain as campaign assets around the Store.
- Privacy Policy and Terms pages are published for A2P review.

Deliverables:

- SunScale HighLevel Store with Products List, Product Details, Cart, Checkout, and Thank You pages.
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

- `templates/pages/sunscale-demo/storefront.html`
- `templates/pages/sunscale-demo/starter-guide.html`
- `templates/pages/sunscale-demo/mango-detail.html`
- `templates/pages/sunscale-demo/reservation.html`
- `templates/pages/sunscale-demo/review-referral.html`
- `templates/pages/sunscale-demo/vip.html`
- `templates/pages/sunscale-demo/show-qr.html`
- `data/demo-products.json`

Acceptance:

- A prospect can complete the buyer path from storefront to guide to animal interest to reservation.
- The buyer path creates or updates a HighLevel contact.
- Published pages return 200 and are wired to the webhook backend.

Owner:

- Storefront/funnel builder

### Phase 3: Products And Offers

Status:

- Products/prices are API-built.
- Store shipping origin and review-only shipping zone/rate are API-built.
- Demo-safe reservation/payment simulation is embedded in the Mango Reservation funnel step.

Deliverables:

- Products/payment links/order forms for:
  - Animal Reservation Deposit, $75
  - Crested Gecko Care Starter Kit, $49
  - 30-Minute Setup Review, $35
  - Crested Gecko Starter Guide, free
- Product collections in HighLevel Store.
- Demo-only deposit flow that can be triggered without a real prospect charge, if possible.

Acceptance:

- Sales rep can show how a buyer reserves an animal.
- Deposit/order simulation triggers the order-submitted journey.
- No accidental live charge is required for a demo.

Owner:

- Offers/payments builder

### Phase 4: Accelerated Demo Workflows

Status:

- Recipes and webhook payloads are complete.
- All 12 accelerated HighLevel demo workflows are created and published.
- Live audit shows workflow count `12`.

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

Published demo workflows:

- `DEMO - Reptiscale - Starter Guide Lead Capture`
- `DEMO - Reptiscale - Lead Education Drip`
- `DEMO - Reptiscale - Animal Interest - Mango`
- `DEMO - Reptiscale - Reservation Abandonment`
- `DEMO - Reptiscale - Deposit Paid`
- `DEMO - Reptiscale - Order Shipping Review`
- `DEMO - Reptiscale - Simulated Shipped`
- `DEMO - Reptiscale - Simulated Delivered And LAG`
- `DEMO - Reptiscale - Care Onboarding`
- `DEMO - Reptiscale - Review And Referral`
- `DEMO - Reptiscale - Repeat Buyer VIP`
- `DEMO - Reptiscale - Social Content Approval`

Acceptance:

- Full accelerated journey can run in 10 minutes.
- Workflow history is visible on the demo contact.
- Messages are sent only to demo-approved contacts/numbers.

Owner:

- Workflow/automation builder

### Phase 5: Demo Data And Sales Scenarios

Status:

- Demo contacts and opportunities are API-built.
- Pinned notes and follow-up tasks are API-built.
- Smart lists are manually built in HighLevel.
- Inbox examples and social planner proof remain provider/account-dependent.

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

Status:

- Live audit passes 17 of 17 checks.
- A2P Brand Registration is registered with TCR.
- A2P Campaign Registration was submitted for review on 2026-06-05 and still needs approval before live SMS can be treated as ready.
- Full outside-in published demo test still needs to be run with a fresh contact.

Deliverables:

- End-to-end demo test.
- Live SMS delivery retest with an opted-in test number after campaign approval.
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

1. Sweep the `DEMO - Reptiscale - ...` workflow settings so they run 24/7, use correct re-entry, and rely on tag-added triggers for custom-code form paths.
2. Confirm the A2P campaign is approved and the phone number is usable for SMS in HighLevel.
3. Run a real SMS test with an opted-in test number after campaign approval.
4. Run the full buyer journey from the published Store plus campaign funnel paths with a fresh contact.
5. Verify contact tags, custom fields, smart lists, opportunities, and workflow execution logs.
6. Document any SMS delivery issue separately from CRM/webhook behavior.
7. Add inbox/social proof if providers are configured.
8. Polish sales walkthrough and screenshots.
9. Copy reusable assets to the clean master snapshot account.
10. Convert demo waits from minutes to production timing.
11. Export snapshot.
12. Test snapshot import into a fresh account.

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

- Whether demo emails/SMS can send to the user's phone/email.
- Any billing/payment constraints in the demo account.
- Permission before live HighLevel destructive changes.
- Opted-in test phone number for SMS delivery testing.
- Social accounts if Social Planner proof should be live.

From breeder friend:

- real breeder language
- deposit policy
- shipping policy
- care guidance
- common buyer objections
- realistic animal photos or permission to use generated/placeholders
- what dashboard views matter most

## Risks

- HighLevel API scopes currently block business profile writes.
- HighLevel visual builders still require manual UI work.
- Snapshot imports may not perfectly preserve users, integrations, phone numbers, payment settings, or workflow publish states.
- SMS deliverability requires correct sender setup, opt-in language, opt-out compliance, and a verified live send test.
- Demo timing must be clearly separated from production timing.
- Store/payment demo must avoid accidental live charges.

## Definition Of Done

The project is ready to sell when:

- The SunScale demo subaccount is showable on a live sales call.
- A new test buyer can complete the accelerated journey.
- The breeder-side HighLevel views prove the journey happened.
- A2P Brand Registration is registered and SMS sending is verified, or SMS limitations are clearly called out during demos.
- The master snapshot can be cloned.
- A new breeder onboarding checklist exists.
- The sales rep has a simple script and does not need to explain the backend.
