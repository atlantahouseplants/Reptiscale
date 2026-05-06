# Reptiscale Demo HighLevel Buildout

Client: SunScale Geckos
Location ID: fqj4rbp2VRkvMa8GWVWn

## Demo Positioning

Reptiscale turns a reptile seller into a complete online business: store, CRM, content, checkout, safe shipping, care follow-up, reviews, referrals, and repeat buyers.

Primary buyer: Mid-tier reptile breeders and exotic animal sellers who sell through shows, social media, MorphMarket, and direct messages.

Core promise: Every buyer gets captured, followed up with, sold to, shipped safely, educated, and invited back.

## Build In HighLevel

1. Website and funnel pages
- Storefront: templates/pages/reptiscale-storefront.html
- Lead magnet: templates/pages/crested-gecko-starter-guide.html
- Animal detail: templates/pages/animal-detail.html
- Reservation offer: templates/pages/reservation-offer.html

2. Products and payments
- Animal Reservation Deposit: $75
- Crested Gecko Care Starter Kit: $49
- 30-Minute Setup Review: $35
- Crested Gecko Starter Guide: free

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

6. Manual blocker
The HighLevel token may not be able to create opportunities in this account. If opportunity creation fails, manually add the demo opportunities to the pipelines above using demo-script.md as the guide.

7. Useful companion files
- deployment-runbook.md
- highlevel-workflow-checklist.md
- demo-test-plan.md
- webhook-smoke-test.ps1

## Webhook Mapping

- Lead magnet forms -> POST /webhooks/ghl/lead-magnet
- Animal page view or CTA click -> POST /webhooks/ghl/offer-clicked
- Order form/payment confirmation -> POST /webhooks/ghl/order-submitted
- Review form -> POST /webhooks/ghl/review-submitted
- Referral form -> POST /webhooks/ghl/referral
- Shipping check action -> POST /webhooks/shipping/evaluate
- Pre-label operator review -> POST /webhooks/shipping/operator-gate
- Order-to-shipping review -> POST /webhooks/shipping/order-review
