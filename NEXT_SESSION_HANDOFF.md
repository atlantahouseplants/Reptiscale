# Hatchkit Next Session Handoff

Last updated: 2026-06-08

Workspace:

`C:\Users\wallg\OneDrive\Desktop\HatchKit`

## Product Direction

Hatchkit is a done-for-you HighLevel agency/SaaS system for reptile breeders.

Use `Hatchkit` for all new product, snapshot, and customer-facing naming. Some historical infrastructure names and backend URLs still contain `reptiscale-demo`; do not rename those unless a separate migration is planned.

GoHighLevel should be treated as the main client operating system and repeatable snapshot engine:

- HighLevel Stores/Websites as the main online storefront
- funnels for lead magnets, show QR, featured animal, VIP/drop, review/referral, and other campaigns
- forms and order forms
- contacts, tags, custom fields, opportunities, and pipelines
- smart lists
- workflows
- inbox/conversations
- social planner where accounts are connected
- reusable snapshots for future clients

The Vercel backend is the webhook and automation support layer:

- `https://reptiscale-demo.vercel.app`
- shipping/weather review
- operator approval payloads
- buyer journey webhook handling
- fallback public helper pages

Do not treat the Vercel app as the main prospect-facing sales demo long term.

## Current HighLevel Accounts

Hatchkit business CRM:

- `HatchKit` sub-account
- Location ID: `fqj4rbp2VRkvMa8GWVWn`
- Confirmed 2026-06-08 by the owner as the HatchKit sales operating account.
- This is where the HatchKit Discovery Call calendar, prospects, contacts, opportunities, and sales pipelines live (Geoff + Brianna sell HatchKit to breeders from here).
- Requires its own Private Integration token (`HATCHKIT_GHL_TOKEN` in `.env`); the SunScale demo token cannot access it (verified 403/401).
- Do not use it as the client template unless internal records are intentionally separated.

Live showroom and source prototype:

- `SunScale Geckos - Demo`
- Location ID: `oCn199rzTjj0rPgqXyXU`
- This is the active sales/demo account with dummy data.
- Use this as the source prototype for reusable storefront, workflow, page, pipeline, trigger link, smart-list, and product structure.
- The next source-prototype build priority is finishing/publishing the real HighLevel Store, not another funnel-only storefront.

Clean master snapshot account:

- `Hatchkit Master Snapshot - v1`
- Location ID: `H81tekJbNbeyYsnTRKVH`
- This is the clean account that should eventually export `Hatchkit Client Snapshot - v1`.
- Do not seed demo contacts or fake opportunities into this account.

Location ID `fqj4rbp2VRkvMa8GWVWn` is the HatchKit business sub-account (confirmed 2026-06-08). Earlier notes that called it "stale" are superseded.

Account roles (confirmed 2026-06-08):

- `HatchKit` (`fqj4rbp2VRkvMa8GWVWn`): sales/operations. Demo calendar, prospects, pipelines for Geoff + Brianna.
- `SunScale Geckos - Demo` (`oCn199rzTjj0rPgqXyXU`): pure demo/sandbox shown to prospects (and for prospects to try). Holds the full workflows/triggers/automations. Not used for HatchKit's own sales records.
- `Hatchkit Master Snapshot - v1` (`H81tekJbNbeyYsnTRKVH`): clean snapshot source (later phase).

## Source Of Truth

Read these first:

1. `docs/demo-showroom/README.md`
2. `docs/demo-showroom/highlevel-demo-account-build-status.md`
3. `docs/demo-showroom/manual-highlevel-build-queue.md`
4. `docs/demo-showroom/sunscale-subaccount-setup-runbook.md`
5. `docs/demo-showroom/accelerated-workflow-recipes.md`
6. `docs/demo-showroom/repeatable-client-snapshot-process.md`
7. `docs/demo-showroom/live-showroom-audit.md`
8. `docs/demo-showroom/automation-message-audit-and-corrections.md`
9. `docs/demo-showroom/highlevel-workflow-ui-correction-worksheet.md`
10. `docs/hatchkit-master-snapshot/README.md`
11. `docs/hatchkit-master-snapshot/strategic-build-plan.md`
12. `docs/hatchkit-master-snapshot/source-snapshot-asset-map.md`
13. `docs/hatchkit-master-snapshot/execution-loop.md`
14. `docs/hatchkit-master-snapshot/internal-execution-prompt.md`
15. `docs/hatchkit-master-snapshot/snapshot-asset-inventory.md`
16. `docs/demo-showroom/store-first-commerce-decision.md`
17. `docs/demo-showroom/highlevel-store-build-queue.md`
18. `docs/demo-showroom/sunscale-store-readiness.md`
19. `docs/demo-showroom/next-codex-chat-prompt.md`

## Current Live Build Status

Run:

```powershell
npm run setup:showroom
npm run audit:showroom
```

Latest verified state:

- `npm run setup:showroom` passes and is idempotent.
- `npm run audit:showroom` passes 17 of 17 checks.
- `npm run verify:demo` passes 115 checks.
- `npm test` passes.
- Direct live audit with `node scripts\audit-demo-showroom-live.js` passes 17 of 17 checks.
- Browser test on 2026-06-07 confirmed `https://demo.hatchkitai.com/mango` -> `Reserve Mango` redirects to `https://demo.hatchkitai.com/reserve` with no on-page error and no console errors.
- Live message audit with `node scripts\audit-highlevel-automation-messages.js --wait=90 --fail-on-mismatch` now reports `overallStatus=pass` and `mismatchCount=0`.

The audit is fully passing and the 12 accelerated HighLevel demo workflows are published.

Current blocker:

- A2P Brand Registration for `SunScale Geckos - Demo` is registered with TCR.
- Confirmation email came from LeadConnector on 2026-06-05.
- A2P Campaign Registration update came from LeadConnector on 2026-06-05: the campaign has been submitted for review.
- Next check is whether the campaign is approved and the messaging number is fully usable for live SMS in HighLevel.
- The demo can still be tested for pages, forms, webhooks, CRM records, tags, custom fields, pipelines, and workflow execution logs.
- Run a real opted-in SMS test after campaign approval before treating live messaging as production-ready.

## Built Through HighLevel API

Already built and verified in `SunScale Geckos - Demo`:

- SunScale business profile settings verified
- store shipping origin synced to SunScale demo origin
- demo-only shipping zone: `SunScale Demo - Shipping Review Only`
- review-only shipping rate: `Shipping quoted after weather review`
- 17 custom contact fields
- required structured tags
- 7 buyer demo contacts
- 1 demo operator contact
- 3 HatchKit pipelines
- 12 demo opportunities
- 10 custom values
- 8 products with prices
- 8 products with store images
- 6 product collections
- 6 trigger links
- 8 pinned contact notes
- 8 contact follow-up tasks
- smart-list support tags
- public SunScale helper pages deployed on Vercel
- public helper-page forms wired to live Reptiscale webhooks
- real QR SVG generated for `https://reptiscale-demo.vercel.app/demo/show-qr`
- HighLevel funnel published at `https://demo.hatchkitai.com`
- HighLevel page URL custom values and trigger links updated to published funnel URLs
- Store-first decision made on 2026-06-08: the funnel stays as campaign proof, but Hatchkit's client product should use a real HighLevel Store/Website for browsing, product details, cart, checkout, inventory, and order-triggered workflows.
- `SunScale Geckos Store` was created in HighLevel Store Builder on 2026-06-08 with builder ID `c6oIcQOaIihVIc23qseX` and preview URL `https://sites.leadconnectorhq.com/preview/c6oIcQOaIihVIc23qseX`.
- `npm run audit:store-readiness` reports `overallStatus=store_shell_created_visual_builder_required`: 8/8 required products exist, are visible in the online store, have prices, have images, 6/6 product collections exist, the store shell is recorded, and the store shipping origin matches SunScale.
- embedded HighLevel page forms can submit to Reptiscale webhooks from `https://demo.hatchkitai.com`
- the published page forms are custom HTML/code forms, not native HighLevel form elements
- on 2026-06-06, Vercel production env values were corrected so the webhook backend uses the SunScale location ID `oCn199rzTjj0rPgqXyXU`
- a controlled live Starter Guide webhook test created a SunScale contact with the expected lead tags and `journey:nurture` appeared after one minute
- on 2026-06-07, the Mango detail `Reserve Mango` no-contact error was fixed in the Reptiscale webhook backend and redeployed to Vercel
- on 2026-06-07, a browser click test saved proof at `docs/demo-showroom/mango-reserve-click-pass-20260607.png`
- on 2026-06-07, the public Starter Guide webhook path was protected from the bad HighLevel lead-drip copy by using `journey:lead-captured-webhook` plus direct webhook-sent guide email
- on 2026-06-07, the HighLevel `DEMO - Reptiscale - Starter Guide Lead Capture` and `Lead Education Drip` email bodies were manually corrected and published with properly formatted email copy
- on 2026-06-07, the fresh non-SMS site/webhook/CRM path passed with `hatchkit.demo.liveqa.20260607050914@example.com`
- on 2026-06-07, a later fresh non-SMS published demo path passed 14/14 with `hatchkit.demo.liveqa.20260607195758@example.com`
- Privacy Policy and Terms pages published on `https://demo.hatchkitai.com`
- Storefront compliance footer and HighLevel chat widget added for A2P review

## Hatchkit Master Snapshot Status

Clean master account:

- `Hatchkit Master Snapshot - v1`
- Location ID: `H81tekJbNbeyYsnTRKVH`

API-built foundation:

- 17 reusable custom fields
- 65 structured tags
- 12 placeholder custom values
- 4 reusable products/prices

Current master blocker:

- Pipeline creation is blocked by missing opportunities/pipelines write scope unless solved by snapshot import, updated API scope, or manual UI creation.

Latest source/master inventory:

| Asset | SunScale Source | Hatchkit Master |
|---|---:|---:|
| custom fields | 17 | 17 |
| tags | 84 | 65 |
| custom values | 10 | 12 |
| pipelines | 3 | 0 |
| products | 8 | 4 |
| trigger links | 6 | 0 |
| workflows | 12 | 0 |

Run:

```powershell
npm run audit:snapshot-assets
npm run audit:store-readiness
```

## Remaining Work

Use:

`docs/demo-showroom/manual-highlevel-build-queue.md`

Completed manually in HighLevel:

1. Business profile settings.
2. Smart lists.
3. HighLevel campaign funnel pages.
4. Demo-safe reservation/payment simulation.
5. All 12 accelerated demo workflows.
6. Privacy/Terms pages and Storefront compliance footer/chat widget.

Remaining manual or provider-dependent items:

1. Finish/publish `SunScale Geckos Store` in HighLevel `Sites -> Stores`.
2. Replace generic Store Builder branding/copy (`My Store`, `Our Products`, default hero image) with SunScale/Hatchkit-ready copy.
3. Confirm Products List, Product Details, Cart, Checkout, and Thank You pages.
4. Select/use the API-created product collections and configure checkout/thank-you copy.
5. Add store-triggered workflows for abandoned checkout, order submitted, and order fulfilled/shipping review.
6. A2P campaign approval, then live SMS delivery retest with a real opted-in test number.
7. Inbox demo messages after a usable conversation provider/messaging setup exists.
8. Social Planner proof after social accounts exist. Brianna Yetigex (`brianna@hatchkitai.com`) has been added as `ACCOUNT-ADMIN` staff and can be used for staff/approval-style demo proof after confirming her exact HighLevel user ID.
9. Full SMS-inclusive outside-in demo test with a fresh contact after A2P approval.

Workflow note:

- Because the published forms are custom-code webhook forms, do not rely only on native HighLevel `Form Submitted` triggers.
- The public Starter Guide path currently uses `journey:lead-captured-webhook` and a direct webhook-sent guide email; this remains a safe public path even though the HighLevel UI lead-capture email body has now been corrected.
- Do not switch the public Starter Guide path back to `journey:lead-captured` unless intentionally testing the HighLevel lead-capture workflow and `npm run audit:messages` remains clean afterward.
- The Referral path should trigger downstream automations from `journey:referral-captured`; do not route referred friends into the generic `journey:lead-captured` drip unless the drip has referral-specific branching.
- Use `docs/demo-showroom/automation-message-audit-and-corrections.md` to replace generic AI-generated workflow copy such as `Discover Mango & Exclusive Offers at Our Storefront`.
- Use `docs/demo-showroom/highlevel-workflow-ui-correction-worksheet.md` for the exact workflow IDs, priority HighLevel UI edits, and post-edit audit commands.
- Run `npm run audit:messages` to audit live workflow messages. Latest run on 2026-06-07 showed `overallStatus=pass`: referral isolation, public Starter Guide webhook, manually triggered `journey:lead-captured`, and review/VIP paths all pass with no mismatch flags.
- For the demo account, workflow execution windows should be 24/7. Remove Monday-Friday/business-hours restrictions.
- Leave "mark emails as read" off.
- Use `America/New_York` as the workflow timezone.
- Recommended demo re-entry:
  - ON for Starter Guide Lead Capture, Lead Education Drip, Animal Interest - Mango, Reservation Abandonment, Review And Referral, Repeat Buyer VIP.
  - OFF for Deposit Paid, Order Shipping Review, Simulated Shipped, Simulated Delivered And LAG, and Care Onboarding unless intentionally resetting a test contact.

## Safety Constraints

- Do not expose or print `.env` secrets.
- Do not touch the nested `HatchKit.ai` folder unless explicitly asked.
- Do not create live shipping labels.
- Do not create real payment charges during demos.
- Keep the SunScale demo account separate from the clean master/snapshot account.
- Treat `docs/demo-showroom/` as the source of truth for this phase.

## Repeatable Snapshot Direction

Use:

`docs/demo-showroom/repeatable-client-snapshot-process.md`

Recommended process:

1. Finish/publish the real HighLevel Store in `SunScale Geckos - Demo`.
2. Create `SunScale Demo Source - Hatchkit Base v0`.
3. Load that source snapshot into `Hatchkit Master Snapshot - v1`.
4. Sanitize names, copy, placeholders, timing, triggers, products, tags, and workflow settings.
5. Remove fake contacts, demo opportunities, and SunScale-only proof from the master.
6. Keep SMS gated until each client has A2P approval and an opted-in SMS test passes.
7. Export `Hatchkit Client Snapshot - v1` from the master.
8. Import into `Hatchkit Snapshot QA - v1`.
9. Run the full QA test path before using the snapshot for a paying customer.

## Fresh Prompt

For the next Codex chat, copy:

`docs/demo-showroom/next-codex-chat-prompt.md`
