# HatchKit — Breeder Onboarding Guide

Step-by-step guide for getting a new breeder live on HatchKit.

---

## Phase 1: Pre-Onboarding (Before the Call)

### 1. Create GHL Sub-Account
1. Log into GHL Agency Dashboard
2. Go to Sub-Accounts → Create New
3. Import from Snapshot: "HatchKit Template"
4. Name the sub-account with the breeder's business name
5. Note the new **Location ID** (Settings → Business Profile → scroll down)
6. Create a **Private Integration** in the sub-account:
   - Settings → Private Integrations → Create
   - Enable scopes: Contacts (R/W), Opportunities (R/W), Conversations (R/W), Forms (R), Locations (R)
   - Copy the token

### 2. Collect Breeder Info
Get this from the breeder (intake form or onboarding call):
- Business name
- Owner name, email, phone
- Location (city, state, ZIP)
- Species they breed
- Morphs they sell
- Price range
- Brand colors (or let us pick)
- Brand voice description
- Logo file
- Upcoming show schedule
- Instagram/Facebook page links (if any)
- Desired tier (Starter/Growth/Pro)

---

## Phase 2: Technical Setup (Script-Driven)

### 3. Run the Onboarding Script

Option A — Interactive:
```bash
cd C:\Users\wallg\OneDrive\Desktop\HatchKit
node scripts/onboard-breeder.js
```

Option B — From config file:
```bash
node scripts/onboard-breeder.js --config path/to/intake.json
```

Example intake.json:
```json
{
  "clientId": "yeti-gex",
  "businessName": "YetiGex",
  "ownerName": "Brianna Johnson",
  "ownerEmail": "brianna@yetigex.com",
  "ownerPhone": "+13035551234",
  "location": "Denver, CO",
  "breederZip": "80202",
  "shippingOrigin": {
    "streetLines": ["123 Breeder Lane"],
    "city": "Denver",
    "stateOrProvinceCode": "CO",
    "postalCode": "80202",
    "countryCode": "US"
  },
  "timezone": "America/Denver",
  "species": ["Crested Gecko", "Gargoyle Gecko"],
  "morphs": ["Harlequin", "Dalmatian", "Lilly White"],
  "priceRange": { "min": 75, "max": 1500 },
  "brandVoice": "Enthusiastic, geeky about genetics, casual tone",
  "brandColors": { "primary": "#2E3440", "accent": "#88C0D0" },
  "tier": "growth",
  "ghlLocationId": "NEW_LOCATION_ID_HERE",
  "ghlToken": "pit_TOKEN_HERE"
}
```

The script will:
- Create `data/breeders/{clientId}/` with config files
- Create custom fields in GHL via API
- Create pipelines based on their tier
- Generate branded email/SMS templates
- Run connection tests

### 4. Deploy Updated Server

If this is a new breeder (not the first one), redeploy:
```bash
vercel --prod
```

The server auto-discovers breeders from `data/breeders/` directories.

---

## Phase 3: Manual GHL Setup

### 5. Import Email Templates
1. Open the breeder's GHL sub-account
2. Go to Marketing → Emails → Templates
3. For each template in `data/breeders/{clientId}/templates/emails/`:
   - Create New Template → Import HTML
   - Paste the HTML content
   - Verify branding looks correct
   - Save

### 6. Configure Workflows
Follow `docs/ghl-workflows.md` to create all 10 workflows:
- Set webhook URLs to your deployed Vercel URL
- Replace `{BASE_URL}` with `https://your-app.vercel.app`
- Set correct pipeline IDs (from `data/breeders/{clientId}/ghl-config.json`)

### 7. Upload Logo & Customize Pages
1. Upload the breeder's logo to the GHL sub-account
2. Update the Show QR Landing Page with their logo + colors
3. Update the Available Animals Gallery page (if Growth/Pro)

### 8. Set Up Make.com Scenarios
1. Import blueprints from `make-scenarios/`:
   - `daily-weather-check.json` — runs daily at 6 AM
   - `daily-content-run.json` — runs daily at 9 AM (Growth/Pro only)
2. Replace `{{WEBHOOK_BASE_URL}}` with your Vercel URL
3. Connect to the breeder's GHL sub-account
4. Activate the scenarios

---

## Phase 4: Testing

### 9. Test Lead Capture
```bash
node scripts/simulate-show-lead.js
```
Verify:
- Contact created in GHL
- Tags applied correctly
- Welcome SMS sent (check GHL conversations)
- Contact appears in Lead Pipeline → New Lead

### 10. Test Shipping Agent
```bash
node scripts/test-shipping-agent.js
```
Verify:
- Weather data fetched correctly
- Shipping decision returned (APPROVE/DELAY/HOLD)
- Customer message generated

### 11. Test Content Engine
```bash
node scripts/generate-demo-content.js
```
Verify:
- Content generated in breeder's brand voice
- Post appears in content log
- SMS approval flow works (if configured)

### 12. End-to-End Pipeline Test
1. Create a test contact manually in GHL
2. Move them through the Sales Pipeline:
   - Animal Selected → verify no action
   - Invoice Sent → verify reminder SMS goes out after 24h
   - Payment Received → verify shipping agent runs + SMS sent
   - Shipped → verify status update
   - Delivered → verify follow-up SMS
3. Check webhook logs: `logs/webhooks.log`

---

## Phase 5: Go Live

### 13. Print QR Codes
1. In GHL, get the Show QR Landing Page URL
2. Generate QR code (https://www.qr-code-generator.com/)
3. Print table cards for the breeder's next show

### 14. Enable Workflows
1. Go to GHL → Automations → Workflows
2. Activate all 10 workflows
3. Verify scheduled workflows (Weather Check, Content Gen) fire at correct times

### 15. Breeder Training
Cover with the breeder:
- How to check their GHL inbox
- How to move deals in the pipeline
- How SMS content approval works (reply 1/2)
- Where to see their leads
- How to add new shows to their schedule
- Emergency: how to pause workflows if something goes wrong

### 16. First Show
- Breeder takes QR cards to their next show
- Monitor lead captures in real-time
- Follow up after the show to confirm everything worked
- Adjust settings based on feedback

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Webhooks not firing | Check GHL webhook URLs point to correct Vercel URL. Check Vercel logs for errors. |
| SMS not sending | Verify Twilio/GHL phone number is configured. Check contact has opted in. |
| Shipping agent returns wrong decision | Check species-db.json has correct temperature tolerances. |
| Content not generating | Check ANTHROPIC_API_KEY is set. Check client config has `active: true`. |
| Pipeline stages don't match | Run `node scripts/sync-pipelines.js` to refresh IDs in ghl-config.json. |
| Breeder not found in webhook | Check `data/breeders/{clientId}/ghl-config.json` has correct `locationId`. |
