# SunScale HighLevel Demo Account Build Status

Last updated: 2026-06-08

HighLevel account:

- Name: `SunScale Geckos - Demo`
- Location ID: `oCn199rzTjj0rPgqXyXU`
- Webhook base URL: `https://reptiscale-demo.vercel.app`

## API-Built And Verified

Run:

```powershell
npm run setup:showroom
npm run audit:showroom
```

This sequential setup command has completed successfully and is idempotent.

The live audit command writes:

- `docs/demo-showroom/live-showroom-audit.json`
- `docs/demo-showroom/live-showroom-audit.md`

Current live audit result:

- 17 of 17 checks pass
- HighLevel workflow count is now `12`.

Built through the HighLevel API:

- current business profile read and desired SunScale profile values recorded locally
- HighLevel store shipping origin synced to the SunScale demo origin
- demo-only HighLevel shipping zone and review-only shipping rate
- 17 custom contact fields
- required structured tags
- 7 buyer demo contacts
- 1 demo operator contact
- 3 pipelines
- 12 demo opportunities
- 10 custom values
- 8 products with prices and store images
- 6 product collections
- 6 trigger links
- 8 pinned contact notes
- 8 contact follow-up tasks
- public SunScale helper pages deployed on Vercel
- public helper-page forms wired to live Reptiscale webhooks
- real QR SVG generated for `https://reptiscale-demo.vercel.app/demo/show-qr`
- smart-list support tags
- HighLevel funnel published at `https://demo.hatchkitai.com`
- HighLevel page URL custom values updated to the published funnel URLs
- HighLevel trigger links updated to the published funnel URLs
- deployed Reptiscale webhook backend allows CORS from `https://demo.hatchkitai.com`
- published funnel forms are custom HTML/code forms that post to the Reptiscale webhook backend
- Store-first decision made on 2026-06-08: the current funnel is campaign/showroom proof, not the final customer storefront pattern.
- `SunScale Geckos Store` was created in HighLevel Store Builder on 2026-06-08.
- `npm run audit:store-readiness` reports `overallStatus=store_shell_created_visual_builder_required`: products, prices, images, online-store visibility, collections, shipping origin, and store shell tracking pass.
- A2P compliance pages and chat widget were added to the published HighLevel site

## HighLevel Store Preview

- Store name: `SunScale Geckos Store`
- Builder ID: `c6oIcQOaIihVIc23qseX`
- Preview URL: `https://sites.leadconnectorhq.com/preview/c6oIcQOaIihVIc23qseX`
- Current status: created but not final-published.
- Preview confirms 8 products render with images.
- Remaining visual work: replace generic `My Store` / `Our Products` copy, replace default hero image, confirm product detail/cart/checkout/thank-you pages, add demo-safe checkout copy, and publish.

## Public Helper Pages

Deployed on the Vercel backend:

- `https://reptiscale-demo.vercel.app/demo/store`
- `https://reptiscale-demo.vercel.app/demo/guide`
- `https://reptiscale-demo.vercel.app/demo/animal/mango`
- `https://reptiscale-demo.vercel.app/demo/reserve`
- `https://reptiscale-demo.vercel.app/demo/review`
- `https://reptiscale-demo.vercel.app/demo/vip`
- `https://reptiscale-demo.vercel.app/demo/show-qr`
- `https://reptiscale-demo.vercel.app/demo/operator`

These remain available as fallback helper pages. The current primary sales showroom is the published HighLevel funnel on `https://demo.hatchkitai.com`, but the product-correct showroom surface should be the created HighLevel Store/Website once the final Store Builder pass is complete.

Verified after production deployment:

- public route checks returned `200` for the helper pages and SVG assets
- helper-page forms are wired to their intended webhooks
- live starter-guide lead webhook accepted a demo-safe lead payload
- live reservation simulation webhook accepted a demo-safe deposit payload and returned review-only shipping output
- desktop screenshot checked for `/demo/store`
- mobile screenshot checked for `/demo/show-qr`

## Published HighLevel Funnel

Published at:

- `https://demo.hatchkitai.com/store`
- `https://demo.hatchkitai.com/guide`
- `https://demo.hatchkitai.com/mango`
- `https://demo.hatchkitai.com/reserve`
- `https://demo.hatchkitai.com/thank-you`
- `https://demo.hatchkitai.com/review`
- `https://demo.hatchkitai.com/vip`
- `https://demo.hatchkitai.com/show-qr`
- `https://demo.hatchkitai.com/privacy`
- `https://demo.hatchkitai.com/terms`

Verified:

- all ten published paths return `200`
- page content is present on all ten paths
- webhook CORS preflight succeeds from `https://demo.hatchkitai.com`
- demo-safe lead webhook accepts a HighLevel-page-origin request
- on 2026-06-06, Vercel production env values were corrected so webhook contact creation uses the SunScale location ID `oCn199rzTjj0rPgqXyXU`
- a controlled live Starter Guide webhook test created a SunScale contact with the expected lead tags; after one minute, `journey:nurture` was added
- on 2026-06-07, the Reptiscale webhook backend was patched and redeployed so the Mango detail `Reserve Mango` click no longer fails when a visitor has not submitted the Starter Guide first
- on 2026-06-07, a browser test confirmed the published Mango `Reserve Mango` click redirects to `https://demo.hatchkitai.com/reserve` with no on-page error and no console errors; screenshot proof: `docs/demo-showroom/mango-reserve-click-pass-20260607.png`
- on 2026-06-07, the public Starter Guide webhook path was protected from bad HighLevel UI lead-drip copy by using `journey:lead-captured-webhook` plus a direct webhook-sent guide email
- on 2026-06-07, the HighLevel `DEMO - Reptiscale - Starter Guide Lead Capture` and `Lead Education Drip` email bodies were corrected and published; `node scripts\audit-highlevel-automation-messages.js --wait=90 --fail-on-mismatch` reports `overallStatus=pass` and `mismatchCount=0`
- on 2026-06-07, a fresh non-SMS live demo path verified all public demo pages, Starter Guide lead capture, Mango interest, reservation simulation, shipping review, review capture, tags, fields, and opportunities against one real HighLevel test contact
- workflow settings still need to be confirmed in the HighLevel UI:
  - run 24/7
  - remove Monday-Friday/business-hours restrictions
  - leave mark-emails-as-read off
  - use tag-added triggers for custom-code form paths where needed
- the Storefront page includes the HighLevel chat widget script
- the Storefront page includes public business contact details and Privacy/Terms links
- the Storefront page no longer has a separate phone field outside the chat widget

## Business Profile

Current live profile read from HighLevel:

- Account name: `SunScale Geckos - Demo`
- Email: `demo@hatchkitai.com`
- Phone: `+19843001621`
- Address: `3645 Essex Ave`, `Atlanta`, `GA`, `30339`
- Timezone: `America/New_York`
- Website: `https://demo.hatchkitai.com/store`

Current compliance position:

- The demo stays visibly branded as `SunScale Geckos - Demo` for the sales story.
- A2P/business verification should use real owner/business information, not fake SunScale identity data.
- The published site footer, Privacy Policy, and Terms pages use the real business contact details supplied for compliance:
  - `Geoffrey Wall`
  - `3645 Essex Ave`, `Atlanta`, `GA`, `30339`
  - `+19843001621`
  - `demo@hatchkitai.com`

The local audit now checks that the HighLevel business profile is A2P-compliant for the demo rather than forcing the old fake Raleigh/SunScale placeholder address.

## Store Settings

Created by:

```powershell
npm run sync:store-settings
```

Current HighLevel store shipping origin:

- Name: `SunScale Geckos - Demo`
- Email: `sarah@sunscalegeckos.com`
- Phone: `+19843001621`
- Address: `123 Breeder Lane`, `Raleigh`, `NC`, `27601`

This is a demo-safe shipping origin for storefront/order-form display and shipping review context. It does not create a carrier account, payment provider, or live shipping label.

## Shipping Zone

Created by:

```powershell
npm run sync:shipping-zone
```

Current HighLevel store shipping setup:

- Shipping zone: `SunScale Demo - Shipping Review Only`
- Country: `US`
- Shipping rate: `Shipping quoted after weather review`
- Amount: `$0`
- Carrier rate: `false`

This is intentionally review-only. It gives the demo store/order-form path a safe shipping option without connecting a carrier account or creating a live shipping label.

## Products

Offer products:

- `Animal Reservation Deposit` - `$75`
- `Crested Gecko Care Starter Kit` - `$49`
- `30-Minute Setup Review` - `$35`
- `Crested Gecko Starter Guide` - `$0`

Animal inventory products:

- `Nova - Lilly White` - `$1,200`
- `Mango - Harlequin Dalmatian` - `$225`
- `Echo - Tricolor Pinstripe` - `$650`
- `Pepper - Super Dalmatian` - `$475`

## Trigger Links

Created:

- `SunScale Demo - Starter Guide`
- `SunScale Demo - Mango Detail`
- `SunScale Demo - Reserve Mango`
- `SunScale Demo - Review Referral`
- `SunScale Demo - VIP List`
- `SunScale Demo - Expo QR Signup`

Current redirects:

- `SunScale Demo - Starter Guide`: `https://demo.hatchkitai.com/guide`
- `SunScale Demo - Mango Detail`: `https://demo.hatchkitai.com/mango`
- `SunScale Demo - Reserve Mango`: `https://demo.hatchkitai.com/reserve`
- `SunScale Demo - Review Referral`: `https://demo.hatchkitai.com/review`
- `SunScale Demo - VIP List`: `https://demo.hatchkitai.com/vip`
- `SunScale Demo - Expo QR Signup`: `https://demo.hatchkitai.com/show-qr`

## Contact Activity

Created by:

```powershell
npm run sync:contact-activity
```

Seeded for each buyer/operator demo contact:

- one pinned internal note summarizing the buyer journey proof
- one open operator follow-up task for the breeder/admin demo

This supports the breeder-side CRM story without sending real email/SMS messages.

Full-path CRM proof contact:

- Taylor Brooks / `hatchkit.demo.taylor@example.com`
- shows the end-to-end Mango path across fields, tags, lead pipeline, sales pipeline, shipping pipeline, note, and task
- live verification found Taylor with 24 tags, 3 pipeline opportunities, 1 marked note, and 1 marked task
- no real payment or live shipping label is created

## Custom Values

Created:

- `webhook_base_url`
- `demo_location_id`
- `storefront_url`
- `starter_guide_url`
- `mango_detail_url`
- `reservation_url`
- `review_url`
- `referral_url`
- `vip_url`
- `show_qr_url`

The page URL custom values now point to the published HighLevel funnel URLs on `https://demo.hatchkitai.com`.

## Completed Manual HighLevel Build

- Business profile settings are A2P-compliant for the demo and verified at 8/8 expected audit fields.
- Smart lists were created in the HighLevel Contacts UI:
  - `New Crested Gecko Leads`
  - `Hot Animal Buyers`
  - `Shipping Holds`
  - `Operator Review Queue`
  - `Ready For Label Approval`
  - `Review / Referral Candidates`
  - `Repeat Buyer VIP`
  - `Demo Contacts`
- HighLevel campaign funnel pages were created and published.
- HighLevel Store pages still need to be built in `Sites -> Stores`.
- Privacy Policy and Terms of Service pages were created and published.
- Compliance footer and chat widget were added to the Storefront page.
- A2P Brand Registration for this location is registered with TCR as of the LeadConnector update received on 2026-06-05.
- A2P Campaign Registration update from LeadConnector on 2026-06-05 says the campaign has been submitted for review.
- Starter Guide form submissions are custom-code webhook submissions, not native HighLevel form submissions.
- Payment simulation was embedded in the `Mango Reservation` funnel step without real charges or live labels.
- First accelerated workflow was created and published:
  - `DEMO - Reptiscale - Starter Guide Lead Capture`
- Second accelerated workflow was created and published:
  - `DEMO - Reptiscale - Lead Education Drip`
- Third accelerated workflow was created and published:
  - `DEMO - Reptiscale - Animal Interest - Mango`
- Fourth accelerated workflow was created and published:
  - `DEMO - Reptiscale - Reservation Abandonment`
- Fifth accelerated workflow was created and published:
  - `DEMO - Reptiscale - Deposit Paid`
- Sixth accelerated workflow was created and published:
  - `DEMO - Reptiscale - Order Shipping Review`
- Seventh accelerated workflow was created and published:
  - `DEMO - Reptiscale - Simulated Shipped`
- Eighth accelerated workflow was created and published:
  - `DEMO - Reptiscale - Simulated Delivered And LAG`
- Ninth accelerated workflow was created and published:
  - `DEMO - Reptiscale - Care Onboarding`
- Tenth accelerated workflow was created and published:
  - `DEMO - Reptiscale - Review And Referral`
- Eleventh accelerated workflow was created and published:
  - `DEMO - Reptiscale - Repeat Buyer VIP`
- Twelfth accelerated workflow was created and published:
  - `DEMO - Reptiscale - Social Content Approval`

## Remaining Work

Canonical queue:

- `docs/demo-showroom/manual-highlevel-build-queue.md`

The core demo build is complete enough to test. The remaining items are provider/compliance dependent or final QA.

Remaining:

1. SMS sending verification:
   - confirm the A2P campaign is approved in HighLevel
   - confirm the phone number is fully usable in HighLevel
   - retest real SMS delivery with an opted-in test number after campaign approval
   - check workflow execution logs for any messaging errors
2. Full published demo test path:
   - non-SMS site/webhook/CRM path passed with fresh contact `hatchkit.demo.liveqa.20260607050914@example.com` on 2026-06-07
   - still confirm workflow execution logs in the HighLevel UI
   - document SMS separately after A2P campaign approval
3. Workflow settings sweep:
   - make the `DEMO - Reptiscale - ...` workflows run 24/7
   - confirm re-entry settings match `docs/demo-showroom/accelerated-workflow-recipes.md`
   - confirm Starter Guide and other custom-code form paths trigger from tags, not only native HighLevel form submissions
   - keep email/SMS bodies aligned with `docs/demo-showroom/automation-message-audit-and-corrections.md`
   - use `docs/demo-showroom/highlevel-workflow-ui-correction-worksheet.md` if copy drifts again
   - ensure referral leads use `journey:referral-captured` and do not enter the generic `journey:lead-captured` drip
   - live message audit on 2026-06-07 verified the referral path no longer sends the generic drip
   - live message audit on 2026-06-07 verified the public Starter Guide webhook path sends the correct guide message and avoids the generic `journey:lead-captured` drip
   - live message audit on 2026-06-07 reports `overallStatus=pass` and `mismatchCount=0`; the manually triggered `journey:lead-captured` path no longer says `Mango platform`, no longer uses generic `fascinating creatures` wording, and no longer claims an attachment
4. Inbox/conversation demo messages:
   - create manually in the HighLevel UI or through a configured conversation provider after messaging is approved
   - the public inbound-message endpoint requires a `conversationProviderId`; the current demo conversation records do not expose one
5. Social Planner proof:
   - connect social accounts first, then create manual or API-backed draft/in-review posts
   - `instagramPageId` and `facebookPageId` are currently `null` in the SunScale client config
   - Brianna Yetigex (`brianna@hatchkitai.com`) has been added as `ACCOUNT-ADMIN` staff and can be used for staff/approval-style demo proof after confirming her exact HighLevel user ID

API note:

- HighLevel Store, Products, Contacts, Opportunities, Custom Values, Trigger Links, Notes/Tasks, and store shipping APIs were usable with the current setup.
- HighLevel Forms/Funnels/Workflows required visual-builder work and have now been built manually for the demo.
- Social Planner has APIs, but post creation still depends on connected account IDs; a staff/admin user now exists for approval-style proof.

## Verification Commands

Run locally:

```powershell
npm run setup:showroom
npm run audit:showroom
npm run verify:demo
npm test
```

UI verification in HighLevel:

1. Open Contacts and confirm the eight `hatchkit.demo.*` contacts exist.
   - Buyer contacts: Ava, Marcus, Jenna, Noah, Priya, Drew, Taylor.
   - Operator contact: Sarah Mitchell / `hatchkit.demo.operator@example.com`.
2. Confirm opportunities appear in the three HatchKit pipelines.
3. Confirm the eight products and prices exist in Payments/Products.
4. Confirm the six trigger links exist.
5. Confirm the buyer/operator demo contacts have pinned notes and open follow-up tasks.
6. Confirm the smart lists show expected demo contacts.
7. Build and verify the published Store pages, then verify campaign funnel pages and embedded form/webhook behavior.
   - Because the embedded forms are custom code, workflows should key off tags such as `journey:lead-captured-webhook`, `journey:referral-captured`, `journey:offer-presented`, and `journey:purchased`, not only native HighLevel `Form Submitted` triggers.
   - The HighLevel UI lead-capture body is corrected as of 2026-06-07; rerun the message audit after any future workflow copy edit.
8. Run the full test path from the sales demo script.
9. Check workflow execution logs for any failed email/SMS actions.
10. Repeat the SMS portions with a real opted-in test number.
