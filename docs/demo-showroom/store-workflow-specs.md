# SunScale Store-Triggered Workflow Specs

Last updated: 2026-06-08

Purpose: the 7 store/ecommerce workflows to add in `SunScale Geckos - Demo` once the
HighLevel Store is published. These complement the 12 existing buyer-journey workflows
and use Ecommerce/Payments triggers so the store drives automation directly.

## Global Rules

- Account: `SunScale Geckos - Demo` (`oCn199rzTjj0rPgqXyXU`).
- Timezone: `America/New_York`.
- Execution window: 24/7 (no business-hours restriction for the demo).
- "Mark emails as read": OFF.
- **SMS is gated** until A2P campaign approval + an opted-in test pass. Build SMS steps
  but leave them OFF/disabled until then. Email steps can run now.
- Webhook backend for shipping logic: `https://reptiscale-demo.vercel.app`.
- Never create a live shipping label or a real charge during a demo.

## Trigger Priority Reference

1. Ecommerce Store `Abandoned Checkout`
2. Payments `Order Submitted` (filter order source = `Store`)
3. Ecommerce Store `Order Fulfilled`
4. Contact/tag triggers only where a store event cannot cover the path

---

## 1. HK Demo - Store Abandoned Checkout

- **Trigger:** Ecommerce Store -> Abandoned Checkout.
- **Goal:** recover a buyer who started but did not finish checkout.
- **Actions:**
  1. Add tag `store:abandoned-checkout`.
  2. Wait 1 hour.
  3. Email — subject `Still thinking about your gecko?` — body: gentle nudge, restate the deposit-holds-the-animal point, link back to the cart/store.
  4. Wait 1 day. If/else: contact does NOT have tag `store:order-submitted` -> second email `Your pick is still available`.
  5. (SMS, gated) text: `Hi {{contact.first_name}}, your reservation is still open at SunScale. Want me to hold it? — Sarah`.
- **Exit:** when tag `store:order-submitted` is added.

## 2. HK Demo - Store Order Submitted

- **Trigger:** Payments -> Order Submitted, filter order source = `Store`.
- **Goal:** confirm the order and branch deposit vs. full purchase.
- **Actions:**
  1. Add tag `store:order-submitted`; remove `store:abandoned-checkout`.
  2. Webhook (POST) -> `https://reptiscale-demo.vercel.app/webhooks/ghl/order-submitted` with contactId, productName, amount, purchaseStatus.
  3. If/else on product:
     - `Animal Reservation Deposit` -> go to workflow **Store Deposit Paid**.
     - Animal full price (`Nova`/`Pepper`/`Mango`) -> set `purchaseStatus = Purchased`, go to **Store Shipping Review**.
     - `Care Starter Kit` / `Setup Review` -> add tag `purchase:supplies`, send fulfillment email.
  4. Email — order confirmation with next steps (no label created yet).
- **Exit:** end after branch handoff.

## 3. HK Demo - Store Deposit Paid

- **Trigger:** inbound from workflow #2, or tag `purchase:deposit-paid`.
- **Goal:** hold the animal and set expectations.
- **Actions:**
  1. Set opportunity stage -> `Deposit Paid` in the sales pipeline.
  2. Add tags `purchase:deposit-paid`, `animal:held`.
  3. Email — `Your gecko is on hold` — explain deposit applies to final price, Sarah confirms shipping/pickup, weather review happens before shipping.
  4. Create task for Sarah: `Confirm pickup or shipping window for {{contact.first_name}}`.
  5. Hand off to **Store Shipping Review** when ready to ship.

## 4. HK Demo - Store Shipping Review

- **Trigger:** inbound from #2/#3, or tag `shipping:review-requested`.
- **Goal:** run the safe-shipping decision (the AI differentiator) before any label.
- **Actions:**
  1. Add tag `shipping:pending-weather-check`.
  2. Webhook (POST) -> `https://reptiscale-demo.vercel.app/webhooks/shipping/order-review` (normalizes the order into the operator shipping review; the shipping agent checks weather at origin/destination/hubs).
  3. Wait for operator decision (manual gate — no auto label).
  4. If/else on decision:
     - Ship-safe -> email `Good news — safe to ship` + Sarah arranges pickup/label manually.
     - Hold-for-weather -> email `We are holding for safer weather` with the reason and next check date; keep tag `shipping:pending-weather-check`.
  5. (SMS, gated) status text mirroring the email decision.
- **Note:** the daily `POST /webhooks/shipping/weather-check` re-checks all contacts tagged `shipping:pending-weather-check`.

## 5. HK Demo - Store Order Fulfilled

- **Trigger:** Ecommerce Store -> Order Fulfilled (or tag `shipping:shipped`).
- **Goal:** delivery follow-through.
- **Actions:**
  1. Set opportunity stage -> `Shipped` / `Delivered` as appropriate.
  2. Email — `Your gecko is on the way` (or delivered) with tracking placeholder and arrival-day care reminders.
  3. Wait until delivered -> hand off to **Post-Purchase Care Onboarding**.
  4. (SMS, gated) delivery-day check-in.

## 6. HK Demo - Post-Purchase Care Onboarding

- **Trigger:** inbound from #5, or tag `journey:care-onboarding`.
- **Goal:** make the buyer successful and set up the review/referral ask.
- **Actions:**
  1. Day 0 email — `Welcome home, {{contact.first_name}}` — first 48-hour care (leave the gecko alone, humidity, first feeding).
  2. Day 3 email — feeding/handling check-in + link to Setup Review upsell ($35).
  3. Day 10 email — `How is it going?` settle-in check; branch to **Review Referral VIP**.
  4. Add tag `journey:care-onboarding-complete` at end.

## 7. HK Demo - Review Referral VIP

- **Trigger:** inbound from #6, or tag `journey:advocacy`.
- **Goal:** turn a happy buyer into a review, a referral, and a repeat buyer.
- **Actions:**
  1. Email — `How did your gecko settle in?` with review link.
  2. If review submitted (tag `review:submitted`) -> thank-you email + referral ask with referral link.
  3. Email — VIP invite: first look at future clutches; add tag `waitlist:active` on opt-in.
  4. Add tag `journey:repeat-buyer`.
- **Isolation note:** referred friends should enter via `journey:referral-captured`, NOT the generic `journey:lead-captured` drip (see `automation-message-audit-and-corrections.md`).

---

## Build + Verify

1. Build workflows 1-7 in `Automation -> Workflows`.
2. Leave all SMS actions OFF until A2P approval + opted-in test.
3. Re-entry: ON for Abandoned Checkout, Order Submitted, Shipping Review, Care
   Onboarding, Review Referral VIP. Use judgment for Deposit Paid / Order Fulfilled.
4. After building, run `npm run audit:messages` to confirm message copy is clean and
   `overallStatus=pass` with no mismatch flags.
5. Do one full store test buy and confirm enrollment in the execution logs.
