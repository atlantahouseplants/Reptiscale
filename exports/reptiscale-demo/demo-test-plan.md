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
- Workflow webhook actions point to the correct `BASE_URL`.
- Order/payment workflow includes shipping address fields.

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

## Pass Criteria

- Lead is captured.
- Interest and animal preference are stored.
- Purchase stage is updated.
- Shipping decision is produced.
- Operator review returns a clear disposition.
- Care/review/referral follow-up is explainable in HighLevel.
