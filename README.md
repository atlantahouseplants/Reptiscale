# HatchKit

**The Growth Engine for Reptile Breeders**
*"Your business, hatched and ready to grow."*

HatchKit is a productized service platform built on GoHighLevel that gives reptile breeders a complete business-in-a-box: marketing automation, CRM, AI-powered shipping logistics, lead capture, and customer nurture — all in one monthly subscription.

---

## What's in This Repo

| Layer | What it does |
|-------|-------------|
| **Express server** (`server.js`) | Receives GHL webhooks and routes logic internally — no third-party orchestration needed |
| **GHL API client** (`ghl/`) | Reusable v2 API wrapper for contacts, conversations, pipelines, and webhooks |
| **Shipping agent** (`agents/shipping-agent/`) | Claude-powered decision engine for live reptile logistics |
| **Weather integration** (`integrations/weather-api.js`) | OpenWeatherMap-backed route viability checks |
| **Email + SMS templates** (`templates/`) | Branded SunScale Geckos drip sequences |
| **Data layer** (`data/`) | Species tolerances, carrier hubs, pipeline config |
| **Scripts** (`scripts/`) | Setup, testing, and demo data utilities |

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd hatchkit-core
npm install
```

### 2. Create your `.env` file

```bash
cp .env.example .env
```

Fill in the values:

```env
# GoHighLevel
GHL_PRIVATE_TOKEN=pit_your_token_here
GHL_LOCATION_ID=your_location_id
GHL_API_BASE=https://services.leadconnectorhq.com
GHL_API_VERSION=2021-07-28

# Claude API
ANTHROPIC_API_KEY=sk-ant-your_key_here
CLAUDE_MODEL=claude-sonnet-4-6

# Weather
OPENWEATHERMAP_API_KEY=your_key_here

# Server
PORT=3000
BREEDER_ZIP=27601
```

### 3. Run the connection test

```bash
node scripts/test-connection.js
```

### 4. Set up GHL custom fields and pipelines

```bash
# Creates all 10 custom contact fields
node scripts/setup-crm.js

# After creating pipelines in GHL UI, sync their IDs
node scripts/sync-pipelines.js
```

### 5. Start the server

```bash
node server.js
```

---

## Running the Server

```bash
# Development (auto-restart on changes — requires nodemon)
npx nodemon server.js

# Production
node server.js
```

The server starts on port `3000` by default. Set `PORT` in `.env` to change it.

Webhook activity is logged to `logs/webhooks.log`.

---

## Connecting GHL Webhooks

In GHL, go to **Settings → Integrations → Webhooks** and create triggers pointing to your server URL.

For local development, use [ngrok](https://ngrok.com) to expose your local port:

```bash
ngrok http 3000
# → Forwarding https://abc123.ngrok.io → localhost:3000
```

Then configure GHL webhooks to point at `https://abc123.ngrok.io/webhooks/ghl/...`

### Webhook Endpoints

| Endpoint | GHL Trigger | What it does |
|----------|-------------|-------------|
| `POST /webhooks/ghl/pipeline-change` | Opportunity Stage Change | Routes to shipping agent, delivery follow-up, or review request based on stage name |
| `POST /webhooks/ghl/new-contact` | Contact Created | Auto-tags new contacts with source |
| `POST /webhooks/ghl/form-submission` | Form Submitted | Creates/updates contact, tags show source, sends welcome SMS |
| `POST /webhooks/shipping/evaluate` | Manual / scheduled | Evaluates shipment viability for a specific contact |
| `POST /webhooks/shipping/weather-check` | Daily cron | Re-checks all contacts tagged `shipping:pending-weather-check` |

### Stage Name → Action Mapping

The pipeline-change endpoint reads the incoming stage **name** (not ID) and routes accordingly:

| Stage Name | Action |
|-----------|--------|
| `Payment Received` | Run shipping agent → send decision SMS |
| `Delivered` | Send delivery follow-up SMS, update shipping_status |
| `LAG Confirmed` | Send review request SMS |
| `Follow-Up Complete` | Tag contact as repeat-buyer candidate |

---

## Test with curl

```bash
# Health check
curl http://localhost:3000/

# Simulate a pipeline change to "Payment Received"
curl -X POST http://localhost:3000/webhooks/ghl/pipeline-change \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "YOUR_CONTACT_ID",
    "pipelineStageName": "Payment Received",
    "pipelineId": "YOUR_PIPELINE_ID",
    "locationId": "YOUR_LOCATION_ID"
  }'

# Direct shipping evaluation
curl -X POST http://localhost:3000/webhooks/shipping/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "YOUR_CONTACT_ID",
    "species": "leopard_gecko",
    "originZip": "27601",
    "destinationZip": "75201"
  }'

# Simulate a show form submission
curl -X POST http://localhost:3000/webhooks/ghl/form-submission \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@example.com",
    "phone": "+15555550100",
    "show_name": "NARBC Arlington 2026",
    "species_interest": "Leopard Gecko",
    "price_tier": "Mid-Range ($75-250)"
  }'

# Trigger daily weather re-check
curl -X POST http://localhost:3000/webhooks/shipping/weather-check
```

---

## Architecture

```
GHL (webhooks) ──→ server.js ──→ Route by event type
                       │
                       ├── /ghl/pipeline-change ──→ agents/shipping-agent/  (Payment Received)
                       │                        ──→ ghl/conversations.js     (Delivered, LAG)
                       │
                       ├── /ghl/form-submission ──→ ghl/contacts.js
                       │                        ──→ ghl/conversations.js (welcome SMS)
                       │
                       └── /shipping/evaluate   ──→ integrations/weather-api.js
                                                ──→ Claude API (claude-sonnet-4-6)
                                                ──→ ghl/contacts.js (update shipping_status)
```

**Data flow for a sale:**
1. Deal moves to "Payment Received" in GHL Sales Pipeline
2. GHL fires webhook → `POST /webhooks/ghl/pipeline-change`
3. Server calls shipping agent with contact's species + zip
4. Agent pulls live weather for origin, destination, and carrier hubs
5. Claude generates ship/hold decision + customer-facing message
6. Contact's `shipping_status` field updated in GHL
7. Customer receives SMS with shipping decision

---

## Scripts Reference

| Script | Purpose |
|--------|---------|
| `node scripts/test-connection.js` | Verify GHL API connectivity |
| `node scripts/setup-crm.js` | Create all 10 custom contact fields |
| `node scripts/sync-pipelines.js` | Sync pipeline IDs after creating in GHL UI |
| `node scripts/test-weather.js` | Test weather API and shipping viability |
| `node scripts/test-shipping-agent.js` | Test Claude shipping agent end-to-end |
| `node scripts/simulate-show-lead.js` | Create one show lead with welcome SMS |
| `node scripts/load-demo-contacts.js` | Load 20 demo contacts for walkthroughs |

---

## Project Structure

```
hatchkit-core/
├── server.js                     # Express webhook server (main entry point)
├── .env                          # Real credentials (gitignored)
├── agents/
│   ├── shipping-agent/           # AI shipping decision agent (Claude)
│   ├── lead-scoring/             # Lead scoring agent (future)
│   └── content-agent/            # Content generation agent (future)
├── ghl/
│   ├── client.js                 # GHL API v2 wrapper
│   ├── contacts.js               # Contact CRUD
│   ├── conversations.js          # SMS + email sending
│   ├── pipelines.js              # Pipeline + opportunity management
│   ├── workflows.js              # Workflow triggers
│   └── webhooks.js               # Webhook payload parsers
├── integrations/
│   └── weather-api.js            # OpenWeatherMap + shipping viability
├── templates/
│   ├── emails/                   # HTML email templates
│   └── sms/                      # SMS copy templates
├── data/
│   ├── species-db.json           # Species shipping tolerances
│   ├── carrier-hubs.json         # FedEx/UPS hub coordinates
│   ├── show-calendar.json        # Reptile expo dates (future)
│   └── ghl-config.json           # Pipeline + field IDs
├── scripts/                      # Setup and test utilities
├── logs/                         # Webhook activity logs (gitignored)
└── docs/
    └── webhooks.md               # Webhook integration reference
```
