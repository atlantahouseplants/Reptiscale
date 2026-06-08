# HatchKit Demo Showroom Docs

Last updated: 2026-06-08

This folder is the source of truth for turning the current Hatchkit technical build into a sellable HighLevel demo showroom and reusable client template.

## Read In This Order

1. `hatchkit-ghl-demo-showroom-prd.md`
   - Defines the product decision, demo experience, required assets, and success criteria.

2. `master-build-plan.md`
   - Turns the PRD into build phases, deliverables, owners, and acceptance checks.

3. `subagent-execution-plan.md`
   - Defines the workstreams for parallel agent or human execution.

4. `highlevel-account-execution-plan.md`
   - Defines which HighLevel subaccounts to use or create.

5. `pre-subaccount-prep-plan.md`
   - Historical prep plan for what was prepared before the demo subaccount existed.

6. `pre-subaccount-build-package.md`
   - Index of completed copy-ready pages, workflow recipes, import data, scripts, visual assets, and post-subaccount build artifacts.

7. `sunscale-subaccount-setup-runbook.md`
   - Exact build checklist to run after the `SunScale Geckos - Demo` account exists.

8. `highlevel-demo-account-build-status.md`
   - Current SunScale demo account build status, API-built objects, contact activity, and remaining manual HighLevel work.

9. `manual-highlevel-build-queue.md`
   - Completed HighLevel UI build record plus remaining provider/compliance-dependent work.

10. `repeatable-client-snapshot-process.md`
   - How to use HighLevel as the repeatable client snapshot engine.

11. `live-showroom-audit.md`
   - Latest live API/public-route audit for the SunScale demo account.

12. `automation-message-audit-and-corrections.md`
   - Canonical email/SMS copy and HighLevel workflow message correction checklist.

13. `highlevel-workflow-ui-correction-worksheet.md`
   - Exact live workflow IDs, priority UI copy edits, and post-edit message audit commands.

14. `gap-register.md`
   - Tracks what is missing between the current project and a sales-ready showroom.

15. `breeder-input-checklist.md`
   - Lists what to ask a real crested gecko breeder for better demo realism.

16. `next-codex-chat-prompt.md`
   - Fresh prompt for starting a new Codex chat in this folder.

## Product Direction

Near-term product:

Hatchkit is a done-for-you HighLevel agency/SaaS system for reptile breeders.

The product sold to a breeder is a branded HighLevel subaccount with storefront, CRM, inbox, automations, campaigns, shipping review, care onboarding, reviews, referrals, and repeat-buyer systems.

Store-first direction:

- The main client storefront should be a HighLevel Store/Website.
- Funnels should be campaign assets around the Store, not the primary online marketplace.
- Use `store-first-commerce-decision.md` and `highlevel-store-build-queue.md` before source snapshot work.

The Vercel server is the automation support layer. It is not the main product demo.

## Current Status

The `SunScale Geckos - Demo` subaccount exists and has been API-built as far as current access allows.

Current live demo account:

- Name: `SunScale Geckos - Demo`
- Location ID: `oCn199rzTjj0rPgqXyXU`
- Audit: 17 of 17 checks pass
- Published showroom: `https://demo.hatchkitai.com`
- HighLevel workflows: 12 accelerated demo workflows published
- Public webhook message paths and HighLevel lead-capture message paths pass live message audit with no mismatch flags as of 2026-06-07.
- Message audit status: `pass`.
- A2P/SMS: A2P Brand Registration is registered with TCR; A2P Campaign Registration was submitted for review on 2026-06-05; live SMS sending still needs campaign approval and a real opted-in test
- Snapshot role: SunScale is also the source prototype for reusable Hatchkit pages, workflows, pipelines, trigger links, smart-list logic, and storefront/listing assets.
- Store readiness: `npm run audit:store-readiness` reports `overallStatus=store_shell_created_visual_builder_required`; the `SunScale Geckos Store` shell exists, 8/8 products have prices, online-store visibility, images, product collections, and the SunScale shipping origin. Final Store Builder branding/layout/checkout copy/publish work is still required.

Run:

```powershell
node scripts\audit-demo-showroom-live.js
npm run audit:store-readiness
```

## Immediate Next Step

Do not rebuild the core demo. It is ready for non-SMS testing.

Next:

1. Finish/publish the real HighLevel Store in `Sites -> Stores`:
   - Products List Page
   - Product Details Page
   - Cart Page
   - Checkout Page
   - Thank You Page
   - product collections
   - branded checkout and thank-you copy
2. Add store-triggered workflows:
   - Abandoned Checkout
   - Order Submitted
   - Order Fulfilled / Shipping Review
3. Sweep the `DEMO - Reptiscale - ...` workflow settings in HighLevel:
   - run 24/7
   - remove Monday-Friday/business-hours restrictions
   - keep mark-emails-as-read off
   - confirm custom-code form paths use tag-added triggers where needed
4. Confirm the A2P campaign is approved and the phone number is usable for SMS in HighLevel.
5. Run a real opted-in SMS test after campaign approval.
6. Run the full published Store plus campaign funnel test path with a fresh contact.
7. Verify contacts, tags, fields, opportunities, smart lists, store orders, and workflow execution logs.
8. Document any SMS delivery issue separately from CRM/webhook/store behavior.
9. Keep HighLevel UI email/SMS bodies aligned with `automation-message-audit-and-corrections.md`.
10. Use `highlevel-workflow-ui-correction-worksheet.md` for exact workflow IDs, replacement copy, and verification commands if copy drifts again.
11. Add inbox/social proof if providers are connected.

In parallel with A2P/SMS waiting, finish the real HighLevel Store in SunScale, create `SunScale Demo Source - Hatchkit Base v0`, load that source snapshot into `Hatchkit Master Snapshot - v1`, and sanitize the master into `Hatchkit Client Snapshot - v1` using `repeatable-client-snapshot-process.md`.
