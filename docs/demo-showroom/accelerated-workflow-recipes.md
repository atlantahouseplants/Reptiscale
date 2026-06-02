# Accelerated HighLevel Workflow Recipes

Last updated: 2026-06-02

These recipes are for the `SunScale Geckos - Demo` subaccount.

Use prefix:

`DEMO - Reptiscale -`

Webhook base:

`https://reptiscale-demo.vercel.app`

Replace:

- `SUNSCALE_DEMO_LOCATION_ID` with the new HighLevel location ID.
- Page URLs with the final HighLevel page URLs.
- Sender email/phone values after the account is configured.

## Demo Timing Rule

Demo workflows use minutes instead of days so a prospect can feel the system during a sales call.

Production snapshot workflows must use real timing and should not copy these wait durations unchanged.

## Workflow 1: Starter Guide Lead Capture

Name:

`DEMO - Reptiscale - Starter Guide Lead Capture`

Trigger:

- Form submitted: Crested Gecko Starter Guide
- Alternate trigger: webhook/page form posts directly to `/webhooks/ghl/lead-magnet`

Webhook action:

`POST https://reptiscale-demo.vercel.app/webhooks/ghl/lead-magnet`

Payload:

```json
{
  "locationId": "SUNSCALE_DEMO_LOCATION_ID",
  "firstName": "{{contact.first_name}}",
  "email": "{{contact.email}}",
  "phone": "{{contact.phone}}",
  "species_interest": "Crested Gecko",
  "source": "lead-magnet-page",
  "offerKey": "crested_gecko_starter_guide"
}
```

Actions:

1. Add tags:
   - `journey:lead-captured`
   - `offer:lead-magnet`
   - `content:starter-guide`
   - `status:new-lead`
   - `interest:crested-gecko`
2. Set fields:
   - Species Interest = `Crested Gecko`
   - Customer Journey Stage = `Lead Captured`
   - Offer Name = `Crested Gecko Starter Guide`
   - Next Best Action = `Send guide and show beginner-friendly animals`
3. Send immediate SMS:
   - `Hey {{contact.first_name}}, Sarah from SunScale Geckos here. Your crested gecko starter guide is on the way. I'll also send a few beginner-friendly animals so you can see what a good first gecko looks like. Reply STOP anytime.`
4. Send immediate email:
   - Subject: `Your Crested Gecko Starter Guide`
5. Wait 1 minute.
6. Add tag:
   - `journey:nurture`

Stop conditions:

- Contact unsubscribed.
- Contact replies and asks not to receive follow-up.
- Contact has `journey:purchased`.

## Workflow 2: Lead Education Drip

Name:

`DEMO - Reptiscale - Lead Education Drip`

Trigger:

- Tag added: `journey:lead-captured`

Actions:

1. Wait 1 minute.
2. Send email/SMS: `Day 1 Care Basics`
3. Set Customer Journey Stage = `Nurture`
4. Add tag: `content:care-guide-sent`
5. Wait 1 minute.
6. Send email/SMS: `Available Animals`
7. Add tag: `content:availability-sent`
8. Include links:
   - Mango detail page
   - storefront
   - VIP list

Example SMS:

`A good first crested gecko should be eating consistently, have clear setup needs, and match your budget. Mango is a beginner-friendly Harlequin Dalmatian here: {{custom_values.mango_detail_url}}`

Stop conditions:

- Contact has `journey:purchased`.
- Contact unsubscribed.

## Workflow 3: Animal Interest / Offer Clicked

Name:

`DEMO - Reptiscale - Animal Interest - Mango`

Trigger:

- Button/link clicked: `Reserve Mango`
- Form submitted: Animal inquiry
- Manual demo trigger

Webhook action:

`POST https://reptiscale-demo.vercel.app/webhooks/ghl/offer-clicked`

Payload:

```json
{
  "locationId": "SUNSCALE_DEMO_LOCATION_ID",
  "email": "{{contact.email}}",
  "phone": "{{contact.phone}}",
  "species_interest": "Crested Gecko",
  "animalInterest": "Mango - Harlequin Dalmatian",
  "offerKey": "animal_reservation",
  "source": "animal-detail"
}
```

Actions:

1. Add tags:
   - `journey:offer-presented`
   - `offer:animal-reservation`
   - `animal:mango-harlequin-dalmatian`
   - `status:hot-lead`
2. Set fields:
   - Animal Interest = `Mango - Harlequin Dalmatian`
   - Offer Name = `Animal Reservation Deposit`
   - Customer Journey Stage = `Offer Presented`
   - Next Best Action = `Invite buyer to place $75 reservation deposit`
3. Create or move opportunity:
   - Pipeline: `HatchKit - Lead Pipeline`
   - Stage: `Interested`
   - Opportunity name: `{{contact.name}} - Mango interest`
   - Value: `$225`
4. Send SMS:
   - `Mango is still available. A $75 deposit can hold him while we confirm pickup or safe shipping weather: {{custom_values.reservation_url}}`
5. Wait 2 minutes.
6. If Purchase Status is not `Deposit Paid`, start reservation abandonment workflow.

## Workflow 4: Reservation Abandonment

Name:

`DEMO - Reptiscale - Reservation Abandonment`

Trigger:

- Tag added: `offer:animal-reservation`
- Condition: Purchase Status is not `Deposit Paid`

Actions:

1. Wait 3 minutes from offer click.
2. If still no deposit:
   - Send SMS:
     `Still thinking about Mango? I can hold him with a $75 deposit, or help you compare him with another beginner-friendly gecko.`
3. Create task:
   - `Follow up on Mango reservation`
4. Add tag:
   - `needs-attention`

Stop conditions:

- Purchase Status = `Deposit Paid`
- Contact unsubscribed.

## Workflow 5: Deposit Paid / Order Submitted

Name:

`DEMO - Reptiscale - Deposit Paid`

Trigger:

- Order form submitted
- Payment received
- Demo button/manual action

Webhook action:

`POST https://reptiscale-demo.vercel.app/webhooks/ghl/order-submitted`

Payload:

```json
{
  "locationId": "SUNSCALE_DEMO_LOCATION_ID",
  "firstName": "{{contact.first_name}}",
  "lastName": "{{contact.last_name}}",
  "email": "{{contact.email}}",
  "phone": "{{contact.phone}}",
  "species_interest": "Crested Gecko",
  "animalInterest": "Mango - Harlequin Dalmatian",
  "productName": "Animal Reservation Deposit",
  "amount": 75,
  "purchaseStatus": "Deposit Paid",
  "destinationZip": "{{contact.postal_code}}",
  "shippingAddress": {
    "address1": "100 Buyer Street",
    "city": "Atlanta",
    "state": "GA",
    "postalCode": "30339",
    "countryCode": "US",
    "residential": true
  },
  "preferredShipDate": "2026-06-08"
}
```

Actions:

1. Add tags:
   - `journey:purchased`
   - `status:customer`
   - `purchase:animal`
2. Remove tag:
   - `needs-attention`
3. Set fields:
   - Purchase Status = `Deposit Paid`
   - Last Purchase Amount = `75`
   - Customer Journey Stage = `Purchased`
   - Next Best Action = `Confirm setup and run shipping review`
4. Move/create opportunity:
   - Sales Pipeline -> `Payment Received`
   - Value: `$225`
5. Send purchase confirmation:
   - `Mango is on hold. Next I’ll confirm your setup and check the shipping route before we pick a ship date.`
6. Wait 1 minute.
7. Start Order Shipping Review workflow.

## Workflow 6: Order Shipping Review

Name:

`DEMO - Reptiscale - Order Shipping Review`

Trigger:

- Tag added: `journey:purchased`
- Alternate: Sales Pipeline stage changed to `Payment Received`

Webhook action:

`POST https://reptiscale-demo.vercel.app/webhooks/shipping/order-review`

Payload:

```json
{
  "locationId": "SUNSCALE_DEMO_LOCATION_ID",
  "contactId": "{{contact.id}}",
  "customer": {
    "firstName": "{{contact.first_name}}",
    "lastName": "{{contact.last_name}}",
    "email": "{{contact.email}}",
    "phone": "{{contact.phone}}"
  },
  "order": {
    "id": "DEMO-ORDER-1001",
    "productName": "Animal Reservation Deposit",
    "amount": 75,
    "purchaseStatus": "Deposit Paid",
    "species_interest": "Crested Gecko",
    "animalInterest": "Mango - Harlequin Dalmatian"
  },
  "shippingAddress": {
    "address1": "100 Buyer Street",
    "city": "Atlanta",
    "state": "GA",
    "postalCode": "30339",
    "countryCode": "US",
    "residential": true
  },
  "preferredShipDate": "2026-06-08"
}
```

Actions:

1. Add tags:
   - `journey:shipping`
   - `shipping:operator-review`
2. Set fields:
   - Shipping Status = `Operator Review`
   - Customer Journey Stage = `Shipping`
   - Next Best Action = `Review route, weather, recipient data, and package before label`
3. Move/create opportunity:
   - Shipping Pipeline -> `Pending Review`
4. Wait 1 minute.
5. If operator disposition is ready/approved for demo:
   - Add tag `shipping:ready-for-operator-approval`
   - Set Shipping Status = `Ready for Label Approval`
   - Move Shipping Pipeline -> `Approved to Ship`
6. Send buyer SMS:
   - `Good news: Mango's shipping info is ready for Sarah to review. No live label is created until the route and weather are approved.`

Important:

Do not create a live carrier label from this workflow.

## Workflow 7: Simulated Shipped

Name:

`DEMO - Reptiscale - Simulated Shipped`

Trigger:

- Tag added: `shipping:ready-for-operator-approval`

Actions:

1. Wait 1 minute.
2. Add tags:
   - `shipping:approved`
   - `shipping:in-transit`
3. Set field:
   - Shipping Status = `In Transit`
4. Move Shipping Pipeline -> `In Transit`
5. Send SMS:
   - `Demo update: Mango is now marked in transit. In a real launch, this message would include the carrier and tracking details.`

## Workflow 8: Simulated Delivered / LAG Confirmed

Name:

`DEMO - Reptiscale - Simulated Delivered And LAG`

Trigger:

- Shipping Status changed to `In Transit`

Actions:

1. Wait 1 minute.
2. Set field:
   - Shipping Status = `Delivered`
3. Move Shipping Pipeline -> `Delivered`
4. Send SMS:
   - `Mango has been delivered. Give him time to settle in and reply here once live arrival is confirmed.`
5. Wait 1 minute.
6. Add tag:
   - `shipping:lag-confirmed`
7. Set field:
   - Shipping Status = `LAG Confirmed`
8. Move Shipping Pipeline -> `LAG Confirmed`
9. Start care onboarding and review/referral workflows.

## Workflow 9: Care Onboarding

Name:

`DEMO - Reptiscale - Care Onboarding`

Trigger:

- Tag added: `shipping:lag-confirmed`
- Alternate: Shipping Status changed to `Delivered`

Actions:

1. Add tags:
   - `journey:care-onboarding`
   - `care:day0`
2. Set Customer Journey Stage = `Care Onboarding`
3. Send SMS/email:
   - `Mango may hide for the first few days. Keep handling minimal, maintain humidity, and offer food on the regular schedule.`
4. Wait 1 minute.
5. Add tag:
   - `care:day3`
6. Send settling-in message.
7. Wait 1 minute.
8. Add tag:
   - `care:day7`
9. Send feeding/checkup message.

## Workflow 10: Review And Referral Request

Name:

`DEMO - Reptiscale - Review And Referral`

Trigger:

- Tag added: `shipping:lag-confirmed`

Actions:

1. Wait 1 minute.
2. Add tags:
   - `journey:advocacy`
   - `review:requested`
   - `referral:requested`
3. Set Customer Journey Stage = `Advocacy`
4. Send SMS:
   - `If Mango arrived safely and the process felt easy, would you leave a quick review? {{custom_values.review_url}}`
5. Wait 1 minute.
6. Send referral SMS:
   - `Know someone researching crested geckos? You can send them Sarah's starter guide here: {{custom_values.referral_url}}`

## Workflow 11: Repeat Buyer VIP

Name:

`DEMO - Reptiscale - Repeat Buyer VIP`

Trigger:

- Tag added: `review:received`
- Alternate: tag added `journey:advocacy`

Actions:

1. Wait 1 minute.
2. Add tags:
   - `journey:repeat-buyer`
   - `status:repeat-buyer`
   - `waitlist:active`
   - `campaign:availability-alerts`
3. Set Customer Journey Stage = `Repeat Buyer`
4. Set Next Best Action = `Send first-look availability and future clutch updates`
5. Send SMS:
   - `Want first look at future geckos before they hit the public feed? Join the VIP list here: {{custom_values.vip_url}}`

## Workflow 12: Social Content Approval Demo

Name:

`DEMO - Reptiscale - Social Content Approval`

Trigger:

- Manual demo trigger
- Scheduled trigger for demo day

Actions:

1. Add tag to breeder/demo operator contact:
   - `content:pending-approval`
2. Send internal SMS/email:
   - `Your SunScale post is ready: Mango spotlight with care tip CTA. Reply 1 to approve, 2 to skip, or send edits.`
3. Show Social Planner queue manually in HighLevel.

Note:

This workflow can be mostly demonstrative until connected social accounts are available.

## QA Test Path

1. Submit starter guide form.
2. Confirm contact has `journey:lead-captured`.
3. Wait for guide/care/availability messages.
4. Click Mango interest.
5. Confirm `Animal Interest = Mango - Harlequin Dalmatian`.
6. Simulate deposit paid.
7. Confirm Sales Pipeline stage is `Payment Received`.
8. Confirm Shipping Pipeline shows operator review.
9. Confirm shipping status moves to `In Transit`, `Delivered`, then `LAG Confirmed`.
10. Confirm review/referral/VIP messages fire.

