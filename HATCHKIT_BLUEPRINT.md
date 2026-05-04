# HATCHKIT BLUEPRINT
## The Growth Engine for Reptile Breeders
*"Your business, hatched and ready to grow."*

**Version 1.0 | March 2026 | Confidential**

---

## 1. Executive Summary

HatchKit is a productized service platform built on GoHighLevel that provides reptile breeders, feeder insect sellers, and exotic animal vendors with a turnkey business-in-a-box. It combines marketing automation, CRM, AI-powered shipping logistics, lead capture, e-commerce-adjacent sales workflows, and ongoing customer nurture into a single monthly subscription.

The reptile breeding industry generates an estimated $1.4 billion annually in the United States. Despite this, the overwhelming majority of sellers operate with zero marketing infrastructure, no CRM, no automated follow-up, and no systematic approach to shipping logistics. They rely on MorphMarket listings, Facebook groups, Instagram DMs, and reptile expo appearances.

HatchKit gives every breeder the same growth engine that major e-commerce brands have — tailored for live animal sales: weather-dependent shipping windows, platform restrictions, expo-based lead capture, and species-specific buyer education.

---

## 2. The Dummy Business: SunScale Geckos

To build and demo HatchKit without using real client data, we use a fictional breeder: **SunScale Geckos**.

### Why a Gecko Breeder?
Leopard geckos are one of the most popular reptile species with broad appeal. The morph market has clear pricing tiers ($30 pet-quality to $3,000+ designer). They require temperature-controlled shipping. Strong show community. Maps directly to real workflows already built.

### SunScale Geckos Profile

| Attribute | Detail |
|-----------|--------|
| Business Name | SunScale Geckos |
| Owner (Fictional) | Sarah Mitchell |
| Location | Raleigh, NC |
| Specialty | Leopard geckos: pet-quality, premium morphs, designer breeding projects |
| Revenue Range | $40K–$80K/year |
| Channels | MorphMarket, Instagram, reptile expos (6–10/year), website |
| Pain Points | No CRM, no follow-up, loses show leads, manual shipping logistics, no email/SMS marketing |
| Show Circuit | NARBC Arlington, Tinley Park, Hamburg, Southeast Reptile Expo, Reptile Super Show |
| Shipping | Ship Your Reptiles (UPS), FedEx Priority Overnight via ReptilesExpress |
| Price Range | $35 pet-quality → $2,500 designer morphs |

---

## 3. Target Market

### Primary: Mid-Tier Reptile Breeders ($20K–$150K/year)
50–500+ animals, 4–12 expos/year, sell through MorphMarket + social. Outgrown hobby stage, no business infrastructure.

### Secondary: Feeder Insect/Rodent Sellers
High transaction volume, lower AOV, strong repeat purchase. Different shipping (USPS common) but same CRM/marketing needs.

### Tertiary: Specialty Breeders (Snakes, Tarantulas, Frogs)
Species-specific nuances but identical core business problems.

### Ideal Customer Profile

| Characteristic | Detail |
|---------------|--------|
| Annual Revenue | $20K–$150K |
| Collection Size | 50–500+ animals |
| Show Attendance | 4–12 expos/year |
| Current Marketing | MorphMarket + Instagram/Facebook only |
| Shipping Volume | 5–50+ shipments/month |
| Tech Comfort | Smartphone + social media; not technical |
| Primary Frustration | "I meet 200 people at shows and sell to maybe 10. The rest disappear." |

### Competitive Landscape

| Competitor | What They Do | What They Don't Do |
|-----------|-------------|-------------------|
| MorphMarket | Listings, Buy Now via Square, seller pages | No CRM, no lead nurture, no marketing automation, no shipping logistics |
| ReptiWare | Husbandry tracking, breeding records, shipping tracking | No marketing, no lead capture, no customer journey |
| Reptile Buddy | Animal tracking, e-commerce for pros | No CRM, no marketing automation, no AI shipping |
| Husbandry Pro | Cloud collection management, NFC tags | No marketing, no customer communication |
| The Reptile Keeper | Breeder records, customer management | No marketing automation, no shipping logic |
| LaunchPets | Breeder websites + CRM (dog/cat only) | Not built for reptiles; no live animal shipping |
| **HatchKit (Us)** | **Full marketing + CRM + AI shipping + lead capture + nurture + brand** | **This is the gap** |

**Key Insight:** Every existing tool manages animals. Nobody grows the business. HatchKit is the first platform designed to help reptile sellers find, convert, and retain customers while automating live animal commerce.

---

## 4. Product Definition: What HatchKit Includes

### Module 1: Lead Capture & Show CRM
- QR code table cards → mobile opt-in page
- Show-specific landing pages
- Instant SMS/email follow-up on opt-in
- Contact tagging by show, species, price range
- Post-show drip: Day 1 thank-you, Day 3 featured animals, Day 7 education, Day 14 offer
- Unified inbox (MorphMarket, Instagram DMs, email, SMS)

### Module 2: AI-Powered Shipping Logistics Agent
- Weather monitoring at origin, destination, and FedEx/UPS hubs
- Species-specific temperature tolerance checks
- Automatic decisions: ship/no-ship, heat pack/cold pack, residential vs hold-at-facility, optimal ship day
- Proactive customer communications about delays
- Shipping label integration (SYR / ReptilesExpress)
- Post-shipment tracking + live arrival confirmation

### Module 3: Marketing Automation & Nurture
- Automated campaigns: availability alerts, seasonal promos, educational drips, breeding updates
- Social media content calendar templates
- Referral program automation
- Review/testimonial collection post-delivery
- Birthday/anniversary messages

### Module 4: Sales Pipeline & Booking
- Visual pipeline: Lead → Interested → Selected → Paid → Shipping → Delivered → Follow-Up
- Integrated payments (Square/Stripe)
- Automated invoicing + payment reminders
- Calendar booking for shipping windows, show pickups, local pickups
- Waitlist management for upcoming clutches

### Module 5: Brand & Web Presence
- Custom website via GHL funnel/website builder
- Available animals gallery
- SEO care guides for organic traffic
- "About the Breeder" page
- Blog for breeding updates
- Google Business Profile optimization

### Module 6: Reporting & Intelligence
- Revenue dashboard: sales by morph, channel, month
- Lead source attribution: which shows/posts/ads drive sales
- Shipping performance: success rates, transit times, DOA tracking
- Customer lifetime value
- Inventory velocity: fastest/slowest selling morphs

### Module 7: AI Content Engine
- Autonomous daily social media content generation per client
- Smart rotation across 8 content categories (animal spotlight, care tips, behind the scenes, morph education, customer stories, seasonal, engagement, promotional)
- Seasonal awareness: spring breeding, summer hatchlings, fall shows, winter planning
- Show-aware scheduling: preview posts 3 days before, recap posts 1 day after
- Inventory-driven weighting: more spotlights when animals are available, promotional posts when inventory is high
- Instagram-optimized captions with hook, body, CTA structure
- Custom hashtag strategy: species-specific, community, and local tags
- Human-in-the-loop approval flow via SMS (reply 1 to approve, 2 to skip, or send edits)
- Meta Graph API integration for direct Instagram/Facebook publishing
- Full post history and engagement tracking
- Deterministic scheduling (same inputs = same calendar) for reliability

---

## 5. Technical Architecture

### 5.1 Platform Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| CRM & Automation Core | GoHighLevel (Sub-Account) | Contacts, pipelines, workflows, email/SMS, calendar, forms, funnels, websites |
| AI Agent Brain | Claude Sonnet 4.6 (API) | Shipping decisions, communication drafting, lead scoring, content generation |
| Orchestration | Make.com / n8n | Webhook routing, multi-step workflows, API integrations |
| Shipping APIs | Ship Your Reptiles + ReptilesExpress | Label generation, tracking, carrier integration |
| Weather API | OpenWeatherMap or WeatherAPI | Temperature forecasting for shipping decisions |
| Payment | Square or Stripe | Payment processing, invoicing |
| Social Media | Meta Graph API | Instagram DM integration, post scheduling |
| Local Dev & Agent | Claude Code (VS Code) | Building automations, testing GHL API, developing agent logic |
| Hosting | Vercel | Custom PWAs, tracking apps, client-facing utilities |
| Source Control | GitHub | Version control |

### 5.2 GHL Sub-Account Architecture

Each client gets a sub-account cloned from master template:
- Pre-built pipelines (Lead, Sales, Shipping)
- Pre-configured workflows (show capture, nurture, shipping notifications, reviews)
- Custom fields for reptile data (species, morph, price tier, shipping preference, temp tolerance)
- Email/SMS templates with breeder branding
- Website/funnel templates with animals gallery
- Calendar configs for shipping windows

### 5.3 AI Agent Architecture

**Shipping Decision Agent:** Triggered on "Payment Received" stage. Pulls weather for origin/destination/hubs. Cross-references species tolerances. Outputs: ship/hold, recommended date, packing instructions, carrier, hold-at-facility flag. Updates contact, triggers communication.

**Communication Agent:** Drafts personalized messages for shipping updates, delays, check-ins, offers. Uses breeder's voice and brand. Auto-sent or queued based on type.

**Lead Scoring Agent:** Analyzes engagement, species interest match, geography, price tier, show history. Outputs priority score for follow-up urgency.

### 5.4 GHL Private Integration Setup

Scopes needed:
- contacts.readonly, contacts.write
- conversations.readonly, conversations.write
- calendars.readonly, calendars.write
- opportunities.readonly, opportunities.write
- workflows.readonly
- locations.readonly
- forms.readonly, forms.write
- funnels.readonly

API Base URL: `https://services.leadconnectorhq.com/`
Auth Header: `Authorization: Bearer <PRIVATE_INTEGRATION_TOKEN>`
Version Header: `Version: 2021-07-28`

---

## 6. Repository Structure

```
hatchkit-core/
├── .env                          # Real credentials (gitignored)
├── .env.example                  # Template
├── .gitignore
├── README.md
├── package.json
├── server.js                     # Express webhook server
├── agents/
│   ├── shipping-agent/
│   │   ├── index.js              # Shipping decision logic
│   │   ├── weather.js            # Weather API integration
│   │   ├── species-tolerances.json
│   │   └── prompts/
│   │       ├── system.md         # Agent system prompt
│   │       └── customer-comms.md # Communication templates
│   ├── lead-scoring/
│   │   ├── index.js
│   │   └── prompts/
│   └── content-agent/
│       ├── index.js
│       └── prompts/
├── ghl/
│   ├── client.js                 # GHL API v2 wrapper
│   ├── contacts.js               # Contact CRUD
│   ├── pipelines.js              # Pipeline management
│   ├── workflows.js              # Workflow triggers
│   ├── conversations.js          # Unified inbox
│   └── webhooks.js               # Webhook handlers
├── integrations/
│   ├── weather-api.js            # OpenWeatherMap
│   ├── ship-your-reptiles.js     # SYR integration
│   ├── reptiles-express.js       # ReptilesExpress
│   ├── square.js                 # Payments
│   └── meta-graph.js             # Instagram DMs
├── make-scenarios/
│   ├── README.md
│   ├── show-lead-capture.json
│   ├── shipping-decision.json
│   └── post-delivery-nurture.json
├── templates/
│   ├── ghl-snapshot/             # GHL sub-account template
│   ├── emails/                   # Email HTML templates
│   ├── sms/                      # SMS templates
│   └── social/                   # Social post templates
├── data/
│   ├── species-db.json           # Species + shipping tolerances
│   ├── carrier-hubs.json         # FedEx/UPS hub locations
│   ├── show-calendar.json        # Reptile expo dates
│   └── ghl-config.json           # Pipeline/field IDs
├── scripts/
│   ├── test-connection.js        # GHL API connectivity test
│   ├── test-weather.js           # Weather API test
│   ├── test-shipping-agent.js    # Shipping agent test
│   ├── simulate-show-lead.js     # Simulate show lead capture
│   └── load-demo-contacts.js     # Load 20 dummy contacts
└── docs/
    ├── onboarding-checklist.md
    ├── api-reference.md
    └── agent-architecture.md
```

---

## 7. Shipping Rules Reference

These rules must be encoded into the shipping agent:

### Temperature Guidelines (Reptiles)
| Temp Range | Action |
|-----------|--------|
| Below 38°F | DO NOT SHIP |
| 38–45°F | Ship with 72-hour heat pack, hold at facility |
| 45–70°F | Ship with 40-hour heat pack |
| 70–85°F | No heat/cold pack needed |
| 85–92°F | Ship with cold pack, consider hold at facility |
| 92–100°F | DO NOT SHIP to residential (hold at facility only) |
| Above 100°F | DO NOT SHIP |

### Shipping Rules
- Ship Monday–Wednesday only (Tuesday/Wednesday preferred)
- FedEx Priority Overnight or UPS Next Day Air only
- Must use certified shipping boxes (no USPS, Amazon, or branded boxes)
- Drop off at FedEx Ship Center or UPS Store only (not retail locations)
- In hot weather (>92°F), drop off after 5 PM
- Check weather at origin, ALL sort facility hubs, and destination
- Heat packs: minimum 40-hour rated (not hand warmers)
- Cold packs: freeze overnight, wrap in paper towel
- Small/delicate animals (geckos, frogs): deli cup
- Larger reptiles (snakes, large lizards): cloth reptile bag
- Always include crumpled newspaper for cushioning
- Never let heat/cold pack touch animal directly

---

## 8. Pricing Model

| Plan | Monthly | Setup Fee | Includes |
|------|---------|-----------|----------|
| Starter | $149/mo | $499 | GHL sub-account, lead capture, show QR codes, basic drip, 1 pipeline, website template |
| Growth | $249/mo | $999 | + AI shipping agent, full sales pipeline, unified inbox, marketing automation, referral program |
| Pro | $399/mo | $1,499 | + Custom integrations, advanced reporting, onboarding call, monthly strategy review, multi-species |

---

## 9. Branding

**Name:** HatchKit
**Tagline:** "Your business, hatched and ready to grow."
**Colors:** Deep forest green (#1B5E20) + warm amber/orange (#E65100)
**Voice:** Knowledgeable, professional, breeder-to-breeder, confident
**Logo concept:** Stylized egg with crack revealing growth/digital element
