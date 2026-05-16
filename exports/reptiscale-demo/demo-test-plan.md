# Reptiscale Demo Test Plan

Run this before showing the demo to a prospect.

## Local Checks

```powershell
npm test
npm run simulate:shipping-review
npm run export:demo
npm run verify:demo
```

## Server Checks

1. Start or deploy the server.
2. Confirm `GET /health` returns `status: ok`.
3. Confirm `GET /api/machine` returns the Reptiscale machine.
4. Open `/demo`.
5. Run `webhook-smoke-test.ps1` against the base URL.

The smoke test posts demo buyer events. Use demo contact details only.

## HighLevel Checks

- Demo contact exists or can be created.
- Custom fields are visible on the contact record.
- Operator-review tags exist.
- Manual pipelines exist.
- Smart lists exist:
  - New Crested Gecko Leads
  - Hot Animal Buyers
  - Shipping Holds
  - Operator Review Queue
  - Ready For Label Approval
  - Review / Referral Candidates
  - Repeat Buyer VIP
- Workflow webhook actions point to the correct `BASE_URL`.
- Order/payment workflow includes shipping address fields.
- All customer-journey workflows have executed successfully in HighLevel:
  - `Reptiscale - Lead Magnet Delivery`
  - `Reptiscale - Offer Clicked`
  - `Reptiscale - Order Submitted`
  - `Reptiscale - Review Submitted`
  - `Reptiscale - Referral Submitted`
  - `Reptiscale - Shipping Hold Operator Alert`
  - `Reptiscale - Ready For Label Approval`
  - `Reptiscale - Post-Purchase Care Onboarding`
  - `Reptiscale - Review And Referral Request`
  - `Reptiscale - Daily Shipping Weather Re-Check`
- Workflow settings are configured:
  - Re-entry enabled where repeat events should be allowed.
  - Stop on response enabled for nurture/care/review workflows and disabled for safety/operator workflows.
  - Shipping/weather workflows are not blocked by a customer-message time window.

## Sales Demo Path

1. Open storefront.
2. Submit starter guide form.
3. Show CRM contact fields and tags.
4. Open animal detail page.
5. Show reservation offer.
6. Trigger order submitted.
7. Show order-to-shipping operator review.
8. Show care onboarding templates.
9. Show review/referral and VIP repeat-buyer flow.
10. Show the HighLevel smart lists as the breeder's daily operating dashboard.

## Final Rehearsal

1. Start on `https://reptiscale-demo.vercel.app/demo`.
2. In HighLevel, open the demo contact created by the latest smoke test.
3. Confirm the contact has current tags and fields for lead, offer, purchase, and shipping.
4. Open the Shipping Holds smart list and show the real weather HOLD decision.
5. Open the Operator Review Queue and explain the human label-approval checkpoint.
6. Open the Ready For Label Approval smart list if a manually approved/fixture contact exists.
7. Open the care onboarding workflow and review/referral workflow to show the post-sale follow-up.
8. End on the repeat-buyer/VIP list and explain how the breeder gets future sales from the same buyer base.

## Pass Criteria

- Lead is captured.
- Interest and animal preference are stored.
- Purchase stage is updated.
- Shipping decision is produced.
- Operator review returns a clear disposition.
- Care/review/referral follow-up is explainable in HighLevel.
- Smart lists make the breeder's next action obvious.
