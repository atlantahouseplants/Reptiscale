# Automation Message Audit And Corrections

Last updated: 2026-06-07

Location: `SunScale Geckos - Demo` (`oCn199rzTjj0rPgqXyXU`)

## Trigger Issue Found

The referral form created a referred lead, then the contact received a generic email:

- Subject: `Discover Mango & Exclusive Offers at Our Storefront`
- Problem: referral leads should first receive a referral-specific starter-guide welcome, not a broad Mango/storefront/VIP promotion.

The live message audit also found a lead/guide email using generic or incorrect wording:

- `Mango platform` is incorrect. Mango is the featured animal, not a software platform.
- `fascinating creatures` is generic and weaker than breeder-specific copy.
- `Attached you will find the starter guide` should not be used unless the email actually includes an attachment; prefer a page/link.

Root cause:

- The `/webhooks/ghl/referral` endpoint tagged referral leads with `journey:lead-captured`.
- The HighLevel `Lead Education Drip` workflow uses `journey:lead-captured`, so referral leads entered the generic lead nurture path.

Correction:

- Referral leads now receive `journey:referral-captured` instead of `journey:lead-captured`.
- Referral leads also receive `source:referral`, `referral:received`, `status:new-lead`, `status:referred-lead`, and `interest:crested-gecko`.
- HighLevel should have a separate referral workflow triggered by `journey:referral-captured`.
- Published custom-code Starter Guide submissions now receive `journey:lead-captured-webhook` and `message:starter-guide-sent` instead of the broken generic `journey:lead-captured` trigger.
- The webhook sends the correct Starter Guide email immediately so public visitors do not receive the bad HighLevel workflow copy while that UI-only email body is being corrected.

## Live Workflow Audit

The HighLevel API can list workflow names/status but does not expose email/SMS bodies. Verify and edit message bodies manually in HighLevel.

Latest live audit status:

- `node scripts\audit-highlevel-automation-messages.js --wait=90`
- Overall status: `pass`
- Passing paths: referral webhook, public Starter Guide webhook, manually triggered `journey:lead-captured` path, review/VIP workflow.
- Failing path: none.
- UI worksheet with exact workflow IDs and replacement copy: `docs/demo-showroom/highlevel-workflow-ui-correction-worksheet.md`.
- Hard readiness gate after UI edits: `node scripts\audit-highlevel-automation-messages.js --wait=90 --fail-on-mismatch`.

| Live workflow name | Intended recipe | Message status | Required correction |
|---|---|---|---|
| `DEMO - Reptiscale - Starter Guide Lead Capture` | Starter Guide Lead Capture | Corrected and passing live audit | Keep the formatted Starter Guide email body; do not reintroduce `Mango platform`, `fascinating creatures`, or unsupported attachment claims. |
| `Lead Education Drip` | Lead Education Drip | Corrected and passing live audit | Keep the formatted topical lead-nurture copy. Do not trigger from `journey:referral-captured`. |
| `Mango Interest Nurture` | Animal Interest - Mango | Needs UI verification | Message should focus only on Mango, the $75 reservation deposit, setup/shipping questions, and reservation link. |
| `Reservation Abandonment Follow-Up` | Reservation Abandonment | Needs UI verification | Message should ask if they still want help deciding on Mango; avoid generic store promos. |
| `Demo Reptiscale Deposit Paid` | Deposit Paid | Needs UI verification | Message should confirm Mango is on hold and explain setup/shipping review next. |
| `Demo Shipping Review Workflow` | Order Shipping Review | Needs UI verification | Message should explain weather/route review and no live label until operator approval. |
| `Demo Simulated Shipment Update` | Simulated Shipped | Needs UI verification | Message should clearly say this is a demo in-transit update. |
| `Simulated Delivery and LAG` | Simulated Delivered And LAG | Needs UI verification | Message should explain delivery, settling in, and live-arrival confirmation. |
| `Mango Care Onboarding` | Care Onboarding | Needs UI verification | Message should give first-week care guidance only. |
| `Post-Delivery Review and Referral` | Review And Referral | Needs UI verification | Message should ask the Mango buyer for review/referral after delivery/LAG, not invite a referred friend to buy Mango. |
| `Repeat Buyer VIP Invitation` | Repeat Buyer VIP | Needs UI verification | Message should invite proven buyer/reviewer to first-look future availability. |
| `Content Approval Notification` | Social Content Approval | Needs UI verification | Internal-only message to staff/admin: Mango spotlight post ready for approval. |

## Canonical Message Copy

Use these exact subjects/bodies or close variants in HighLevel. Keep SMS disabled or expect failures until A2P campaign approval.

### Starter Guide Lead Capture

Trigger:

- Public custom-code path: `POST /webhooks/ghl/lead-magnet`, which sends this email directly and tags `journey:lead-captured-webhook`
- HighLevel UI workflow path after copy correction: tag added `journey:lead-captured`

Email subject:

`Your Crested Gecko Starter Guide`

Email body:

```text
Hi {{contact.first_name}},

Here is the Crested Gecko Starter Guide from SunScale Geckos:
{{custom_values.starter_guide_url}}

Start with enclosure size, humidity, food, and the first-week checklist.

If you want help choosing a beginner-friendly gecko, reply with your budget and what kind of animal you like.

Sarah
SunScale Geckos
```

SMS:

`Hey {{contact.first_name}}, Sarah from SunScale Geckos here. Your crested gecko starter guide is on the way. I will also send a few beginner-friendly animals so you can see what a good first gecko looks like. Reply STOP anytime.`

### Lead Education Drip - Care Basics

Trigger:

- Tag added: `journey:lead-captured`
- Exclude if tag exists: `journey:referral-captured`
- Stop if tag exists: `journey:purchased`

Email subject:

`Crested gecko care basics before you choose an animal`

Email body:

```text
Hi {{contact.first_name}},

A good crested gecko setup starts with stable humidity, the right enclosure size, safe decor, and a simple feeding routine.

The goal is a calm animal that eats consistently and does not overheat.

If you are still shopping, start with temperament and care fit before morph. A great match is easier to enjoy than the flashiest animal.

Sarah
SunScale Geckos
```

SMS:

`Crested gecko tip: keep the setup stable before handling. Humidity, safe decor, and a simple feeding routine matter more than a fancy setup on day one.`

### Lead Education Drip - Available Animals

Email subject:

`Beginner-friendly crested geckos to compare`

Email body:

```text
Hi {{contact.first_name}},

Mango is the beginner-friendly animal I would show you first.

He is a Harlequin Dalmatian, priced at $225, with a curious feeding response and a manageable first-gecko fit.

You can view Mango here:
{{custom_values.mango_detail_url}}

If you are not ready for Mango, join the VIP list for future availability:
{{custom_values.vip_url}}

Sarah
SunScale Geckos
```

SMS:

`A good first crested gecko should be eating consistently, have clear setup needs, and match your budget. Mango is here: {{custom_values.mango_detail_url}}`

### Referral Welcome

Trigger:

- Tag added: `journey:referral-captured`

Email subject:

`A crested gecko starter guide from SunScale Geckos`

Email body:

`Hi {{contact.first_name}}, someone thought you might like SunScale Geckos because you are researching crested geckos. Start here with the Crested Gecko Starter Guide: {{custom_values.starter_guide_url}}. It covers setup basics, feeding, humidity, handling, and what to look for in a beginner-friendly animal. If you want help comparing animals later, reply with your budget and experience level. - Sarah, SunScale Geckos`

SMS:

`Hi {{contact.first_name}}, someone thought you might like SunScale Geckos. Here is the crested gecko starter guide: {{custom_values.starter_guide_url}}. Reply with your budget if you want help choosing.`

### Mango Interest

Email subject:

`Mango is available if he feels like the right fit`

Email body:

`Hi {{contact.first_name}}, Mango is still available. A $75 reservation deposit can hold him while we confirm pickup or safe shipping weather. You can reserve here: {{custom_values.reservation_url}}. If you are unsure, reply with your setup, experience level, and whether you prefer pickup or shipping.`

SMS:

`Mango is still available. A $75 deposit can hold him while we confirm pickup or safe shipping weather: {{custom_values.reservation_url}}`

### Reservation Abandonment

Email subject:

`Still thinking about Mango?`

Email body:

`Hi {{contact.first_name}}, if you are still deciding on Mango, I can help compare temperament, price, morph, pickup, or shipping. If he feels right, the $75 deposit link is here: {{custom_values.reservation_url}}.`

SMS:

`Still thinking about Mango? I can hold him with a $75 deposit, or help you compare him with another beginner-friendly gecko.`

### Deposit Paid

Email subject:

`Mango is on hold - next we check setup and shipping`

Email body:

`Hi {{contact.first_name}}, Mango is on hold. Next I will confirm your setup and check the shipping route before we pick a ship date. No live label is created until the route, weather, and package details are reviewed.`

SMS:

`Mango is on hold. Next I will confirm your setup and check the shipping route before we pick a ship date.`

### Shipping Review

Email subject:

`Mango shipping review is queued`

Email body:

`Hi {{contact.first_name}}, Mango's shipping info is ready for review. Sarah will check route, weather, recipient details, and package readiness before any label is approved. This demo never creates a live carrier label automatically.`

SMS:

`Good news: Mango's shipping info is ready for Sarah to review. No live label is created until route and weather are approved.`

### Care Onboarding

Email subject:

`First-week care notes for Mango`

Email body:

`Hi {{contact.first_name}}, Mango may hide for the first few days. Keep handling minimal, maintain humidity, keep food available, and let him settle into a quiet space. Send photos if you want Sarah to review the setup.`

SMS:

`Mango may hide for the first few days. Keep handling minimal, maintain humidity, and offer food on the regular schedule.`

### Review And Referral

Email subject:

`How did Mango settle in?`

Email body:

`Hi {{contact.first_name}}, if Mango arrived safely and the process felt easy, would you leave a quick review? It helps new keepers feel confident buying from a small breeder. Review link: {{custom_values.review_url}}. If you know someone researching crested geckos, you can send them Sarah's starter guide here: {{custom_values.referral_url}}.`

SMS:

`If Mango arrived safely and the process felt easy, would you leave a quick review? {{custom_values.review_url}}`

### Repeat Buyer VIP

Email subject:

`First look at future SunScale geckos`

Email body:

`Hi {{contact.first_name}}, thank you again for supporting SunScale Geckos. If you want first look at future animals before they hit the public feed, join the VIP availability list here: {{custom_values.vip_url}}.`

SMS:

`Want first look at future geckos before they hit the public feed? Join the VIP list here: {{custom_values.vip_url}}`

## HighLevel UI Correction Steps

1. Open `Automation > Workflows`.
2. For each workflow in the audit table, open every `Send Email` and `Send SMS` action.
3. Replace any generic AI-generated copy, especially `Discover Mango & Exclusive Offers at Our Storefront`, `Mango platform`, `fascinating creatures`, or unsupported attachment claims.
4. Add exclusion/branching to `Lead Education Drip` so contacts tagged `journey:referral-captured` do not receive the generic lead drip.
5. After the Starter Guide email body is corrected in HighLevel, either:
   - keep the public custom-code webhook on `journey:lead-captured-webhook`, or
   - intentionally switch it back to `journey:lead-captured` after `npm run audit:messages` shows no mismatch flags.
6. Create or update a referral-specific workflow:
   - Name: `DEMO - Reptiscale - Referral Welcome`
   - Trigger: tag added `journey:referral-captured`
   - Re-entry: ON for demo
   - Schedule: 24/7
   - Timezone: `America/New_York`
   - Email subject/body: use `Referral Welcome` above
   - Optional SMS: keep disabled until A2P campaign approval or use the SMS copy above after approval.
7. Publish the corrected workflows.
8. Test with a fresh referral lead and confirm the first email is referral-specific.
