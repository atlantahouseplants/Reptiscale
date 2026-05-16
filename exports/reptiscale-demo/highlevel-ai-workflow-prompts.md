# HighLevel AI Workflow Prompt Pack

Client: SunScale Geckos
Location ID: fqj4rbp2VRkvMa8GWVWn
Base URL: `https://reptiscale-demo.vercel.app`

The first three webhook workflows are already built and tested:

- `Reptiscale - Lead Magnet Delivery`
- `Reptiscale - Offer Clicked`
- `Reptiscale - Order Submitted`

Use the prompts below for the next HighLevel build pass. Keep each workflow in Draft until it is reviewed and tested.

## 1. Review Submitted Webhook

```text
Create a workflow named "Reptiscale - Review Submitted".

Keep the workflow in Draft until I review it.

Trigger:
- Contact tag added
- Tag: demo:review-submitted

Actions:
1. Add a Custom Webhook action.
2. Configure the webhook as:
   - Event: CUSTOM
   - Method: POST
   - Content-Type: application/json
   - Authorization: None
   - URL: https://reptiscale-demo.vercel.app/webhooks/ghl/review-submitted

Raw JSON body:
{
  "locationId": "fqj4rbp2VRkvMa8GWVWn",
  "firstName": "{{contact.first_name}}",
  "lastName": "{{contact.last_name}}",
  "email": "{{contact.email}}",
  "phone": "{{contact.phone}}",
  "species_interest": "Crested Gecko",
  "rating": 5,
  "source": "manual-demo-review"
}

Workflow goal:
When a buyer submits or receives credit for a review, send the event to Reptiscale so the system moves the buyer into advocacy, requests referrals, and records proof/UGC follow-up.
```

## 2. Referral Submitted Webhook

```text
Create a workflow named "Reptiscale - Referral Submitted".

Keep the workflow in Draft until I review it.

Trigger:
- Contact tag added
- Tag: demo:referral

Actions:
1. Add a Custom Webhook action.
2. Configure the webhook as:
   - Event: CUSTOM
   - Method: POST
   - Content-Type: application/json
   - Authorization: None
   - URL: https://reptiscale-demo.vercel.app/webhooks/ghl/referral

Raw JSON body:
{
  "locationId": "fqj4rbp2VRkvMa8GWVWn",
  "firstName": "Referral",
  "lastName": "Lead",
  "email": "referral.lead@example.com",
  "phone": "+14045550198",
  "species_interest": "Crested Gecko",
  "referralSource": "{{contact.full_name}}"
}

Workflow goal:
When a customer refers someone, create or update the referred contact in Reptiscale/HighLevel, tag them as a referral lead, and start the same buyer journey from lead capture.
```

## 3. Daily Weather Re-Check

```text
Create a workflow named "Reptiscale - Daily Shipping Weather Re-Check".

Keep the workflow in Draft until I review it.

Trigger:
- Schedule
- Every day at 6:00 AM in the account timezone

Actions:
1. Add a Custom Webhook action.
2. Configure the webhook as:
   - Event: CUSTOM
   - Method: POST
   - Content-Type: application/json
   - Authorization: None
   - URL: https://reptiscale-demo.vercel.app/webhooks/shipping/weather-check

Raw JSON body:
{
  "locationId": "fqj4rbp2VRkvMa8GWVWn",
  "source": "daily-weather-recheck",
  "runType": "scheduled"
}

Workflow goal:
Every morning, ask Reptiscale to find contacts tagged shipping:pending-weather-check, re-check the live route weather, update shipping status, and notify the buyer if the shipment becomes safe.
```

## 4. Shipping Hold Operator Alert

```text
Create a workflow named "Reptiscale - Shipping Hold Operator Alert".

Keep the workflow in Draft until I review it.

Trigger:
- Contact tag added
- Tag: shipping:hold

Actions:
1. Add tag: shipping:operator-review
2. Add tag: shipping:manual-review-required
3. Create a task assigned to the account owner:
   - Title: Review live-animal shipping hold for {{contact.full_name}}
   - Due: Today
   - Description: Reptiscale marked this shipment as HOLD. Check the Shipping Status, Next Best Action, species, destination zip, and weather note before promising a ship date.
4. Send an internal notification to the account owner:
   - Subject/message: Reptiscale shipping hold for {{contact.full_name}}
   - Include contact name, phone, email, species interest, shipping status, and next best action.

Workflow goal:
When Reptiscale blocks shipment for weather/species safety, make sure the breeder sees it and does not create a label until the hold clears.
```

## 5. Ready For Label Approval Alert

```text
Create a workflow named "Reptiscale - Ready For Label Approval".

Keep the workflow in Draft until I review it.

Trigger:
- Contact tag added
- Tag: shipping:ready-for-operator-approval

Actions:
1. Create a task assigned to the account owner:
   - Title: Approve live-animal label for {{contact.full_name}}
   - Due: Today
   - Description: Reptiscale says this shipment is technically ready and policy-approved. Verify recipient phone, address, hold-at-facility preference, packaging, and weather before buying the live label.
2. Send an internal notification to the account owner:
   - Subject/message: Reptiscale shipment ready for operator approval
   - Include contact name, phone, email, species interest, shipping status, and next best action.

Workflow goal:
When Reptiscale says a shipment can proceed, put a human approval checkpoint in front of any label purchase.
```

## 6. Post-Purchase Care Onboarding

```text
Create a workflow named "Reptiscale - Post-Purchase Care Onboarding".

Keep the workflow in Draft until I review it.

Trigger:
- Contact tag added
- Tag: journey:purchased

Actions:
1. Add tag: journey:care-onboarding
2. Add tag: care:day0
3. Send SMS:
   Thanks again for reserving your crested gecko. I will keep you updated on shipping weather and send setup tips before arrival. Reply here anytime with questions.
4. Send Email:
   Subject: Your crested gecko reservation and next steps
   Body: Confirm the animal, explain shipping/weather safety, and link to the starter setup checklist.
5. Wait 3 days.
6. Add tag: care:day3
7. Send SMS:
   Quick setup check: make sure the enclosure is ready, temps are stable, and food/water are in place before arrival.
8. Wait 4 days.
9. Add tag: care:day7
10. Send Email:
   Subject: Crested gecko settling-in checklist
   Body: Explain low-stress handling, feeding expectations, hydration, and when to reach out.

Workflow goal:
After purchase, help the buyer feel supported, reduce preventable care issues, and make the breeder look professional.
```

## 7. Review And Referral Request

```text
Create a workflow named "Reptiscale - Review And Referral Request".

Keep the workflow in Draft until I review it.

Trigger:
- Contact tag added
- Tag: shipping:lag-confirmed

Actions:
1. Wait 3 days.
2. Add tag: review:requested
3. Send SMS:
   I hope your gecko is settling in well. Would you be willing to leave a quick review or send a photo update? It helps a small breeder a lot.
4. Wait 4 days.
5. Add tag: referral:requested
6. Send Email:
   Subject: Know someone looking for a healthy crested gecko?
   Body: Thank the customer, ask for a referral, and invite them to the VIP availability list for future animals.
7. Add tag: journey:repeat-buyer

Workflow goal:
Turn successful deliveries into reviews, photo proof, referrals, and future repeat buyers.
```

## Smart Lists To Build Manually

- New crested gecko leads: tag `interest:crested-gecko` and tag `status:new-lead`
- Hot animal buyers: tag `journey:offer-presented` or tag `status:hot-lead`
- Shipping holds: tag `shipping:hold` or tag `shipping:pending-weather-check`
- Operator review queue: tag `shipping:operator-review`
- Ready for label approval: tag `shipping:ready-for-operator-approval`
- Review/referral candidates: tag `journey:advocacy` or tag `review:received`
- Repeat buyer VIP: tag `journey:repeat-buyer` or tag `status:repeat-buyer`

## Test Order

1. Add `demo:review-submitted` to the test buyer contact.
2. Add `demo:referral` to a customer contact.
3. Add `shipping:hold` to the buyer contact and confirm the operator task/notification appears.
4. Add `shipping:ready-for-operator-approval` to the buyer contact and confirm the approval task appears.
5. Add `journey:purchased` to the buyer contact and confirm the care onboarding workflow starts.
6. Add `shipping:lag-confirmed` to the buyer contact and confirm review/referral follow-up starts.
7. Run or test the daily weather re-check workflow once.
