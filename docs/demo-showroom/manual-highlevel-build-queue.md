# Manual HighLevel Build Queue

Last updated: 2026-06-08

This tracks what was completed inside the `SunScale Geckos - Demo` HighLevel UI and what remains for the Store-first source prototype.

Location ID:

`oCn199rzTjj0rPgqXyXU`

## Already Built Through API

Do not rebuild these manually unless the live audit shows a failure:

- 17 custom contact fields
- required structured tags
- 7 buyer demo contacts
- 1 demo operator contact
- 3 HatchKit pipelines
- 12 demo opportunities
- 10 custom values
- 8 active products with prices and store images
- 8 products marked visible in the online store
- 6 product collections created and products assigned
- 6 trigger links
- store shipping origin
- demo-only shipping zone: `SunScale Demo - Shipping Review Only`
- review-only shipping rate: `Shipping quoted after weather review`
- 8 pinned contact notes
- 8 contact follow-up tasks
- smart-list support tags
- public SunScale helper pages and live webhook form wiring

Refresh and verify those with:

```powershell
npm run setup:showroom
npm run sync:store-catalog
npm run audit:showroom
npm run audit:store-readiness
```

## Completed Manually In HighLevel

- Business profile settings were updated and verified by `npm run audit:showroom` at 8/8 expected profile fields.
- Smart lists were created in the HighLevel Contacts UI from `docs/demo-showroom/import-data/smart-lists.csv`.
- HighLevel funnel `SunScale Demo Showroom` was created and published at `https://demo.hatchkitai.com`.
- The funnel is now treated as campaign proof, not the final client storefront pattern.
- HighLevel page URL custom values and trigger links were updated to the published funnel URLs.
- The embedded page forms post to the deployed Reptiscale webhook backend, and CORS is enabled for `https://demo.hatchkitai.com`.
- All 12 accelerated demo workflows were created and published in HighLevel.
- HighLevel `DEMO - Reptiscale - Starter Guide Lead Capture` and `Lead Education Drip` email copy was corrected and published; the live message audit now passes with `overallStatus=pass`.
- Privacy Policy and Terms of Service pages were created and published.
- Compliance footer and HighLevel chat widget were added to the Storefront page.
- `SunScale Geckos Store` was created in HighLevel Store Builder.
- Store preview confirms all 8 products render with product images.
- A2P Brand Registration for this location is registered with TCR as of the LeadConnector update received on 2026-06-05.

## Active Build Direction

Finish and publish the real HighLevel Store in `Sites -> Stores` before creating the SunScale source snapshot.

Use:

- `docs/demo-showroom/store-first-commerce-decision.md`
- `docs/demo-showroom/highlevel-store-build-queue.md`
- `docs/demo-showroom/sunscale-store-readiness.md`

Current Store readiness status:

- `npm run audit:store-readiness` reports `overallStatus=store_shell_created_visual_builder_required`.
- Products, prices, product images, product collections, shipping origin, and store shell tracking pass.
- Store Builder branding/layout/checkout/publish work is still required.

## 1. Business Profile Settings

Why manual:

- `npm run sync:business-profile` can read the location profile, but the current token is not authorized for location profile writes.

Completed in HighLevel business/sub-account settings:

- Business/account name: `SunScale Geckos - Demo`
- Email: `demo@hatchkitai.com`
- Phone: `+19843001621`
- Address: `3645 Essex Ave`, `Atlanta`, `GA`, `30339`
- Website: `https://demo.hatchkitai.com/store`
- Timezone: `America/New_York`

Keep the account visibly demo-marked, but keep A2P/business verification tied to real owner/business information. Do not connect real customer data.

## 2. HighLevel Store

Why manual:

- HighLevel Store Builder work is visual UI work.
- Current API/tooling verifies products and store settings, but does not create or style Store pages.

Build in HighLevel:

- Store name: `SunScale Geckos Store`
- Builder ID: `c6oIcQOaIihVIc23qseX`
- Preview URL: `https://sites.leadconnectorhq.com/preview/c6oIcQOaIihVIc23qseX`
- Products List Page
- Product Details Page
- Cart Page
- Checkout Page
- Thank You Page
- Product collections:
  - `Available Animals`
  - `Crested Geckos`
  - `Reserved / Sold Examples`
  - `Care & Supplies`
  - `Lead Magnets / Digital`
  - `Deposits & Reservations`

Use these products:

- `Animal Reservation Deposit`
- `Crested Gecko Care Starter Kit`
- `30-Minute Setup Review`
- `Crested Gecko Starter Guide`
- `Nova - Lilly White`
- `Mango - Harlequin Dalmatian`
- `Echo - Tricolor Pinstripe`
- `Pepper - Super Dalmatian`

Checkout/thank-you copy must explain:

- live-animal shipping is reviewed before scheduling
- no live shipping label is created automatically
- demo testing should not create real charges

Store Builder edits still needed:

- Replace generic `My Store` branding.
- Replace generic `Our Products` hero/copy.
- Replace or remove the default mountain hero image.
- Confirm product detail, cart, checkout, and thank-you pages.
- Publish only after checkout copy is demo-safe.

Run after editing:

```powershell
npm run audit:store-readiness
```

## 3. Campaign Pages And Funnels

Why manual:

- HighLevel Forms/Funnels APIs currently expose read/list style access for the builder assets needed here, not full visual page/funnel construction.

Completed in HighLevel funnel `SunScale Demo Showroom`:

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

Keep this funnel as:

- starter guide campaign
- featured animal campaign
- reservation proof
- review/referral campaign
- VIP campaign
- show QR campaign

Do not use it as the final customer online store pattern.

Use:

- `docs/demo-showroom/copy-ready-pages.md`
- `templates/pages/sunscale-demo/`
- `docs/demo-showroom/visual-assets/`

Updated these HighLevel custom values from their Vercel helper-page URLs to the final HighLevel page URLs:

- `storefront_url`
- `starter_guide_url`
- `mango_detail_url`
- `reservation_url`
- `review_url`
- `referral_url`
- `vip_url`
- `show_qr_url`

Updated the six trigger links to point to the final HighLevel URLs.

Compliance additions:

- Storefront footer shows `Geoffrey Wall`, `+19843001621`, `demo@hatchkitai.com`, and `3645 Essex Ave, Atlanta, GA 30339`.
- Storefront links to `/privacy` and `/terms`.
- Storefront includes the HighLevel chat widget script.
- Separate non-widget phone fields were removed from the Storefront page where the chat widget is embedded.

## 4. Smart Lists

Why manual:

- The API setup creates the tags these lists depend on, but the saved-contact-list/filter UI remains a HighLevel UI task.

Completed in HighLevel Contacts smart lists:

- `New Crested Gecko Leads`
- `Hot Animal Buyers`
- `Shipping Holds`
- `Operator Review Queue`
- `Ready For Label Approval`
- `Review / Referral Candidates`
- `Repeat Buyer VIP`
- `Demo Contacts`

Use:

- `docs/demo-showroom/import-data/smart-lists.csv`
- `npm run sync:smart-list-tags`

## 5. Store Checkout, Payment Link, Or Order Form Layout

Why manual:

- Products, prices, store shipping origin, and demo shipping rate are API-built.
- The final Store checkout, order-form/payment-link layout, and visual checkout wiring are still HighLevel builder tasks.

Completed a demo-safe reservation path in the `Mango Reservation` funnel step:

- Product: `Animal Reservation Deposit`
- Price: `$75`
- Shipping option: `SunScale Demo - Shipping Review Only`
- Rate: `Shipping quoted after weather review`
- Keep real charges disabled unless intentionally using test-mode payment collection.
- Do not create live shipping labels.

Optional later enhancement: replace the simulation button with a test-mode HighLevel payment link/order form after workflows exist.

## 6. Accelerated And Store Workflows

Why manual:

- The workflow API can list/read metadata, but the visual workflow steps used by this demo must be built in HighLevel.

Completed from:

- `docs/demo-showroom/accelerated-workflow-recipes.md`

Published workflows:

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

Use demo timing in minutes. Do not copy these wait durations into the master production snapshot unchanged.

Store-first workflow additions still needed:

- `HK Demo - Store Abandoned Checkout`
- `HK Demo - Store Order Submitted`
- `HK Demo - Store Deposit Paid`
- `HK Demo - Store Shipping Review`
- `HK Demo - Store Order Fulfilled`

Prefer Ecommerce/Payments triggers:

- Abandoned Checkout
- Order Submitted with order source `Store`
- Order Fulfilled

Message audit:

- Use `docs/demo-showroom/automation-message-audit-and-corrections.md` as the canonical email/SMS copy checklist.
- Use `docs/demo-showroom/highlevel-workflow-ui-correction-worksheet.md` for exact live workflow IDs, priority UI edits, and copy/paste replacement text.
- Run `npm run audit:messages` to create `docs/demo-showroom/automation-message-live-audit.json` and `.md` with live message evidence.
- Use `node scripts\audit-highlevel-automation-messages.js --wait=90 --fail-on-mismatch` as the hard readiness gate after HighLevel UI edits; it should exit cleanly only when no mismatch flags remain.
- Replace generic AI-generated copy such as `Discover Mango & Exclusive Offers at Our Storefront`.
- Referral leads should use `journey:referral-captured` and a referral welcome workflow, not the generic `journey:lead-captured` lead drip.
- Public custom-code Starter Guide submissions are protected by `journey:lead-captured-webhook` and a direct webhook-sent guide email. The HighLevel UI lead-capture email body is also corrected as of 2026-06-07.
- Current live evidence from 2026-06-07: `overallStatus=pass`; referral isolation, public Starter Guide webhook copy, manually triggered `journey:lead-captured`, and review/VIP all pass with no mismatch flags.

Settings to confirm in each demo workflow:

- Execution schedule: 24/7, all days and all hours.
- Timezone: `America/New_York`.
- Mark emails as read: off.
- Quiet hours/business-hours restrictions: off for the demo unless HighLevel forces a compliance rule.
- Published page form paths are custom-code webhook forms, not native HighLevel forms. Use tag-added triggers for those paths where needed.
- The referral path is a custom-code form and should trigger from `journey:referral-captured`, not from only native form submission and not from the generic lead drip.

Recommended re-entry:

- ON for:
  - `DEMO - Reptiscale - Starter Guide Lead Capture`
  - `DEMO - Reptiscale - Lead Education Drip`
  - `DEMO - Reptiscale - Animal Interest - Mango`
  - `DEMO - Reptiscale - Reservation Abandonment`
  - `DEMO - Reptiscale - Review And Referral`
  - `DEMO - Reptiscale - Repeat Buyer VIP`
- OFF unless intentionally resetting a test contact:
  - `DEMO - Reptiscale - Deposit Paid`
  - `DEMO - Reptiscale - Order Shipping Review`
  - `DEMO - Reptiscale - Simulated Shipped`
  - `DEMO - Reptiscale - Simulated Delivered And LAG`
  - `DEMO - Reptiscale - Care Onboarding`

## 6. Inbox Demo Messages

Why manual:

- The public inbound-message API requires a configured `conversationProviderId`.
- The current demo account records did not expose a usable provider ID.
- A2P Brand Registration is now registered with TCR, but live SMS/inbox proof still needs a real sending test.

Create example conversations manually or after a provider is configured:

- Ava: `Hi Sarah, I scanned your QR at the show and wanted to ask about Nova.`
- Marcus: `Can you hold Pepper until the Phoenix heat wave clears?`
- Jenna: `I'm new to crested geckos. Would Mango be a good beginner animal?`
- Noah: `I saw Mango at the expo. Can I pick up at the next show?`
- Priya: `Echo is paid. Please send the setup checklist before shipping.`
- Drew: `Drew arrived healthy. I can send a review and a photo update.`

## 7. Social Planner Proof

Why manual or account-dependent:

- HighLevel has Social Planner APIs, but post creation requires connected social account IDs and a valid creator/approver user.
- Staff update: Brianna Yetigex (`brianna@hatchkitai.com`) has been added to the SunScale demo account as `ACCOUNT-ADMIN` and can be used for staff/approval-style demo steps after confirming the exact user ID in HighLevel.
- `data/breeders/sunscale-geckos/client.json` currently has `instagramPageId` and `facebookPageId` set to `null`.

Next choice:

- Connect demo social accounts in HighLevel, then add API support for draft/in-review posts.
- Or create a manual in-review queue inside HighLevel using Brianna as the staff/partner proof point and the social content copy in the export packet.

## 8. A2P / SMS Compliance

Current status:

- Local HighLevel number was purchased.
- A2P/SMS compliance application was submitted.
- A2P Brand Registration is registered with TCR.
- Confirmation email was received from LeadConnector on 2026-06-05.
- A2P Campaign Registration update was received from LeadConnector on 2026-06-05: campaign has been submitted for review.
- Campaign approval is still pending before treating live SMS as ready.
- Campaign/number sending should still be verified inside HighLevel with a real opted-in SMS test after approval.

Plain-language status:

- Brand approval means the business identity passed carrier/TCR registration.
- Campaign approval means the actual texting use case and message flow are approved.
- The demo has brand approval and a campaign submitted for review; it does not yet have confirmed campaign approval.

Already added to support resubmission:

- Live website: `https://demo.hatchkitai.com/store`
- Privacy Policy: `https://demo.hatchkitai.com/privacy`
- Terms of Service: `https://demo.hatchkitai.com/terms`
- Visible business contact footer
- HighLevel chat widget on Storefront
- No separate phone-number form on the Storefront page outside the chat widget

Next action:

1. Confirm the A2P campaign status changes from submitted/in review to approved.
2. Confirm the phone number shows usable for SMS inside HighLevel.
3. Run a real opted-in SMS test with the demo number after campaign approval.
4. Check workflow execution logs for any SMS failures.
5. If a campaign/number-level issue appears, capture the exact status/error before changing the site or registration.

## Completion Check

Current completion check:

1. Run `node scripts\audit-demo-showroom-live.js`.
2. Confirm audit is `17/17`.
3. Verified on 2026-06-07: fresh non-SMS site/webhook/CRM path passed with `hatchkit.demo.liveqa.20260607050914@example.com`.
4. Verified on 2026-06-07: published Mango `Reserve Mango` browser click redirects to `/reserve` with no on-page error and no console errors.
5. Confirm the contact appears in the right smart lists in the HighLevel UI.
6. Confirm workflow execution logs in the HighLevel UI.
7. Confirm care, review/referral, and VIP workflow steps fire on accelerated timing.
8. Repeat live SMS delivery checks with a real opted-in test number after A2P campaign approval.
