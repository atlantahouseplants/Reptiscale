# Reptiscale Demo HighLevel Buildout

Client: SunScale Geckos
Location ID: oCn199rzTjj0rPgqXyXU

## Demo Positioning

Reptiscale turns a reptile seller into a complete online business: store, CRM, content, checkout, safe shipping, care follow-up, reviews, referrals, and repeat buyers.

Primary buyer: Mid-tier reptile breeders and exotic animal sellers who sell through shows, social media, MorphMarket, and direct messages.

Core promise: Every buyer gets captured, followed up with, sold to, shipped safely, educated, and invited back.

## Build In HighLevel

1. Website and funnel pages
- Storefront: templates/pages/sunscale-demo/storefront.html
- Lead magnet: templates/pages/sunscale-demo/starter-guide.html
- Animal detail: templates/pages/sunscale-demo/mango-detail.html
- Reservation offer: templates/pages/sunscale-demo/reservation.html
- Order thank-you: templates/pages/sunscale-demo/thank-you.html
- Review/referral: templates/pages/sunscale-demo/review-referral.html
- VIP list: templates/pages/sunscale-demo/vip.html
- Show QR signup: templates/pages/sunscale-demo/show-qr.html

2. Products and payments
- Animal Reservation Deposit: $75
- Crested Gecko Care Starter Kit: $49
- 30-Minute Setup Review: $35
- Crested Gecko Starter Guide: free
- Shipping option: SunScale Demo - Shipping Review Only / Shipping quoted after weather review / $0 / not a carrier rate

3. Pipelines to create or verify
- HatchKit - Lead Pipeline: New Lead, Contacted, Interested, Qualified, Customer, Lost
- HatchKit - Sales Pipeline: Animal Selected, Invoice Sent, Payment Received, Shipping Scheduled, Shipped, Delivered, Follow-Up Complete
- HatchKit - Shipping Pipeline: Pending Review, Weather Check, Approved to Ship, Label Created, Dropped Off, In Transit, Delivered, LAG Confirmed, Complete

4. Workflows
- New Lead Education Drip: Tag added: journey:lead-captured
- Reservation Abandonment: Form started or offer clicked without purchase
- Post-Purchase Care Onboarding: Tag added: journey:purchased
- Review and Referral Request: Tag added: shipping:lag-confirmed
- Availability and Social Content Engine: Daily scheduled content run

5. Smart lists
- New crested gecko leads: tag interest:crested-gecko and status:new-lead
- Hot animal buyers: tag journey:offer-presented or status:hot-lead
- Shipping holds: tag shipping:hold or shipping:pending-weather-check
- Operator review queue: tag shipping:operator-review and not shipping:ready-for-operator-approval
- Ready for label approval: tag shipping:ready-for-operator-approval
- Review and referral candidates: tag journey:advocacy or review:received
- Repeat buyer VIP: tag journey:repeat-buyer or status:repeat-buyer
- Demo contacts: email contains hatchkit.demo or tag role:demo-operator

6. API-supported setup
Run this from the project root after the location ID and private integration key are configured:

```powershell
npm run setup:showroom
npm run audit:showroom
```

The setup command creates or refreshes custom fields, tags, pipelines, demo contacts, demo opportunities, custom values, products/prices, trigger links, store shipping origin, demo shipping zone/rate, and contact notes/tasks.

7. Remaining manual builder work
- Business profile settings if the token lacks location write scope.
- HighLevel visual pages/funnels and final page URL custom values.
- HighLevel smart lists.
- Payment link or order form layout using the $75 deposit product and review-only shipping option.
- Accelerated visual workflows.
- Inbox/conversation examples if no conversation provider is configured.

8. Useful companion files
- deployment-runbook.md
- vercel-env-checklist.md
- highlevel-workflow-checklist.md
- highlevel-ai-workflow-prompts.md
- demo-test-plan.md
- vercel-deploy.ps1
- webhook-smoke-test.ps1

9. Local demo console
- Open {BASE_URL}/demo after the server is running.

## Webhook Mapping

- Lead magnet forms -> POST /webhooks/ghl/lead-magnet
- Animal page view or CTA click -> POST /webhooks/ghl/offer-clicked
- Order form/payment confirmation -> POST /webhooks/ghl/order-submitted
- Review form -> POST /webhooks/ghl/review-submitted
- Referral form -> POST /webhooks/ghl/referral
- Shipping check action -> POST /webhooks/shipping/evaluate
- Pre-label operator review -> POST /webhooks/shipping/operator-gate
- Order-to-shipping review -> POST /webhooks/shipping/order-review
