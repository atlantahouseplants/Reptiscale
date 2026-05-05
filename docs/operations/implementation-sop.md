# Implementation SOP

Use this every time a new Reptiscale customer is sold.

## 1. Create Customer Folder

Create:

- `data/breeders/{clientId}/client.json`
- `data/breeders/{clientId}/ghl-config.json`
- branded email templates
- branded SMS templates

Use `scripts/onboard-breeder.js` where possible.

## 2. HighLevel Setup

Create or confirm:

- Sub-account
- Private integration token
- Sending phone number
- Email sender/domain
- Payment processor
- Calendar if pickup or consult booking is included

Run:

```powershell
npm.cmd run setup:demo
```

For real customers, run the onboarding script with their config instead of the demo setup script.

## 3. Core Assets

Build:

- Storefront
- Starter guide/lead magnet
- Animal detail page
- Reservation offer page
- Review/referral form
- VIP availability list form

## 4. Core Workflows

Build in this order:

1. New lead capture
2. New lead education drip
3. Offer clicked/reservation follow-up
4. Purchase confirmation
5. Shipping evaluation
6. Care onboarding
7. Review/referral request
8. Availability alerts
9. Social content approval

## 5. QA

Use `docs/operations/launch-qa-checklist.md`.

Do not launch workflows until at least one full test has passed from lead capture to post-purchase follow-up.

## 6. Customer Training

Teach only what they need:

- Inbox
- Pipeline
- Contact fields
- Animal updates
- Social approval
- Pausing workflows

Avoid technical details unless asked.

## 7. First 30 Days

Week 1:

- confirm lead capture works
- fix broken copy or fields
- watch every workflow trigger

Week 2:

- review first leads and buyer responses
- tune nurture and offer follow-up

Week 3:

- launch availability or social campaign
- ask for feedback

Week 4:

- run first monthly review
- ask for testimonial/referral if healthy
