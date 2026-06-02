# Pre-Subaccount Build Package

Last updated: 2026-06-02

This package completes the five prep tasks requested while waiting for the `SunScale Geckos - Demo` HighLevel subaccount.

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
- `templates/pages/sunscale-demo/sunscale-demo.css`

Use:

- preview locally
- paste/rebuild into HighLevel pages
- replace `REPLACE_WITH_SUNSCALE_DEMO_LOCATION_ID` after the new account exists

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

## Blocked Until New Subaccount Exists

- new HighLevel location ID
- account-specific page URLs
- account-specific payment links/order forms
- workflow publishing/testing in the new account
- real HighLevel screenshots from the demo account

## First Actions After Subaccount Exists

1. Record the new location ID.
2. Replace `SUNSCALE_DEMO_LOCATION_ID` in workflow recipes.
3. Replace `REPLACE_WITH_SUNSCALE_DEMO_LOCATION_ID` in page drafts if using standalone pages.
4. Set custom values from `custom-values.csv`.
5. Create/publish the pages.
6. Create products/payment simulation.
7. Build workflows from `accelerated-workflow-recipes.md`.
8. Load demo contacts/opportunities.
9. Run the test path in the sales script.

