# SunScale Demo Subaccount Setup Runbook

Last updated: 2026-06-05

Use this when building or refreshing the `SunScale Geckos - Demo` HighLevel subaccount.

The existing HatchKit account remains the master/snapshot account and must not be polluted with sales-call demo data.

## 1. Confirm The Subaccount

HighLevel subaccount name:

`SunScale Geckos - Demo`

Current live settings:

- Business/account name: `SunScale Geckos - Demo`
- Timezone: `America/New_York`
- Industry/category: pet services, breeder, ecommerce, or the closest available option
- Address: `3645 Essex Ave`, `Atlanta`, `GA`, `30339`
- Phone/email: `+19843001621` / `demo@hatchkitai.com`
- Website: `https://demo.hatchkitai.com/store`

Compliance note:

- Keep the sales demo visibly branded as SunScale.
- Use real owner/business information for A2P/business verification. Do not use fake SunScale identity data for carrier registration.

HighLevel location/subaccount ID:

`oCn199rzTjj0rPgqXyXU`

Current API limitation:

- `npm run sync:business-profile` can read the live account profile and records the desired SunScale values in local config.
- The current private integration token does not have the HighLevel location write scope, so profile edits must be made manually in HighLevel settings or with a broader-scoped token.
- `npm run sync:store-settings` can update the HighLevel store shipping origin and has been verified against this demo account.
- `npm run sync:shipping-zone` can create the demo-only HighLevel shipping zone and review-only shipping rate.

## 2. Confirm Local Config

Confirm these files still use the SunScale demo location ID:

- `data/breeders/sunscale-geckos/client.json`
  - `ghlLocationId`
- `data/breeders/sunscale-geckos/ghl-config.json`
  - `locationId`
- `docs/demo-showroom/import-data/custom-values.csv`
  - `demo_location_id`

Important:

- The current SunScale demo location ID is `oCn199rzTjj0rPgqXyXU`.
- If you see the old value `fqj4rbp2VRkvMa8GWVWn`, do not assume it is the new demo account.
- Keep `.env` secrets private.
- Keep the nested `HatchKit.ai` folder untouched.

## 3. Load Or Copy Master Assets

Preferred:

1. Save/export the current `HatchKit` account snapshot.
2. Load it into `SunScale Geckos - Demo`.
3. Customize the demo account with the SunScale-specific values below.

Fallback:

1. Build the account manually from this runbook.
2. Use `docs/demo-showroom/` as the source of truth.
3. Back-port only clean reusable assets into the HatchKit master account later.

## 4. Create Custom Values

First refresh the API-supported objects:

```powershell
npm run setup:showroom
```

This command creates or refreshes the business-profile status, store shipping origin, demo-only shipping zone/rate, custom fields, tags, demo contacts, opportunities, custom values, products, trigger links, contact notes/tasks, and smart-list support tags where the current API scope allows it.

Use `docs/demo-showroom/import-data/custom-values.csv`.

Set these first:

- `webhook_base_url`: `https://reptiscale-demo.vercel.app`
- `demo_location_id`: new SunScale demo location ID

Final published HighLevel page values:

- `storefront_url`
- `starter_guide_url`
- `mango_detail_url`
- `reservation_url`
- `review_url`
- `referral_url`
- `vip_url`
- `show_qr_url`

These currently point to published HighLevel campaign funnel URLs on `https://demo.hatchkitai.com`. The public SunScale helper routes on `https://reptiscale-demo.vercel.app` remain fallback/testing pages.

Store-first update:

- Finish/publish the created real HighLevel Store in `Sites -> Stores` before creating the SunScale source snapshot.
- Keep the current funnel as campaign proof around the Store.
- Use `docs/demo-showroom/highlevel-store-build-queue.md` and run `npm run audit:store-readiness`.

## 5. Create Or Verify Custom Fields

The canonical custom fields are in `scripts/setup-demo-account.js`.

Create/verify these contact fields:

- `Species Interest`
- `Morph Preference`
- `Price Tier`
- `Shipping Preference`
- `Temperature Tolerance Min`
- `Temperature Tolerance Max`
- `Show Source`
- `Lead Score`
- `Last Show Attended`
- `Shipping Status`
- `Customer Journey Stage`
- `Animal Interest`
- `Offer Name`
- `Purchase Status`
- `Last Purchase Amount`
- `Referral Source`
- `Next Best Action`

After the local config has the new location ID, run:

```powershell
npm run setup:demo
```

You can also run the sync with an explicit location ID:

```powershell
node scripts/setup-demo-account.js --location=oCn199rzTjj0rPgqXyXU
```

Current verified API behavior:

- custom fields, tags, contacts, pipelines, and opportunities sync successfully in this demo account

## 6. Verify Pipelines

Created by `npm run setup:showroom`. Verify these in HighLevel:

`HatchKit - Lead Pipeline`

- `New Lead`
- `Contacted`
- `Interested`
- `Qualified`
- `Customer`
- `Lost`

`HatchKit - Sales Pipeline`

- `Animal Selected`
- `Invoice Sent`
- `Payment Received`
- `Shipping Scheduled`
- `Shipped`
- `Delivered`
- `Follow-Up Complete`

`HatchKit - Shipping Pipeline`

- `Pending Review`
- `Weather Check`
- `Approved to Ship`
- `Label Created`
- `Dropped Off`
- `In Transit`
- `Delivered`
- `LAG Confirmed`
- `Complete`

## 7. Create Products And Payment Simulation

Use `docs/demo-showroom/import-data/products.csv`.

Created by:

```powershell
npm run sync:products
```

Offer products:

- `Animal Reservation Deposit`: `$75`
- `Crested Gecko Care Starter Kit`: `$49`
- `30-Minute Setup Review`: `$35`
- `Crested Gecko Starter Guide`: `$0`

Animal inventory products:

- `Nova - Lilly White`: `$1,200`
- `Mango - Harlequin Dalmatian`: `$225`
- `Echo - Tricolor Pinstripe`: `$650`
- `Pepper - Super Dalmatian`: `$475`

Demo rule:

- Use a simulation button or test-mode payment path.
- Use `SunScale Demo - Shipping Review Only` for demo checkout/order-form shipping.
- Do not create real charges for a prospect during the demo unless that is explicitly intended.
- Do not create live shipping labels.

## 8. Build Pages

Status: completed and published in HighLevel.

Use:

- `docs/demo-showroom/copy-ready-pages.md`
- `templates/pages/sunscale-demo/`
- `docs/demo-showroom/visual-assets/`

Build/publish:

- `SunScale Demo - Storefront`
- `SunScale Demo - Crested Gecko Starter Guide`
- `SunScale Demo - Mango Animal Detail`
- `SunScale Demo - Mango Reservation`
- `SunScale Demo - Order Thank You`
- `SunScale Demo - Review And Referral`
- `SunScale Demo - VIP Availability List`
- `SunScale Demo - Expo QR Signup`
- `Privacy Policy`
- `Terms of Service`

After publishing, update the HighLevel custom values with the final page URLs.

A2P compliance additions on Storefront:

- visible business footer with Geoffrey Wall, phone, email, and address
- Privacy Policy and Terms links
- HighLevel chat widget script
- no separate phone-number form outside the chat widget on that page

## 9. Build Smart Lists

Status: completed manually in HighLevel.

Use `docs/demo-showroom/import-data/smart-lists.csv`.

Core smart lists:

- `New Crested Gecko Leads`
- `Hot Animal Buyers`
- `Shipping Holds`
- `Operator Review Queue`
- `Ready For Label Approval`
- `Review / Referral Candidates`
- `Repeat Buyer VIP`
- `Demo Contacts`

Before building lists, make sure their filter tags exist:

```powershell
npm run sync:smart-list-tags
```

This helper now requires the new location ID through the breeder config, `.env`, or `--location=...`.

Smart list creation remains manual in the HighLevel UI for rebuilds. The API setup creates the tags these lists depend on.

## 10. Build Accelerated Workflows

Status: completed and published in HighLevel.

Use `docs/demo-showroom/accelerated-workflow-recipes.md`.

Workflow prefix:

`DEMO - Reptiscale -`

Webhook base:

`https://reptiscale-demo.vercel.app`

The workflow payloads should use location ID `oCn199rzTjj0rPgqXyXU`.

Build in this order:

1. Starter Guide Lead Capture
2. Lead Education Drip
3. Animal Interest - Mango
4. Reservation Abandonment
5. Deposit Paid
6. Order Shipping Review
7. Simulated Shipped
8. Simulated Delivered And LAG
9. Care Onboarding
10. Review And Referral
11. Repeat Buyer VIP
12. Social Content Approval

Keep these demo workflows separate from production-timing master workflows.

Workflow creation remains manual in the HighLevel UI for rebuilds. The public workflow API can list workflow metadata, but does not build the visual workflow steps used here.

Workflow settings to confirm before the next full demo test:

- Run 24/7, all days and all hours.
- Timezone: `America/New_York`.
- Mark emails as read: off.
- Remove Monday-Friday/business-hours restrictions from demo workflows.
- The published pages use custom-code webhook forms, not native HighLevel forms. Use tag-added triggers such as `journey:lead-captured-webhook`, `journey:referral-captured`, `journey:offer-presented`, and `journey:purchased` where native form triggers will not fire.
- Do not re-add `journey:lead-captured` to public custom-code forms until the HighLevel UI lead-drip email body is corrected and the message audit has no mismatch flags.
- Follow the re-entry guidance in `docs/demo-showroom/accelerated-workflow-recipes.md`.

## 11. Load Demo Data

Use:

- `docs/demo-showroom/import-data/contacts.csv`
- `docs/demo-showroom/import-data/opportunities.csv`
- `docs/demo-showroom/import-data/animals.csv`

Required demo contacts:

- Ava Bennett
- Marcus Hill
- Jenna Ortiz
- Noah Parker
- Priya Raman
- Drew Coleman
- Taylor Brooks

Required demo operator contact:

- Sarah Mitchell / `hatchkit.demo.operator@example.com`

Demo contacts and opportunities are created by `npm run setup:showroom`. Verify them in HighLevel before building the visual workflows.

## 12. Seed Contact Notes And Tasks

Use:

- `docs/demo-showroom/import-data/contact-activity.csv`

Created by:

```powershell
npm run sync:contact-activity
```

This creates one pinned internal note and one open follow-up task on each buyer/operator demo contact. These are demo-safe CRM artifacts only; they do not send outbound email/SMS, charge payments, or create shipping labels.

Use Taylor Brooks as the full-path CRM proof record after the visual workflows are built.

## 13. Add Demo Inbox Messages

Create these manually if a real conversation provider is not configured:

- Ava: `Hi Sarah, I scanned your QR at the show and wanted to ask about Nova.`
- Marcus: `Can you hold Pepper until the Phoenix heat wave clears?`
- Jenna: `I'm new to crested geckos. Would Mango be a good beginner animal?`
- Noah: `I saw Mango at the expo. Can I pick up at the next show?`
- Priya: `Echo is paid. Please send the setup checklist before shipping.`
- Drew: `Drew arrived healthy. I can send a review and a photo update.`

The public inbound-message API requires a configured `conversationProviderId`, so this remains UI/provider-dependent in the demo account for now. A2P Brand Registration is registered with TCR, and A2P Campaign Registration was submitted for review on 2026-06-05. Live SMS/inbox proof still needs campaign approval and a real sending test.

## 14. Add Social Planner Proof

HighLevel Social Planner APIs exist, but they require connected account IDs and a valid creator/approver user.

Current SunScale config:

- `instagramPageId`: `null`
- `facebookPageId`: `null`

Staff/admin available:

- Brianna Yetigex (`brianna@hatchkitai.com`) has been added to the SunScale demo account as `ACCOUNT-ADMIN`.
- Confirm her exact HighLevel user ID in the UI/API before using it in Social Planner API payloads.

Choose one path:

1. Connect demo social accounts in HighLevel, then add draft/in-review posts using the Social Planner UI or API.
2. If no social accounts are connected, use Brianna as the staff/partner proof point with the export packet and sales script to show the content approval workflow concept manually.

Keep social proof demo-only unless real client social accounts are intentionally connected.

## 15. Test The Showroom

Current status:

- Live audit passes 17 of 17 checks.
- A2P Brand Registration is registered with TCR.
- A2P Campaign Registration was submitted for review on 2026-06-05.
- Vercel production env values were corrected on 2026-06-06 so custom-code page forms create contacts in the SunScale location.
- A controlled Starter Guide webhook test created a SunScale contact with expected lead tags, and `journey:nurture` appeared after one minute.
- Test the CRM/webhook/workflow path now.
- Retest real SMS delivery with an opted-in test number after campaign approval.

Run the canonical test path:

1. Submit the starter guide form.
2. Confirm a new HighLevel contact exists.
3. Confirm tags and fields are set.
4. Trigger Mango interest.
5. Simulate deposit paid.
6. Confirm the sales opportunity reaches `Payment Received`.
7. Confirm the shipping opportunity reaches `Pending Review`.
8. Confirm shipping status moves through `Ready for Label Approval`, `In Transit`, `Delivered`, and `LAG Confirmed`.
9. Confirm care, review/referral, and VIP messages fire.
10. Confirm smart lists show the right records.

Use `docs/demo-showroom/ten-minute-sales-demo-script.md` for the sales-call walkthrough.
