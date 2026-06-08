# Pre-Subaccount Build Package

Last updated: 2026-06-05

This package started as the pre-subaccount prep bundle and now also indexes the post-subaccount API build artifacts for the `SunScale Geckos - Demo` showroom.

## 1. Copy-Ready SunScale Pages

Guide:

- `docs/demo-showroom/copy-ready-pages.md`

Local page drafts:

- `templates/pages/sunscale-demo/storefront.html`
- `templates/pages/sunscale-demo/starter-guide.html`
- `templates/pages/sunscale-demo/mango-detail.html`
- `templates/pages/sunscale-demo/reservation.html`
- `templates/pages/sunscale-demo/thank-you.html`
- `templates/pages/sunscale-demo/review-referral.html`
- `templates/pages/sunscale-demo/vip.html`
- `templates/pages/sunscale-demo/show-qr.html`
- `templates/pages/sunscale-demo/sunscale-demo.css`

Use:

- reference if the HighLevel pages need to be rebuilt or edited
- location ID is already set to `oCn199rzTjj0rPgqXyXU` in local page drafts that need it

Status:

- HighLevel funnel pages are built and published at `https://demo.hatchkitai.com`.
- Privacy Policy and Terms pages are also published.
- The real HighLevel Store/Website is now the primary next build, and these local pages should be treated as fallback/copy references for campaign funnels and Store Builder content.

## 2. Accelerated HighLevel Workflow Recipes

File:

- `docs/demo-showroom/accelerated-workflow-recipes.md`

Includes exact recipes for:

- starter guide lead capture
- lead education drip
- animal interest / offer clicked
- reservation abandonment
- deposit paid / order submitted
- order shipping review
- simulated shipped
- simulated delivered / LAG confirmed
- care onboarding
- review and referral
- repeat buyer VIP
- social content approval demo

## 3. Dummy Import Data

Folder:

- `docs/demo-showroom/import-data/`

Files:

- `contacts.csv`
- `opportunities.csv`
- `products.csv`
- `animals.csv`
- `custom-values.csv`
- `smart-lists.csv`
- `contact-activity.csv`

Use:

- import where HighLevel supports import
- otherwise use as manual build sheets

## 4. 10-Minute Sales Demo Script

File:

- `docs/demo-showroom/ten-minute-sales-demo-script.md`

Includes:

- timed talk track
- what to show
- expected proof points
- closing language
- what not to say

## 5. Visual Assets

Folder:

- `docs/demo-showroom/visual-assets/`

Files:

- `sunscale-logo.svg`
- `hero-pattern.svg`
- `nova-placeholder.svg`
- `mango-placeholder.svg`
- `echo-placeholder.svg`
- `pepper-placeholder.svg`
- `starter-guide-cover.svg`
- `qr-placeholder.svg`
- `sunscale-reference-sheet.png`

Use:

- placeholders for the local pages
- visual references for the HighLevel build
- replace with real breeder photos or final generated PNGs before public sales demos if desired

## 6. Subaccount Setup Runbook

File:

- `docs/demo-showroom/sunscale-subaccount-setup-runbook.md`

Use:

- refresh or verify the existing `SunScale Geckos - Demo` account
- confirm the local SunScale config still uses the current location ID
- understand the completed fields, tags, pipelines, custom values, products, pages, smart lists, workflows, demo records, and test path

## 7. Build Status

File:

- `docs/demo-showroom/highlevel-demo-account-build-status.md`

Use:

- see what has already been built through the HighLevel API
- see what was built manually and what remains provider/compliance-dependent

## 8. Manual HighLevel Build Queue

File:

- `docs/demo-showroom/manual-highlevel-build-queue.md`

Use:

- see the completed UI build and remaining provider/compliance-dependent work
- track SMS sending verification, inbox, and social proof follow-up

## 9. Repeatable Client Snapshot Process

File:

- `docs/demo-showroom/repeatable-client-snapshot-process.md`

Use:

- understand what stays in HighLevel versus the Vercel support layer
- build a repeatable master snapshot for future breeder clients

## Current Next Actions

1. Finish/publish `SunScale Geckos Store` in HighLevel `Sites -> Stores`.
2. Run `npm run sync:store-catalog` and `npm run audit:store-readiness`.
3. Confirm live audit still passes with `node scripts\audit-demo-showroom-live.js`.
4. Confirm the A2P campaign is approved and the phone number is usable for SMS in HighLevel.
5. Run a real opted-in SMS test after campaign approval.
6. Run the full published Store plus campaign funnel test path with a fresh contact.
7. Verify tags, fields, smart lists, opportunities, workflow logs, email, and SMS where available.
8. Create the SunScale source snapshot only after the Store path is demo-ready.
