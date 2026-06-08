# HighLevel Workflow UI Correction Worksheet

Last updated: 2026-06-07

Location: `SunScale Geckos - Demo` (`oCn199rzTjj0rPgqXyXU`)

Open HighLevel:

`https://app.gohighlevel.com/v2/location/oCn199rzTjj0rPgqXyXU/automation/workflows`

The public demo site has been protected so referral and Starter Guide submissions no longer enter the bad generic drip. This worksheet is for the remaining HighLevel UI copy correction so the whole automation audit can pass.

## Current Readiness Gate

Latest live audit:

- Command: `node scripts\audit-highlevel-automation-messages.js --wait=90 --fail-on-mismatch`
- Result: `overallStatus=pass`
- Passing scenarios: `referral-isolation`, `starter-guide-webhook`, `lead-drip`, `review-vip`
- Failing scenario: none
- Failing flags: none

After editing HighLevel, run:

```powershell
node scripts\audit-highlevel-automation-messages.js --scenario=lead-drip --wait=90 --fail-on-mismatch
node scripts\audit-highlevel-automation-messages.js --wait=90 --fail-on-mismatch
```

## Workflow IDs

These IDs are from the live HighLevel workflow list.

| Workflow | ID | Status | Version | Priority |
|---|---|---:|---:|---|
| `DEMO - Reptiscale - Starter Guide Lead Capture` | `7fa9dc19-70a0-46c4-9853-fe04bc784d58` | published | 6 | Corrected |
| `Lead Education Drip` | `5650cb28-ad89-4370-b203-308509ece1f4` | published | 6 | Corrected |
| `Mango Interest Nurture` | `da3eab36-18dc-4be2-9e5e-1d18660176b4` | published | 6 | Verify |
| `Reservation Abandonment Follow-Up` | `d0c88f53-ded9-45a6-a440-e51c551b0d7e` | published | 5 | Verify |
| `Demo Reptiscale Deposit Paid` | `80f307cd-4a02-41e4-9853-fe04bc784d58` | published | 4 | Verify |
| `Demo Shipping Review Workflow` | `9756f22a-286e-46e0-9299-4e9b689da621` | published | 5 | Verify |
| `Demo Simulated Shipment Update` | `f372d297-b948-4ce5-aa67-5c2543948fd7` | published | 4 | Verify |
| `Simulated Delivery and LAG` | `e45b9641-f20e-4828-8d94-9e4af63e0090` | published | 4 | Verify |
| `Mango Care Onboarding` | `6523de12-b182-4c0a-98c1-d48c7dd4520a` | published | 4 | Verify |
| `Post-Delivery Review and Referral` | `8cab115f-4637-490f-bc84-6650c40dd0c4` | published | 5 | Verify |
| `Repeat Buyer VIP Invitation` | `164bf621-6362-43c3-b8d4-6ce845e7cf3d` | published | 5 | Verify |
| `Content Approval Notification` | `56d016e0-0be3-4262-9267-39782464cde7` | published | 5 | Internal-only verify |

## Exact Fixes

### Starter Guide Lead Capture

Open `DEMO - Reptiscale - Starter Guide Lead Capture`.

Find every `Send Email` action. Replace any copy that says:

- `Mango platform`
- `fascinating creatures`
- `Attached you will find`
- `attached guide`

Use this subject:

`Your Crested Gecko Starter Guide`

Use this body:

```text
Hi {{contact.first_name}},

Here is the Crested Gecko Starter Guide from SunScale Geckos:
{{custom_values.starter_guide_url}}

Start with enclosure size, humidity, food, and the first-week checklist.

If you want help choosing a beginner-friendly gecko, reply with your budget and what kind of animal you like.

Sarah
SunScale Geckos
```

If there is an SMS action, keep it disabled until A2P Campaign approval or use:

`Hey {{contact.first_name}}, Sarah from SunScale Geckos here. Your crested gecko starter guide is on the way. I will also send a few beginner-friendly animals so you can see what a good first gecko looks like. Reply STOP anytime.`

### Lead Education Drip

Open `Lead Education Drip`.

Confirm trigger:

- Tag added: `journey:lead-captured`

Add guard/exclusion:

- Do not run for contacts with tag `journey:referral-captured`.
- Stop if tag exists: `journey:purchased`.

Replace generic store/VIP copy with the two topical messages below.

Email 1 subject:

`Crested gecko care basics before you choose an animal`

Email 1 body:

```text
Hi {{contact.first_name}},

A good crested gecko setup starts with stable humidity, the right enclosure size, safe decor, and a simple feeding routine.

The goal is a calm animal that eats consistently and does not overheat.

If you are still shopping, start with temperament and care fit before morph. A great match is easier to enjoy than the flashiest animal.

Sarah
SunScale Geckos
```

Email 2 subject:

`Beginner-friendly crested geckos to compare`

Email 2 body:

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

## Publish Checklist

- Save each edited email/SMS action.
- Publish the workflow after edits.
- Confirm schedule is 24/7.
- Confirm timezone is `America/New_York`.
- Confirm mark-emails-as-read is off.
- Confirm re-entry matches `docs/demo-showroom/accelerated-workflow-recipes.md`.

## Verification

List audit scenarios:

```powershell
node scripts\audit-highlevel-automation-messages.js --list-scenarios
```

Fast check the known failing path:

```powershell
node scripts\audit-highlevel-automation-messages.js --scenario=lead-drip --wait=90 --fail-on-mismatch
```

Full message audit:

```powershell
node scripts\audit-highlevel-automation-messages.js --wait=90 --fail-on-mismatch
```

The goal is complete when the full message audit reports:

`overallStatus=pass`
