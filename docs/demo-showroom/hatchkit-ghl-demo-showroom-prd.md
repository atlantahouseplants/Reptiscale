# HatchKit GHL Demo Showroom PRD

Last updated: 2026-06-08

## Purpose

Build a prospect-facing Hatchkit demo that shows a reptile breeder exactly what they receive when they sign up:

- a branded HighLevel subaccount
- a HighLevel Store/Website plus campaign funnels
- a unified CRM, inbox, tags, fields, smart lists, and pipelines
- automated email/SMS follow-up
- abandoned reservation and purchase follow-up
- live-animal shipping review and human approval gate
- care onboarding
- review, referral, and repeat-buyer campaigns
- social content planning and approval workflow

The demo must feel like a working crested gecko breeder business, not a technical dashboard.

## Product Decision

The near-term product is a done-for-you GoHighLevel agency/SaaS system for reptile breeders.

Hatchkit is not currently a standalone SaaS app that replaces HighLevel. The custom app ideas in the older PRD are future product direction. The sellable version now is a reusable HighLevel snapshot plus Hatchkit-owned webhook/automation support.

## Demo Accounts

### 1. Master Snapshot Account

Purpose: clean reusable template for future customers.

Rules:

- No messy test contacts.
- No prospect-specific fake data.
- Workflows can be left in draft if HighLevel requires review after snapshot import.
- All reusable assets are named consistently.
- All customer-specific values are represented as custom values or clearly documented replacement fields.

### 2. SunScale Geckos Demo Account

Purpose: live sales showroom.

Rules:

- Filled with dummy contacts, animals, products, opportunities, workflows, smart lists, and example messages.
- Uses accelerated workflow timing so a full buyer journey can happen during a sales call.
- Shows both buyer experience and breeder/admin experience.
- May contain demo-only helper buttons, trigger links, and sample payload workflows.

## Target Prospect

Small-to-mid reptile breeders who sell through shows, Instagram, Facebook, MorphMarket, DMs, and referrals.

Primary demo niche: crested gecko breeder.

Demo business: SunScale Geckos.

Primary pain:

- leads disappear after shows
- DMs and inquiries are hard to track
- buyers ask about animals and then go cold
- shipping weather decisions are stressful
- follow-up, reviews, referrals, and repeat sales are inconsistent
- content creation is sporadic

Core sales message:

"You raise the animals. HatchKit runs the buyer journey."

## Demo Promise

In 10 to 15 minutes, a prospect should understand:

1. What their customer sees.
2. What the breeder sees inside HighLevel.
3. What happens automatically.
4. What HatchKit sets up for them.
5. Why this helps them capture more buyers, follow up faster, ship safer, and create more repeat sales.

## Required Demo Journey

### Buyer Experience

1. Visit the SunScale Geckos storefront.
2. Browse available animals.
3. Download the Crested Gecko Starter Guide.
4. Receive immediate email/SMS follow-up.
5. Open an animal detail page for Mango.
6. Click reserve/interested.
7. Receive an offer or reservation reminder.
8. Simulate paying a deposit.
9. Receive purchase confirmation and setup guidance.
10. Receive shipping update after the demo accelerates fulfillment.
11. Receive care onboarding.
12. Receive review/referral/VIP invite.

### Breeder Experience

1. New contact appears in HighLevel.
2. Custom fields show species, animal interest, budget, source, and next best action.
3. Tags show journey stage and buyer intent.
4. Opportunity appears in lead/sales/shipping pipeline.
5. Inbox/conversation shows buyer messages.
6. Workflow history shows automation steps.
7. Smart lists show daily operating queues.
8. Shipping review shows hold/approve/operator status.
9. Social planner/content approval queue shows upcoming posts.

## Required HighLevel Assets

### Business Profile

- SunScale Geckos demo brand
- owner name
- demo sender email
- demo phone/SMS setup if available
- timezone
- demo business address
- fake shipping origin clearly marked as demo-only

### HighLevel Store/Website

- SunScale Store home / Products List page
- Product Details page
- Cart page
- Checkout page
- Thank You page

### Campaign Funnels

- crested gecko starter guide capture
- show QR signup
- review/referral page
- VIP availability list
- optional breeder login/welcome page explaining the dashboard

### Products

- Animal Reservation Deposit: $75
- Crested Gecko Care Starter Kit: $49
- 30-Minute Setup Review: $35
- Crested Gecko Starter Guide: free

### Demo Animals

- Nova, Lilly White, $1,200, available
- Mango, Harlequin Dalmatian, $225, available
- Echo, Tricolor Pinstripe, $650, reserved
- Pepper, Super Dalmatian, $475, available

### CRM

Custom fields:

- Species Interest
- Morph Preference
- Price Tier
- Shipping Preference
- Temperature Tolerance Min
- Temperature Tolerance Max
- Show Source
- Lead Score
- Last Show Attended
- Shipping Status
- Customer Journey Stage
- Animal Interest
- Offer Name
- Purchase Status
- Last Purchase Amount
- Referral Source
- Next Best Action

Smart lists:

- New Crested Gecko Leads
- Hot Animal Buyers
- Shipping Holds
- Operator Review Queue
- Ready For Label Approval
- Review / Referral Candidates
- Repeat Buyer VIP
- Demo Contacts

Pipelines:

- HatchKit - Lead Pipeline
- HatchKit - Sales Pipeline
- HatchKit - Shipping Pipeline

### Workflows

Demo workflows must use accelerated timing. Production snapshot workflows must use real timing.

Required demo workflows:

- Starter Guide Lead Capture
- Lead Magnet Delivery
- New Lead Education Drip
- Animal Interest / Offer Clicked
- Reservation Abandonment
- Deposit Paid / Order Submitted
- Order Shipping Review
- Shipping Hold Operator Alert
- Ready For Label Approval
- Simulated Shipped
- Simulated Delivered
- Post-Purchase Care Onboarding
- Review And Referral Request
- Repeat Buyer VIP Invite
- Social Content Approval Demo

## Accelerated Demo Timeline

Use these demo timings:

- immediate: lead capture confirmation
- 1 minute: starter guide delivery
- 2 minutes: animal availability follow-up
- 3 minutes: reservation reminder if no order
- 4 minutes: deposit/order confirmation
- 5 minutes: shipping review
- 6 minutes: simulated shipped update
- 7 minutes: simulated delivered update
- 8 minutes: care onboarding
- 9 minutes: review/referral request
- 10 minutes: VIP/repeat buyer invite

Production workflows should replace minutes with appropriate real waits.

## Webhook Role

The Vercel app is the backend support layer, not the prospect-facing product.

It should:

- receive HighLevel webhooks
- create/update buyer journey data
- run shipping/order review
- keep live label creation review-only
- support demo payloads
- expose operator/admin proof pages when needed

It should not be the main sales demo surface.

## Snapshot Requirements

The master snapshot must include:

- reusable HighLevel Store/Website
- campaign funnels
- forms
- products where snapshot support allows
- workflows
- custom fields
- tags
- smart lists
- pipelines
- email templates
- SMS templates
- custom values
- demo instructions

After each clone, the onboarding process must update:

- business name
- owner name
- brand colors/logo
- sender phone/email
- species list
- product/pricing choices
- animal inventory
- shipping origin
- webhook base URL if needed
- workflow timing

## Success Criteria

The demo is ready when:

- a prospect can submit a lead form and receive a message
- the contact appears in HighLevel with correct fields/tags
- the breeder can see the contact in the correct smart list
- animal interest updates the contact
- deposit/order simulation updates purchase status
- shipping review returns a clear operator disposition
- accelerated shipping/care/review workflows fire
- demo opportunities appear in the correct pipelines
- the sales rep can run the whole story without explaining technical internals
- the master snapshot can be cloned and customized for a new breeder

## Non-Goals For This Build

- Building a full standalone SaaS dashboard outside HighLevel.
- Creating real carrier labels automatically.
- Using real customer data.
- Guaranteeing sales results.
- Fully automating every HighLevel setup step through API if HighLevel scopes block it.

## Open Inputs Needed From Breeder Friend

- Realistic breeder store sections and language.
- Common buyer questions.
- Typical deposit policy.
- Shipping policy and live-arrival guarantee language.
- Care guide preferences.
- Common gecko morphs and price ranges.
- Example content topics and tone.
- Realistic show/event sources.
- What a breeder wants to see first when they log into HighLevel.
