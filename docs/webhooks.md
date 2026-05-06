# HatchKit Webhook Integration Reference

The HatchKit Express server is the orchestration layer. GHL fires webhooks directly to it — no third-party automation platform needed. All routing, logic, and API calls happen inside the server.

---

## Overview

```
GHL Event → HatchKit Webhook Server → Internal Logic → GHL API / Claude / SMS
```

The server exposes the full Reptiscale journey endpoint set. Each endpoint maps to one or more HighLevel trigger types or demo fulfillment actions.

---

## Endpoints

### `POST /webhooks/ghl/pipeline-change`

**GHL Trigger:** Opportunity Stage Change

Fires when a deal moves to a new pipeline stage. The server reads the stage name and routes to the appropriate handler.

**Payload (GHL sends automatically):**
```json
{
  "contactId": "abc123",
  "pipelineStageName": "Payment Received",
  "pipelineId": "pipeline_id",
  "locationId": "location_id",
  "monetaryValue": 250
}
```

**Stage → Action mapping:**

| Stage Name | Handler | What happens |
|-----------|---------|-------------|
| `Payment Received` | `handlePaymentReceived` | Looks up contact, runs shipping agent, sends decision SMS |
| `Delivered` | `handleDelivered` | Updates `shipping_status` field, sends delivery follow-up SMS |
| `LAG Confirmed` | `handleLAGConfirmed` | Updates `shipping_status`, sends review request SMS |
| `Follow-Up Complete` | `handleFollowUpComplete` | Tags contact as `repeat-buyer-candidate` |
| All others | — | Acknowledged, no action taken |

---

### `POST /webhooks/ghl/new-contact`

**GHL Trigger:** Contact Created

Fires when any new contact is created in GHL. Auto-tags with `source:direct` if no source tag is present.

**Payload:**
```json
{
  "id": "contact_id",
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "phone": "+15555550100",
  "tags": [],
  "locationId": "location_id"
}
```

---

### `POST /webhooks/ghl/form-submission`

**GHL Trigger:** Form Submitted

The primary show lead capture endpoint. Fires when someone submits your QR code opt-in form at an expo.

**Payload** (fields passed from the GHL form):
```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com",
  "phone": "+15555550100",
  "show_name": "NARBC Arlington 2026",
  "species_interest": "Leopard Gecko",
  "price_tier": "Mid-Range ($75-250)"
}
```

**What it does:**
1. Searches for existing contact by email
2. Creates new contact or updates existing one
3. Sets custom fields: show_source, species_interest, price_tier, last_show_attended, lead_score
4. Adds tags: `show:{slug}`, `source:show-qr`, `status:new-lead`, `interest:{species}`
5. Sends welcome SMS immediately

**To connect a GHL form:**
- In GHL form builder, add a webhook action pointing to this endpoint
- Map form fields to the payload keys above (or rename your form fields to match)

---

### `POST /webhooks/shipping/evaluate`

**Trigger:** Any — manual call, GHL workflow action, or scheduled task

Evaluates shipping viability for a contact and optionally sends them a decision SMS.

**Payload:**
```json
{
  "contactId": "abc123",
  "species": "leopard_gecko",
  "originZip": "27601",
  "destinationZip": "85001",
  "preferredShipDate": "2026-03-18"
}
```

**`species` values** (from `data/species-db.json`):
- `leopard_gecko`
- `leopard_gecko_baby`
- `ball_python`
- `crested_gecko`
- `bearded_dragon`
- `corn_snake`

**Response:**
```json
{
  "success": true,
  "result": {
    "decision": "APPROVE",
    "recommendedShipDate": "2026-03-18",
    "carrier": "FedEx Priority Overnight",
    "packingInstructions": { "heatPack": true, "heatPackDuration": "40hr", ... },
    "holdAtFacility": false,
    "safetyReason": "All route temps within species tolerances.",
    "customerMessage": "Great news — your gecko is all set to ship on Tuesday..."
  }
}
```

---

### `POST /webhooks/shipping/operator-gate`

**Trigger:** Manual fulfillment review before any live label is created

Combines the shipping agent's weather/species decision with FedEx-style label payload readiness. This endpoint is review-only and does not buy a label.

Use this when the system already has normalized shipper, recipient, species, origin, destination, and package data.

---

### `POST /webhooks/shipping/order-review`

**Trigger:** Order form/payment confirmation, storefront order event, or HighLevel workflow action

Normalizes a buyer order into a shipment review, then runs the operator gate. This is the best endpoint for the demo purchase-to-fulfillment flow.

**Payload:**
```json
{
  "locationId": "fqj4rbp2VRkvMa8GWVWn",
  "customer": {
    "firstName": "Demo",
    "lastName": "Buyer",
    "email": "demo.lead@example.com",
    "phone": "+14045550199"
  },
  "order": {
    "id": "DEMO-ORDER-1001",
    "productName": "Animal Reservation Deposit",
    "species_interest": "Crested Gecko",
    "animalInterest": "Mango - Harlequin Dalmatian",
    "amount": 75
  },
  "shippingAddress": {
    "address1": "100 Buyer Street",
    "city": "Atlanta",
    "state": "GA",
    "postalCode": "30339",
    "countryCode": "US",
    "residential": true
  },
  "preferredShipDate": "2026-05-11"
}
```

**Response:** Returns the normalized shipment input, the weather/species decision, the review-only label payload, and `operatorDisposition`.

---

### `POST /webhooks/shipping/weather-check`

**Trigger:** Daily scheduled call (set up a cron job or GHL scheduled workflow)

Re-evaluates all contacts tagged `shipping:pending-weather-check`. If weather has cleared for any of them, sends an approval SMS and updates their GHL record.

**No payload required.** Reads all pending contacts from GHL automatically.

**Response:**
```json
{
  "success": true,
  "checked": 3,
  "results": [
    { "contactId": "abc123", "decision": "APPROVE", "shipDate": "2026-03-18" },
    { "contactId": "def456", "decision": "HOLD",    "shipDate": null },
    { "contactId": "ghi789", "skipped": true, "reason": "No zip code" }
  ]
}
```

**To schedule the daily check:**

Option A — cron job (simplest):
```bash
# In crontab: run daily at 6 AM
0 6 * * * curl -s -X POST http://localhost:3000/webhooks/shipping/weather-check
```

Option B — GHL workflow: Create a time-based workflow that fires a webhook action to this endpoint daily.

---

## Setting Up GHL Webhooks

1. **GHL → Settings → Integrations → Webhooks → Add New Webhook**
2. Set the trigger (e.g., "Opportunity Stage Changed")
3. Set the URL to `https://your-domain.com/webhooks/ghl/pipeline-change`
4. Save and test

For local development with ngrok:
```bash
ngrok http 3000
# Copy the https URL, e.g. https://abc123.ngrok.io
# Use https://abc123.ngrok.io/webhooks/ghl/pipeline-change in GHL
```

---

## Logs

All webhook activity is written to `logs/webhooks.log` as newline-delimited JSON:

```json
{"ts":"2026-03-15T14:23:01.000Z","type":"REQUEST","message":"POST /webhooks/ghl/pipeline-change","data":{...}}
{"ts":"2026-03-15T14:23:02.000Z","type":"SUCCESS","message":"Shipping decision: APPROVE — 2026-03-18"}
```

To tail logs in real time:
```bash
# macOS/Linux
tail -f logs/webhooks.log | jq .

# Windows PowerShell
Get-Content logs/webhooks.log -Wait
```

---

## Adding a New Stage Handler

To handle a new pipeline stage, add an entry to `PIPELINE_STAGE_ACTIONS` in `server.js`:

```js
const PIPELINE_STAGE_ACTIONS = {
  'payment received':   handlePaymentReceived,
  'delivered':          handleDelivered,
  'lag confirmed':      handleLAGConfirmed,
  'follow-up complete': handleFollowUpComplete,
  'your new stage':     handleYourNewStage,   // ← add here
};
```

Then define the handler function above the routes section. The handler receives the parsed event object and can call any GHL API or agent function.
