# Pre-Subaccount Prep Plan

Last updated: 2026-06-02

## Situation

The `SunScale Geckos - Demo` HighLevel subaccount cannot be created yet because the agency account is at its subaccount limit.

Expected delay:

- 24 to 48 hours

## Decision

Do not pause the project.

Use the waiting period to prepare every asset that does not require the new HighLevel location ID.

## What Can Be Done Now

### 1. Finalize Demo Story

Prepare the exact sales-call flow:

1. Buyer visits SunScale storefront.
2. Buyer downloads starter guide.
3. Buyer receives immediate guide message.
4. Buyer views Mango animal detail page.
5. Buyer clicks reserve.
6. Buyer receives reservation reminder.
7. Buyer pays/simulates deposit.
8. Shipping review runs.
9. Demo simulates shipment/delivery.
10. Buyer receives care onboarding.
11. Buyer receives review/referral request.
12. Buyer enters VIP repeat-buyer list.

Output:

- final 10-minute demo script
- final 30-minute deep-dive script

### 2. Build Copy-Ready HighLevel Pages

Prepare filled SunScale versions of:

- storefront
- starter guide
- animal detail for Mango
- reservation/deposit page
- thank-you/order confirmation page
- review/referral page
- VIP availability page
- show QR signup page

These can be local HTML/source files or copy blocks ready to paste into HighLevel.

### 3. Prepare Demo Workflow Recipes

Write exact HighLevel workflow recipes for:

- `DEMO - Starter Guide Lead Capture`
- `DEMO - Lead Magnet Delivery`
- `DEMO - Animal Interest / Offer Clicked`
- `DEMO - Reservation Abandonment`
- `DEMO - Deposit Paid / Order Submitted`
- `DEMO - Order Shipping Review`
- `DEMO - Simulated Shipped`
- `DEMO - Simulated Delivered / LAG Confirmed`
- `DEMO - Care Onboarding`
- `DEMO - Review And Referral`
- `DEMO - Repeat Buyer VIP`

Each recipe should include:

- trigger
- conditions
- actions
- webhook URL
- payload
- tags/fields set
- wait timing
- stop conditions

### 4. Prepare Demo Data Import Pack

Prepare import-ready data for:

- contacts
- opportunities
- animals/products
- smart list definitions
- tags
- custom values

Required contacts:

- Ava Bennett
- Marcus Hill
- Jenna Ortiz
- Noah Parker
- Priya Raman
- Drew Coleman

### 5. Prepare Demo Visual Assets

Prepare or request:

- SunScale Geckos logo
- hero image
- Nova image
- Mango image
- Echo image
- Pepper image
- QR code placeholder
- HighLevel screenshot placeholders

If real breeder photos are not available yet, use temporary generated/placeholders and replace before live sales calls if needed.

### 6. Prepare Account Setup Checklist

Prepare the exact checklist to run once the new account exists:

1. Record new HighLevel location ID.
2. Add/update local breeder config.
3. Load or copy snapshot assets.
4. Create custom values.
5. Verify fields/tags/pipelines.
6. Create products/payment links.
7. Publish pages.
8. Wire workflows.
9. Load demo contacts/opportunities.
10. Run full accelerated demo.

## What Cannot Be Done Until New Subaccount Exists

- Get the new location/subaccount ID.
- Create account-specific HighLevel custom fields.
- Create account-specific products/payment links.
- Publish account-specific pages.
- Wire workflows against the new account.
- Test real HighLevel contact creation in the new demo account.
- Export screenshots from the new demo account.

## Suggested Work During The Wait

Priority order:

1. Build copy-ready page assets.
2. Write exact workflow recipes.
3. Build demo data import pack.
4. Build sales walkthrough.
5. Prepare visual asset list or generated placeholders.

## When The New Account Is Available

Start with:

1. New account name: `SunScale Geckos - Demo`
2. New location ID
3. Sender email/phone status
4. Payment test mode status
5. Whether a snapshot was loaded or the account is blank

Then execute the HighLevel account setup from `highlevel-account-execution-plan.md`.

