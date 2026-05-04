# HatchKit — Claude Code Build Guide

## Step-by-Step Setup (Do These In Order)

---

### Step 1: Set Up the Folder Structure

Open your terminal (PowerShell or Command Prompt) and run:

```bash
cd "C:\Users\wallg\OneDrive\Desktop\HatchKit"
git init
```

### Step 2: Create Your `.env` File

Create a file called `.env` in the HatchKit folder root. **Type or paste your real keys into this file.** Never share this file, never commit it to Git.

```env
# GoHighLevel
GHL_PRIVATE_TOKEN=pit_PASTE_YOUR_REAL_TOKEN_HERE
GHL_LOCATION_ID=PASTE_YOUR_REAL_LOCATION_ID_HERE
GHL_API_BASE=https://services.leadconnectorhq.com
GHL_API_VERSION=2021-07-28

# Claude API (for AI agents - get from console.anthropic.com)
ANTHROPIC_API_KEY=sk-ant-PASTE_YOUR_KEY_HERE
CLAUDE_MODEL=claude-sonnet-4-20250514

# Weather (sign up free at openweathermap.org)
OPENWEATHERMAP_API_KEY=

# Square (optional for now)
SQUARE_ACCESS_TOKEN=
SQUARE_ENVIRONMENT=sandbox

# Meta / Instagram (optional for now)
META_ACCESS_TOKEN=
META_PAGE_ID=
```

> **IMPORTANT**: Do NOT give these keys to Claude in chat. Do NOT paste them into any prompt. Claude Code reads the `.env` file directly from your local machine — that's the whole point. Your keys never leave your computer.

### Step 3: Create Your `.gitignore`

Create a file called `.gitignore` in the HatchKit folder root:

```
.env
node_modules/
.DS_Store
*.log
dist/
.claude/
```

### Step 4: Create Your `.env.example`

Create a file called `.env.example` (this IS safe to commit — it has no real keys):

```env
# GoHighLevel
GHL_PRIVATE_TOKEN=pit_your_token_here
GHL_LOCATION_ID=your_location_id_here
GHL_API_BASE=https://services.leadconnectorhq.com
GHL_API_VERSION=2021-07-28

# Claude API
ANTHROPIC_API_KEY=sk-ant-your_key_here
CLAUDE_MODEL=claude-sonnet-4-20250514

# Weather
OPENWEATHERMAP_API_KEY=your_key_here

# Square
SQUARE_ACCESS_TOKEN=
SQUARE_ENVIRONMENT=sandbox

# Meta
META_ACCESS_TOKEN=
META_PAGE_ID=
```

### Step 5: Save the Blueprint Document

Save the `HatchKit_Blueprint_Complete.docx` into the HatchKit folder — or better yet, save the `HATCHKIT_BLUEPRINT.md` file (provided alongside this guide) into the root of the repo. Claude Code reads markdown natively and can reference it throughout the build.

### Step 6: Open in VS Code + Claude Code

```bash
cd "C:\Users\wallg\OneDrive\Desktop\HatchKit"
code .
```

Then open Claude Code in VS Code (Ctrl+Shift+P → "Claude Code: Open").

---

## The Prompts

Below are the exact prompts to give Claude Code, in order. **Run them one at a time. Wait for each to complete before starting the next.** Each prompt builds on the previous one.

---

### PROMPT 1: Project Scaffold + GHL Connection Test

Copy and paste this entire block into Claude Code:

```
Read the file HATCHKIT_BLUEPRINT.md in this repo for full project context. 

HatchKit is a productized service platform for reptile breeders built on GoHighLevel. This repo is the core codebase.

Your first job:

1. Initialize this as a Node.js project (npm init -y)
2. Install dependencies: dotenv, axios, express
3. Create the full directory structure as defined in Section 10 of the blueprint (agents/, ghl/, integrations/, make-scenarios/, templates/, data/, docs/)
4. Create ghl/client.js — a reusable GHL API v2 client that:
   - Reads GHL_PRIVATE_TOKEN, GHL_LOCATION_ID, GHL_API_BASE, and GHL_API_VERSION from .env
   - Exports helper functions: get(endpoint), post(endpoint, data), put(endpoint, data), delete(endpoint)
   - Includes proper Authorization header (Bearer token) and Version header
   - Has error handling and rate limit awareness
5. Create a test script (scripts/test-connection.js) that:
   - Uses the GHL client to GET /locations/{locationId}
   - Prints the location name and confirms API connectivity
   - Run it and confirm it works

The .env file already exists with real credentials. Read it using dotenv. Do NOT ask me for the keys — just use what's in .env.

After everything is created, run the test script and show me the result.
```

---

### PROMPT 2: Custom Fields + Pipelines

```
Now build the CRM foundation in GHL for our demo breeder "SunScale Geckos".

Using the GHL API client you built:

1. Create these custom contact fields (use the Contacts > Custom Fields API):
   - species_interest (dropdown: Leopard Gecko, Ball Python, Crested Gecko, Bearded Dragon, Corn Snake, Other)
   - morph_preference (text)
   - price_tier (dropdown: Budget ($25-75), Mid-Range ($75-250), Premium ($250-750), Designer ($750+))
   - shipping_preference (dropdown: Ship to Home, Hold at FedEx, Local Pickup, Show Pickup)
   - temperature_tolerance_min (number, default 45)
   - temperature_tolerance_max (number, default 88)
   - show_source (dropdown: NARBC Arlington, Tinley Park, Hamburg, Southeast Reptile Expo, Reptile Super Show, Online, Referral, Other)
   - lead_score (number, default 0)
   - last_show_attended (text)
   - shipping_status (dropdown: Not Started, Pending Weather Check, Approved to Ship, Label Created, In Transit, Delivered, LAG Confirmed)

2. Create the Lead Pipeline with stages:
   - New Lead → Contacted → Interested → Qualified → Customer → Lost

3. Create the Sales Pipeline with stages:
   - Animal Selected → Invoice Sent → Payment Received → Shipping Scheduled → Shipped → Delivered → Follow-Up Complete

4. Create the Shipping Pipeline with stages:
   - Pending Review → Weather Check → Approved to Ship → Label Created → Dropped Off → In Transit → Delivered → LAG Confirmed → Complete

Save each pipeline ID and stage IDs to a config file (data/ghl-config.json) so we can reference them in future scripts.

After creating everything, verify by fetching the pipelines and fields back from the API and printing a summary.
```

---

### PROMPT 3: Species Database + Weather Integration

```
Build the shipping intelligence data layer:

1. Create data/species-db.json with shipping temperature tolerances for these species:
   - Leopard Gecko: min 45°F, max 88°F, heat pack below 70°F, cold pack above 85°F
   - Ball Python: min 45°F, max 92°F, heat pack below 65°F, cold pack above 88°F
   - Crested Gecko: min 45°F, max 80°F, heat pack below 65°F, no ship above 80°F
   - Bearded Dragon: min 45°F, max 95°F, heat pack below 65°F, cold pack above 90°F
   - Corn Snake: min 40°F, max 90°F, heat pack below 60°F, cold pack above 85°F
   - Leopard Gecko (baby): min 50°F, max 85°F (tighter tolerance for juveniles)
   
   For each species include: name, scientific_name, min_ship_temp, max_ship_temp, heat_pack_below, cold_pack_above, no_ship_below, no_ship_above, preferred_packing (deli cup vs cloth bag), notes

2. Create data/carrier-hubs.json with the top 20 FedEx and UPS hub cities and their coordinates (Memphis, Louisville, Indianapolis, etc.)

3. Create integrations/weather-api.js that:
   - Uses OpenWeatherMap API (read key from .env)
   - Exports getWeatherForecast(lat, lon) — returns 5-day forecast with daily high/low
   - Exports getRouteWeather(originZip, destZip) — gets weather for both endpoints
   - Exports checkShippingViability(originZip, destZip, species) — returns a shipping decision object:
     {
       canShip: boolean,
       reason: string,
       recommendedShipDate: string or null,
       packingInstructions: { heatPack: boolean, coldPack: boolean, insulationType: string },
       holdAtFacility: boolean,
       warnings: string[]
     }
   - Uses the species-db.json tolerances to make decisions
   - Checks BOTH origin and destination temps against species limits

4. Create a test script (scripts/test-weather.js) that checks shipping viability for:
   - Leopard gecko from Raleigh NC (27601) to Phoenix AZ (85001)
   - Ball python from Atlanta GA (30301) to Chicago IL (60601)
   Print the full decision objects.

If OPENWEATHERMAP_API_KEY is not set in .env yet, have the test gracefully handle that and print mock data instead, with a note to add the key.
```

---

### PROMPT 4: Shipping Decision Agent

```
Build the AI-powered shipping decision agent using the Claude API:

1. Create agents/shipping-agent/prompts/system.md with a system prompt for the shipping agent. The agent's role is:
   - Evaluate whether a live reptile shipment is safe based on weather, species, and logistics
   - Generate customer-facing communications about shipping decisions
   - Recommend optimal ship dates within a given window
   - Provide packing instructions
   
   The system prompt should include the shipping rules from Ship Your Reptiles and MorphMarket:
   - Below 38°F: DO NOT SHIP
   - 38-45°F: Ship with 72-hour heat pack, hold at facility
   - 45-70°F: Ship with 40-hour heat pack
   - 70-88°F: No heat/cold pack needed
   - 88-92°F: Ship with cold pack, hold at facility recommended
   - Above 92°F: DO NOT SHIP to residential (hold at facility only up to 100°F)
   - Above 100°F: DO NOT SHIP
   - Ship days: Monday-Wednesday only (Tue/Wed preferred)
   - Carrier: FedEx Priority Overnight or UPS Next Day Air only

2. Create agents/shipping-agent/index.js that:
   - Imports the weather integration and species database
   - Accepts: { contactId, species, originZip, destinationZip, preferredShipDate }
   - Gets weather data for origin and destination
   - Calls Claude API (Sonnet 4.6) with the system prompt + weather data + species tolerances
   - Returns a structured shipping decision + customer message
   - Updates the GHL contact's shipping_status field via the API
   - Can optionally trigger a GHL workflow or send an SMS/email

3. Create agents/shipping-agent/prompts/customer-comms.md with templates for:
   - Shipping confirmed (with date, tracking info placeholder, packing details)
   - Shipping delayed due to weather (empathetic, safety-focused, with new estimated date)
   - Shipping delayed due to other reason
   - Shipment in transit notification
   - Delivery confirmation + care tips request
   - Live arrival guarantee follow-up

4. Create a test script (scripts/test-shipping-agent.js) that simulates:
   - A leopard gecko sale where weather is good (should approve)
   - A crested gecko sale where destination is 95°F (should hold)
   - Print both the decision and the customer-facing message

Handle the case where ANTHROPIC_API_KEY is not set by using rule-based fallback logic instead of the Claude API call.
```

---

### PROMPT 5: Lead Capture + Show Workflows

```
Build the show lead capture system and automated follow-up:

1. Create ghl/contacts.js with helper functions:
   - createContact(data) — creates a contact with our custom fields
   - updateContact(id, data) — updates contact fields
   - addContactToWorkflow(contactId, workflowId)
   - moveContactPipelineStage(contactId, pipelineId, stageId)
   - searchContacts(query) — search by email, phone, or name
   - getContactsByTag(tag)
   - addTag(contactId, tag)

2. Create ghl/conversations.js with:
   - sendSMS(contactId, message)
   - sendEmail(contactId, subject, htmlBody)
   - getConversation(contactId)

3. Create templates/emails/ with HTML email templates:
   - show-welcome.html — "Thanks for visiting SunScale Geckos at [SHOW_NAME]!"
   - day3-featured-animals.html — showcase 3 available animals with photos
   - day7-care-guide.html — educational content (leopard gecko care basics)
   - day14-special-offer.html — "Still thinking about that gecko? Here's 10% off"
   - shipping-confirmed.html — your animal is on the way
   - delivery-followup.html — how's your new gecko settling in?

4. Create templates/sms/ with SMS templates:
   - show-optin-confirmation.txt
   - new-animal-alert.txt
   - shipping-update.txt
   - delivery-confirmation.txt

5. Create a script (scripts/simulate-show-lead.js) that:
   - Creates a dummy contact as if they scanned a QR code at NARBC Arlington
   - Tags them with "show:narbc-arlington-2026" and "interest:leopard-gecko"
   - Adds them to the Lead Pipeline at "New Lead" stage
   - Sends the show-welcome SMS
   - Prints a summary of what was created

6. Create a script (scripts/load-demo-contacts.js) that creates 20 dummy contacts spread across different pipeline stages, different species interests, and different show sources. This populates the demo for walkthroughs.

Make all email templates clean, mobile-responsive, and branded with SunScale Geckos placeholder branding (green/amber color scheme). Use inline CSS for email compatibility.
```

---

### PROMPT 6: Make.com Webhook Handler + Express Server

```
Build the webhook server that connects Make.com and GHL to our agent system:

1. Create server.js — an Express server that:
   - Runs on port 3000
   - Has these webhook endpoints:
     POST /webhooks/ghl/pipeline-change — triggered when a deal moves pipeline stages
     POST /webhooks/ghl/new-contact — triggered when a new contact is created
     POST /webhooks/ghl/form-submission — triggered when a lead capture form is submitted
     POST /webhooks/shipping/evaluate — triggered to evaluate shipping for a contact
     POST /webhooks/shipping/weather-check — daily cron endpoint to re-check pending shipments
   - Each endpoint validates the incoming payload, processes it, and returns a response
   - The pipeline-change endpoint should:
     - If deal moves to "Payment Received" → trigger shipping agent evaluation
     - If deal moves to "Delivered" → trigger post-delivery follow-up sequence
     - If deal moves to "LAG Confirmed" → trigger review request
   - The form-submission endpoint should:
     - Create/update the contact with form data
     - Tag them with the show source
     - Add to Lead Pipeline
     - Send welcome SMS
   - Log all webhook activity to a log file

2. Create a README.md with:
   - Project overview (what HatchKit is)
   - Setup instructions (clone, npm install, create .env)
   - How to run the server
   - How to connect to Make.com (webhook URLs)
   - How to test with curl commands
   - Architecture overview

3. Create make-scenarios/README.md documenting the Make.com scenarios we'll need:
   - Scenario 1: GHL Pipeline Change → HatchKit Webhook → Process
   - Scenario 2: Daily Weather Check → Re-evaluate pending shipments
   - Scenario 3: New Form Submission → HatchKit Webhook → Welcome sequence
   - Include step-by-step setup instructions for each scenario in Make.com
```

---

## After All 6 Prompts

Once all prompts are complete, you'll have:

- A fully scaffolded Node.js project connected to your real GHL sub-account
- Custom fields, pipelines, and stages built in GHL via API
- An AI shipping decision agent powered by Claude
- Weather integration for shipping safety checks
- Lead capture and follow-up templates
- A webhook server ready to connect to Make.com
- 20+ demo contacts loaded into the system
- Everything version-controlled in Git

### To push to GitHub:

```bash
cd "C:\Users\wallg\OneDrive\Desktop\HatchKit"
git add .
git commit -m "Initial HatchKit scaffold - Phase 1 complete"
gh repo create hatchkit-core --private --source=. --push
```

---

## Tips for Working with Claude Code

1. **Let it finish.** Each prompt is big. Let Claude Code run through the entire thing before interrupting.
2. **If it errors**, just paste the error back and say "fix this."
3. **If it asks about your API keys**, tell it "read them from .env, they're already there."
4. **If GHL API calls fail**, check that your Private Integration token has the right scopes enabled.
5. **Save your progress** — commit after each prompt completes successfully.
6. **You can always ask Claude Code** to explain what it built: "Walk me through what ghl/client.js does."
