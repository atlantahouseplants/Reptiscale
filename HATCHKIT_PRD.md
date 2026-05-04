# HatchKit — Complete Product Requirements Document

**Last updated:** 2026-03-16 — Added breeder-validated features from Brianna (YetiGex), including animal profile pages, AI buyer interest detection, customer-animal memory, per-animal content tracking, post suggestion engine, social comment lead capture, post-purchase lifecycle sequences, media library, and looky-loo conversion system.

## What This Document Is

This is the complete PRD for building HatchKit, the all-in-one SaaS platform for reptile breeders. Hand this entire document to Claude Code. It contains everything needed to build the product from scratch, including what already exists and what needs to be built.

---

## 1. Product Overview

**HatchKit** is a SaaS platform that helps reptile breeders capture show leads, ship animals safely, manage messages, follow up with buyers, track deals, post on social media, build a website, and see their numbers — all from one dashboard.

**Target customer:** Small-to-mid reptile breeders who sell at reptile expos and online (MorphMarket, Instagram, Facebook). They are NOT technical. They use their phones for everything. They check Instagram more than email. They are overwhelmed by the business side and just want to focus on their animals.

**Business model:**
- Starter: $149/mo + $499 setup
- Growth: $249/mo + $799 setup (most popular)
- Pro: $399/mo + $1,199 setup
- Month-to-month after setup. No contracts.
- Money-back guarantee: if they don't make back their setup fee in 90 days, work free until they do.

**Current status:** 3 breeders interested. Marketing website is live at hatchkit.ai. The following code already exists in the `/HatchKit` directory and MUST be integrated, not rebuilt:
- `agents/shipping-agent/` — Claude-powered shipping decision engine (works)
- `integrations/weather-api.js` — OpenWeatherMap route weather checks (works)
- `integrations/meta-graph.js` — Instagram/Facebook publishing (works)
- `data/species-db.json` — Temperature tolerances for 6 species (works, needs expansion)
- `data/carrier-hubs.json` — 20 FedEx/UPS hub locations (works)
- `data/clients.json` — Client profile structure (one demo client: SunScale Geckos)
- `data/ghl-config.json` — GoHighLevel CRM field mapping (reference only — we are replacing GHL with our own system)
- `templates/emails/` — 6 HTML email templates (show-welcome, day3, day7, day14, shipping-confirmed, delivery-followup)
- `templates/sms/` — 4 SMS templates (opt-in confirmation, new animal alert, shipping update, delivery confirmation)
- `templates/social/` — Social post templates
- `agents/shipping-agent/prompts/` — System prompt and customer communication templates

---

## 2. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 15+ (App Router, TypeScript) | Already using it for marketing site. Server components, API routes, fast. |
| Database | Supabase (PostgreSQL + Auth + Storage + Realtime) | Managed Postgres, built-in auth, file storage for animal photos, realtime for inbox. Row Level Security for multi-tenant. |
| Auth | Supabase Auth | Email/password + magic link. Simple. Breeders aren't going to use SSO. |
| Payments | Stripe | Subscriptions, invoices, payment links for breeder-to-buyer transactions. |
| Email sending | Resend (resend.com) | Simple API, good deliverability, supports custom domains per breeder. |
| SMS | Twilio | SMS/MMS for follow-up sequences and shipping notifications. Each breeder gets their own number. |
| AI | Anthropic Claude API (claude-sonnet-4-5-20250514) | Draft replies, social post generation, shipping decisions. Already using it in shipping agent. |
| Weather | OpenWeatherMap API | Already integrated in `integrations/weather-api.js`. |
| Social publishing | Meta Graph API | Already integrated in `integrations/meta-graph.js`. |
| File storage | Supabase Storage | Animal photos, QR code images, breeder logos. |
| Hosting | Vercel | Already deployed there. Edge functions for webhooks. |
| Background jobs | Vercel Cron + Supabase Edge Functions | Scheduled follow-ups, social post publishing, weather checks. |
| Realtime | Supabase Realtime | Inbox message updates, deal board changes. |

---

## 3. Architecture

### Multi-Tenant Model

Every breeder is a **tenant**. All tables use `breeder_id` as a foreign key. Supabase Row Level Security (RLS) enforces that breeders can only see their own data. The HatchKit admin team can see all data for support purposes.

### App Structure

```
hatchkit-app/                    # New Next.js app (separate from marketing site)
├── app/
│   ├── (auth)/                  # Auth pages (login, signup, forgot password)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── layout.tsx           # Sidebar nav, breeder context provider
│   │   ├── page.tsx             # Dashboard home (today's overview — Brianna #13)
│   │   ├── leads/page.tsx       # Lead capture & contacts (Brianna #3)
│   │   ├── animals/page.tsx     # Animal profiles grid (Brianna #4)
│   │   ├── animals/[id]/page.tsx # Individual animal profile (photos, inquiries, social history)
│   │   ├── inbox/page.tsx       # Unified inbox (Brianna #1, #2)
│   │   ├── deals/page.tsx       # Deal tracker board + purchase history (Brianna #14)
│   │   ├── shipping/page.tsx    # Shipping decisions & tracking
│   │   ├── follow-up/page.tsx   # Automation sequences (Brianna #6, #11)
│   │   ├── social/page.tsx      # Social post queue, calendar, suggestion engine (Brianna #8, #9)
│   │   ├── media/page.tsx       # Media library with folders (Brianna: images/clips/music)
│   │   ├── website/page.tsx     # Website builder/settings
│   │   ├── numbers/page.tsx     # Analytics dashboard (Brianna #12)
│   │   └── settings/page.tsx    # Account, billing, integrations
│   ├── api/                     # API routes
│   │   ├── webhooks/            # Stripe, Twilio, Meta webhooks
│   │   ├── cron/                # Scheduled jobs
│   │   └── public/              # Public endpoints (QR scan landing, contact forms)
│   └── [breeder-slug]/          # Public breeder websites (e.g., hatchkit.ai/sunscale-geckos)
│       ├── page.tsx             # Breeder homepage
│       ├── animals/page.tsx     # Available animals gallery
│       └── contact/page.tsx     # Contact form
├── lib/
│   ├── supabase/                # Supabase client, types, queries
│   ├── ai/                      # Claude API calls (drafts, social, shipping)
│   ├── email/                   # Resend email sending
│   ├── sms/                     # Twilio SMS sending
│   ├── shipping/                # Shipping agent (migrate from existing code)
│   ├── social/                  # Meta Graph API (migrate from existing code)
│   └── weather/                 # Weather API (migrate from existing code)
├── components/
│   ├── ui/                      # Shared UI components
│   ├── dashboard/               # Dashboard-specific components
│   └── public/                  # Public breeder website components
└── supabase/
    └── migrations/              # Database migrations
```

---

## 4. Database Schema

### Core Tables

```sql
-- Breeders (tenants)
create table breeders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  email text unique not null,
  name text not null,
  business_name text not null,
  slug text unique not null,                    -- URL slug for public website
  phone text,
  logo_url text,
  brand_colors jsonb default '{"primary": "#1B5E20", "accent": "#FF6F00"}',
  brand_voice text,                             -- AI tone description
  species text[] default '{}',                  -- species they breed
  plan text not null default 'starter',         -- starter, growth, pro
  stripe_customer_id text,
  stripe_subscription_id text,
  twilio_phone_number text,                     -- their dedicated SMS number
  meta_page_id text,                            -- Facebook page ID
  meta_access_token text,                       -- encrypted Meta token
  instagram_account_id text,
  timezone text default 'America/New_York',
  setup_complete boolean default false,
  active boolean default true
);

-- Contacts (leads and customers)
create table contacts (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid references breeders(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  name text not null,
  email text,
  phone text,
  source text,                                  -- 'show', 'website', 'morphmarket', 'instagram', 'facebook', 'referral', 'manual', 'comment'
  source_detail text,                           -- show name, referrer name, post URL, etc.
  species_interest text[] default '{}',
  morph_preference text[] default '{}',
  price_tier text,                              -- 'budget', 'mid', 'high', 'premium'
  tags text[] default '{}',                     -- 'vip', 'repeat-buyer', 'waitlist', 'looky-loo', etc.
  lead_score integer default 0,                 -- Brianna #5: AI-calculated from conversation analysis
  buyer_intent text default 'unknown',          -- Brianna #5: 'unknown', 'browsing', 'interested', 'serious', 'ready_to_buy'
  notes text,
  opted_in_sms boolean default false,
  opted_in_email boolean default true,
  last_contacted_at timestamptz,
  city text,
  state text,
  zip text,
  -- Brianna #14: Buyer History Tracking
  total_purchases integer default 0,
  total_spent decimal(10,2) default 0,
  first_purchase_at timestamptz,
  last_purchase_at timestamptz,
  is_repeat_buyer boolean default false,
  -- Brianna #7: Animals they asked about (quick reference, detailed in animal_inquiries)
  animals_asked_about uuid[] default '{}'       -- array of animal IDs
);

-- Shows
create table shows (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid references breeders(id) on delete cascade not null,
  name text not null,
  location text,
  city text,
  state text,
  date_start date not null,
  date_end date,
  qr_code_url text,                             -- generated QR code image
  landing_page_slug text,                       -- unique slug for show-specific landing page
  leads_captured integer default 0,
  notes text
);

-- Conversations (inbox threads)
create table conversations (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid references breeders(id) on delete cascade not null,
  contact_id uuid references contacts(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  channel text not null,                        -- 'sms', 'email', 'instagram', 'facebook', 'morphmarket', 'website'
  subject text,
  status text default 'open',                   -- 'open', 'replied', 'closed', 'flagged'
  tags text[] default '{}',
  last_message_preview text,
  unread boolean default true,
  ai_draft text                                 -- AI-suggested reply
);

-- Messages (individual messages within conversations)
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  breeder_id uuid references breeders(id) on delete cascade not null,
  created_at timestamptz default now(),
  direction text not null,                      -- 'inbound', 'outbound'
  channel text not null,
  body text not null,
  media_urls text[] default '{}',
  status text default 'delivered',              -- 'pending', 'sent', 'delivered', 'failed'
  external_id text                              -- Twilio SID, Meta message ID, etc.
);

-- Deals
create table deals (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid references breeders(id) on delete cascade not null,
  contact_id uuid references contacts(id) on delete set null not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  animal_id uuid references animals(id) on delete set null,
  stage text not null default 'interested',     -- 'interested', 'deposit', 'paid', 'shipping', 'shipped', 'delivered', 'complete', 'lost'
  amount decimal(10,2),
  deposit_amount decimal(10,2),
  deposit_paid boolean default false,
  balance_paid boolean default false,
  stripe_invoice_id text,
  stripe_payment_link text,
  notes text,
  lost_reason text
);

-- Animals (inventory) — Each animal gets its own profile page (Brianna #4)
create table animals (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid references breeders(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  name text,                                    -- optional pet name ("Sunny", "Blaze")
  species text not null,
  morph text,
  sex text,                                     -- 'male', 'female', 'unsexed'
  age text,                                     -- 'baby', 'juvenile', 'sub-adult', 'adult'
  price decimal(10,2),
  status text default 'available',              -- 'available', 'on-hold', 'sold', 'not-for-sale', 'holdback'
  description text,
  personality text,                             -- Brianna #4: personality description for profile
  weight_grams integer,
  date_of_birth date,
  photos text[] default '{}',                   -- Supabase Storage URLs
  videos text[] default '{}',                   -- video clip URLs
  lineage text,                                 -- parent info
  feeding_status text,                          -- 'established', 'picky', etc.
  public boolean default true,                  -- show on public website?
  sold_to uuid references contacts(id) on delete set null,  -- who bought this animal
  sold_at timestamptz,
  sold_price decimal(10,2),                     -- actual sale price (may differ from listed)
  inquiry_count integer default 0,              -- how many people asked about this animal
  total_social_posts integer default 0,         -- Brianna #8: how many times posted
  total_engagement integer default 0            -- Brianna #8: total likes/comments across posts
);

-- Animal Inquiries — Tracks which customer asked about which animal (Brianna #7: Customer-Gecko Memory)
-- Solves "Do you still have that orange one?" problem
create table animal_inquiries (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid references breeders(id) on delete cascade not null,
  animal_id uuid references animals(id) on delete cascade not null,
  contact_id uuid references contacts(id) on delete cascade not null,
  created_at timestamptz default now(),
  source text,                                  -- 'message', 'comment', 'website', 'show', 'ai_detected'
  message_snippet text,                         -- the actual question/message about this animal
  interest_level text default 'browsing',       -- 'browsing', 'interested', 'serious', 'ready_to_buy' (Brianna #5)
  follow_up_needed boolean default true,
  followed_up_at timestamptz,
  notes text,
  unique(animal_id, contact_id)                 -- one inquiry record per contact per animal (updated on repeat)
);

-- Media Library — Organized folders for images, clips, music (Brianna: "folder with named images/clips")
create table media_assets (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid references breeders(id) on delete cascade not null,
  created_at timestamptz default now(),
  animal_id uuid references animals(id) on delete set null,  -- linked to specific animal, or null for general
  type text not null,                           -- 'photo', 'video', 'clip', 'broll', 'music'
  filename text not null,
  url text not null,                            -- Supabase Storage URL
  thumbnail_url text,                           -- for videos
  folder text default 'general',               -- 'animals', 'shows', 'facility', 'customers', 'broll', 'music', 'general'
  tags text[] default '{}',
  used_in_posts integer default 0,              -- how many social posts used this asset
  file_size_bytes integer,
  duration_seconds integer,                     -- for video/audio
  ai_generated boolean default false,           -- for AI-generated music/clips
  notes text
);

-- Purchase History — Full record of every sale (Brianna #14: Buyer History Tracking)
-- Separate from deals because deals track the pipeline; this is the permanent receipt
create table purchases (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid references breeders(id) on delete cascade not null,
  contact_id uuid references contacts(id) on delete set null not null,
  animal_id uuid references animals(id) on delete set null,
  deal_id uuid references deals(id) on delete set null,
  created_at timestamptz default now(),
  species text,
  morph text,
  amount decimal(10,2) not null,
  payment_method text,                          -- 'stripe', 'cash', 'venmo', 'zelle', 'paypal'
  source text,                                  -- 'show', 'online', 'local_pickup'
  show_id uuid references shows(id) on delete set null,
  notes text
);

-- Shipments
create table shipments (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid references breeders(id) on delete cascade not null,
  deal_id uuid references deals(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null not null,
  animal_id uuid references animals(id) on delete set null,
  created_at timestamptz default now(),
  species text not null,
  origin_zip text not null,
  destination_zip text not null,
  carrier text,                                 -- 'fedex', 'ups', 'ship_your_reptiles'
  service text,                                 -- 'priority_overnight', 'next_day_air', etc.
  status text default 'pending',                -- 'pending', 'approved', 'delayed', 'shipped', 'in_transit', 'delivered', 'issue'
  decision text,                                -- 'APPROVE', 'DELAY', 'HOLD'
  decision_reason text,
  ship_date date,
  original_ship_date date,
  tracking_number text,
  packing_instructions jsonb,                   -- heat packs, container type, etc.
  weather_data jsonb,                           -- cached weather at time of decision
  customer_notified boolean default false,
  delivered_at timestamptz,
  arrival_confirmed boolean default false
);

-- Follow-up Sequences
create table sequences (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid references breeders(id) on delete cascade not null,
  name text not null,                           -- 'Post-Show Welcome', 'New Animal Alert', 'Post-Purchase 1-Month', etc.
  trigger_type text not null,                   -- 'show_scan', 'new_contact', 'new_animal', 'manual', 'tag_added', 'purchase_complete', 'purchase_anniversary'
  trigger_value text,                           -- specific show ID, tag name, days after purchase, etc.
  active boolean default true,
  steps jsonb not null                          -- array of { delay_hours, channel, template_id, subject }
);

-- Sequence Enrollments (which contacts are in which sequences)
create table sequence_enrollments (
  id uuid primary key default gen_random_uuid(),
  sequence_id uuid references sequences(id) on delete cascade not null,
  contact_id uuid references contacts(id) on delete cascade not null,
  breeder_id uuid references breeders(id) on delete cascade not null,
  enrolled_at timestamptz default now(),
  current_step integer default 0,
  next_send_at timestamptz,
  status text default 'active',                 -- 'active', 'completed', 'paused', 'unsubscribed'
  unique(sequence_id, contact_id)
);

-- Social Posts — Now linked to animals for per-animal content tracking (Brianna #8)
create table social_posts (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid references breeders(id) on delete cascade not null,
  created_at timestamptz default now(),
  scheduled_for timestamptz,
  animal_id uuid references animals(id) on delete set null,   -- Brianna #8: which animal is featured
  category text,                                -- 'animal_spotlight', 'care_tips', 'behind_the_scenes', 'morph_education', 'customer_stories', 'seasonal', 'qa', 'for_sale'
  caption text not null,
  media_asset_ids uuid[] default '{}',          -- references to media_assets table
  image_url text,                               -- primary image (backward compat)
  video_url text,                               -- for video/reel posts
  platforms text[] default '{"instagram"}',     -- 'instagram', 'facebook', 'tiktok'
  post_type text default 'image',               -- 'image', 'carousel', 'reel', 'video'
  status text default 'draft',                  -- 'draft', 'pending_approval', 'approved', 'published', 'rejected'
  approved_via text,                            -- 'dashboard', 'sms'
  published_at timestamptz,
  external_post_id text,                        -- Instagram/Facebook post ID
  engagement jsonb,                             -- { likes, comments, shares, saves, reach, impressions }
  leads_generated integer default 0,            -- Brianna #10: how many leads came from this post's comments
  ai_suggestion_reason text                     -- Brianna #9: why AI suggested this post (e.g., "This gecko hasn't been posted in 2 weeks and has 3 inquiries")
);

-- Email/SMS Templates
create table templates (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid references breeders(id) on delete cascade not null,
  name text not null,
  channel text not null,                        -- 'email', 'sms'
  subject text,                                 -- email subject line
  body text not null,                           -- HTML for email, plain text for SMS
  variables text[] default '{}',                -- available merge variables
  category text                                 -- 'show', 'shipping', 'follow_up', 'marketing'
);

-- Waitlist
create table waitlist (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid references breeders(id) on delete cascade not null,
  contact_id uuid references contacts(id) on delete cascade not null,
  species text not null,
  morph_preference text,
  budget_max decimal(10,2),
  notes text,
  notified boolean default false,
  created_at timestamptz default now()
);

-- Activity Log (for reporting)
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid references breeders(id) on delete cascade not null,
  created_at timestamptz default now(),
  type text not null,                           -- 'lead_captured', 'message_sent', 'message_received', 'deal_created', 'deal_stage_changed', 'payment_received', 'shipment_approved', 'post_published', 'email_opened', 'email_clicked', 'sms_delivered'
  contact_id uuid references contacts(id) on delete set null,
  deal_id uuid references deals(id) on delete set null,
  metadata jsonb default '{}'                   -- extra data (amount, show name, etc.)
);

-- Breeder Website Pages (for "Your Website" module)
create table website_pages (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid references breeders(id) on delete cascade not null,
  page_type text not null,                      -- 'home', 'about', 'animals', 'contact', 'care_guide'
  title text not null,
  content jsonb not null,                       -- structured content blocks
  published boolean default true,
  sort_order integer default 0
);
```

### Indexes

```sql
create index idx_contacts_breeder on contacts(breeder_id);
create index idx_contacts_source on contacts(breeder_id, source);
create index idx_conversations_breeder on conversations(breeder_id);
create index idx_conversations_status on conversations(breeder_id, status);
create index idx_messages_conversation on messages(conversation_id);
create index idx_deals_breeder_stage on deals(breeder_id, stage);
create index idx_animals_breeder_status on animals(breeder_id, status);
create index idx_shipments_breeder_status on shipments(breeder_id, status);
create index idx_social_posts_scheduled on social_posts(breeder_id, status, scheduled_for);
create index idx_sequence_enrollments_next on sequence_enrollments(status, next_send_at);
create index idx_activity_log_breeder on activity_log(breeder_id, created_at);
create index idx_activity_log_type on activity_log(breeder_id, type);
create index idx_animal_inquiries_animal on animal_inquiries(animal_id);
create index idx_animal_inquiries_contact on animal_inquiries(contact_id);
create index idx_animal_inquiries_breeder on animal_inquiries(breeder_id);
create index idx_media_assets_breeder on media_assets(breeder_id, folder);
create index idx_media_assets_animal on media_assets(animal_id);
create index idx_purchases_breeder on purchases(breeder_id, created_at);
create index idx_purchases_contact on purchases(contact_id);
create index idx_social_posts_animal on social_posts(animal_id);
create index idx_contacts_buyer_intent on contacts(breeder_id, buyer_intent);
```

### Row Level Security

Every table gets RLS enabled. Policy pattern:

```sql
alter table [table] enable row level security;

-- Breeders can only see their own data
create policy "[table]_breeder_access" on [table]
  for all using (breeder_id = auth.uid());

-- Service role bypasses RLS (for cron jobs, webhooks)
```

---

## 5. Module Specifications

### Module 1: Show Lead Capture

**What it does:** Breeder creates a "show" in the dashboard. HatchKit generates a unique QR code. At the show, buyers scan the QR code on their phone, land on a branded page, enter their info. HatchKit saves them as a contact and immediately starts the post-show follow-up sequence.

**User flow:**
1. Breeder goes to Leads > Shows > "Add Show"
2. Enters show name, date, location
3. HatchKit generates a QR code and a unique landing page URL (e.g., `hatchkit.ai/scan/sunscale-geckos/southeast-reptile-expo-2026`)
4. Breeder downloads/prints the QR code
5. At the show, buyer scans QR code on their phone
6. Buyer lands on a branded page: breeder's logo, "Thanks for stopping by [Business Name]!" with fields for name, email, phone, species interest
7. Buyer submits → saved as contact with `source: 'show'`, `source_detail: [show name]`, tagged with species interest
8. Buyer gets instant SMS: "Hey [Name]! Thanks for stopping by [Business] at [Show]. We'll send you some updates on [species]. Reply STOP anytime."
9. Contact is auto-enrolled in the post-show follow-up sequence
10. Breeder sees lead count updating in real-time on their dashboard (even at the show on their phone)

**QR Code generation:** Use `qrcode` npm package. Generate as PNG, store in Supabase Storage. Include breeder logo in center of QR code.

**Landing page:** Server-rendered public page at `/scan/[breeder-slug]/[show-slug]`. Styled with breeder's brand colors. Mobile-first (100% of scans are on phones).

**GPS check-in:** Optional. When breeder opens their dashboard at the show, prompt for location permission. Log lat/lon with the show record so we know which leads came from physically being at that show vs. the QR being shared online.

**Tier access:**
- Starter: QR codes, instant follow-up, basic tagging
- Growth: + tag across multiple shows, GPS check-in
- Pro: same as Growth

---

### Module 2: Smart Shipping

**What it does:** When a breeder needs to ship an animal, they enter the shipment details. HatchKit checks the weather along the entire route (origin → carrier hub → destination), compares against the species' safe temperature range, and makes a ship/hold/delay decision. If held, it automatically texts the buyer.

**IMPORTANT:** The shipping agent already exists at `agents/shipping-agent/`. Migrate this code into the app. Do NOT rebuild from scratch. The existing code uses:
- `integrations/weather-api.js` for weather data
- `data/species-db.json` for temperature tolerances
- `data/carrier-hubs.json` for hub locations
- Claude API for decision-making with rule-based fallback

**User flow:**
1. Breeder goes to Shipping > "New Shipment"
2. Selects contact (auto-fills destination from contact record)
3. Selects animal (auto-fills species)
4. Selects carrier (FedEx or UPS)
5. Clicks "Check Weather & Get Decision"
6. HatchKit runs the shipping agent:
   - Fetches 5-day weather forecast for origin, destination, and carrier hub
   - Compares against species temperature tolerances
   - Returns APPROVE, DELAY, or HOLD with reasoning
7. Decision displays with:
   - Ship/Hold recommendation with reason
   - Packing instructions (heat packs, container type)
   - Valid ship days (Mon/Tue/Wed only)
   - Customer message preview
8. Breeder clicks "Approve & Notify Buyer" or "Override"
9. If approved: buyer gets SMS with ship date and tracking (once entered)
10. If delayed/held: buyer gets SMS explaining the hold with estimated new date
11. After delivery: buyer gets follow-up SMS asking to confirm safe arrival

**Shipping rules (non-negotiable, from existing system prompt):**
- Ship days: Monday, Tuesday, Wednesday ONLY
- Carriers: FedEx Priority Overnight or UPS Next Day Air ONLY
- Temperature thresholds: per species from species-db.json
- Must check ALL points: origin, hub, destination
- If ANY point is unsafe, HOLD

**Tier access:**
- Starter: not included
- Growth: full shipping module
- Pro: full shipping module

---

### Module 3: One Inbox

**What it does:** All messages from all channels show up in one unified inbox. Each contact has a single conversation thread regardless of which channel they messaged from. AI drafts replies.

**Channels to support (in priority order):**
1. **SMS/Text** (Twilio) — Phase 1
2. **Email** (Resend inbound webhooks) — Phase 1
3. **Instagram DMs** (Meta Graph API) — Phase 2
4. **Facebook Messenger** (Meta Graph API) — Phase 2
5. **MorphMarket messages** — Phase 3 (may need scraping or partnership)

**User flow:**
1. Breeder opens Inbox
2. Sees list of conversations sorted by most recent, with unread indicators
3. Each conversation shows: contact name, channel icon, preview of last message, time
4. Clicks into conversation → sees full thread across all channels with that contact
5. Below the thread, AI has drafted a reply based on the conversation context
6. Breeder can: send the AI draft as-is, edit it, or write their own reply
7. Breeder selects reply channel (SMS, email, etc.) and sends
8. New inbound messages from unknown numbers/emails auto-create a contact

**AI Draft Replies (Brianna #2: AI Question Responder):**
- Use Claude claude-sonnet-4-5-20250514 to generate draft replies
- System prompt includes: breeder's brand voice, species expertise, common Q&A, pricing info, animal inventory
- Draft appears in a styled "AI Suggestion" box — breeder taps to use or dismisses
- AI automatically answers common reptile questions: care, feeding, enclosure size, shipping policy, pricing
- On Pro tier: AI can auto-respond to common questions without breeder approval
- AI response knowledge base includes: species care sheets, the breeder's specific animals/prices, shipping policy, and common breeder Q&A

**AI Buyer Interest Detection (Brianna #5):**
- Every time a message comes in, Claude analyzes the conversation and scores buyer intent
- Categories: `browsing` (just curious), `interested` (asking questions), `serious` (asking about price/availability), `ready_to_buy` (asking how to pay/ship)
- Updates `buyer_intent` field on contact record
- Breeder sees a badge on each conversation: "Browser", "Interested", "Serious Buyer", "Ready to Buy"
- AI explains WHY it scored them that way (e.g., "Asked about price twice and requested shipping info")
- Serious/ready_to_buy contacts get flagged for priority follow-up

**Customer-Animal Memory (Brianna #7):**
- When AI detects an animal being discussed in a conversation, it auto-links the contact to that animal in `animal_inquiries`
- When a breeder opens a contact, they see: "Asked about: [Sunset gecko photo] on March 3, [Blaze ball python photo] on Feb 18"
- When a breeder opens an animal, they see: "3 people asked about this animal" with names and last message
- Solves the "Do you still have that orange one?" problem — breeder can see exactly which animal the person means

**Social Comment Lead Capture (Brianna #10):**
- Monitor comments on published Instagram/Facebook posts via Meta Graph API webhooks
- When someone comments with buying intent ("How much?", "Is this available?", "DM me"), AI detects it
- Auto-reply to comment: "Just sent you a DM with all the details!"
- Auto-DM the person with animal details, price, and a link to the breeder's contact form (captures email/phone)
- If they provide email/phone, create a contact with `source: 'comment'` and `source_detail: [post URL]`
- Track `leads_generated` on the social_posts record

**Realtime:** Use Supabase Realtime subscriptions so new messages appear instantly without refresh.

**Tier access:**
- Starter: email + SMS only, no AI features
- Growth: all channels, AI drafts, buyer interest detection, customer-animal memory
- Pro: all channels, AI auto-response, comment lead capture, auto-DM

---

### Module 4: Automatic Follow-Up

**What it does:** Automated email and SMS sequences that trigger based on events (show scan, new contact, new animal listed, etc.). Breeders can customize the templates or use defaults.

**Default sequences (pre-built for every new breeder):**

1. **Post-Show Welcome** (triggers on show QR scan)
   - Immediate: SMS confirmation ("Thanks for stopping by!")
   - Day 1: Email — Welcome + featured animals (use existing `show-welcome.html` template)
   - Day 3: Email — Featured animals spotlight (use existing `day3-featured-animals.html`)
   - Day 7: Email — Care guide for their species of interest (use existing `day7-care-guide.html`)
   - Day 14: Email — Special offer / reminder (use existing `day14-special-offer.html`)

2. **New Animal Alert** (triggers when breeder lists new animal matching contact's species interest)
   - Immediate: SMS — "[Business] just listed a new [species]! Check it out: [link]"
   - 2 hours: Email with photo, description, price, and buy/inquire link

3. **Post-Purchase / Shipping** (triggers when deal moves to "shipped")
   - Use existing templates from `agents/shipping-agent/prompts/customer-comms.md`
   - Shipping confirmed, in transit, delivery confirmation, care tips

4. **Re-engagement** (triggers when contact hasn't been active in 60 days)
   - Email: "Hey [Name], it's been a while! Here's what's new at [Business]..."

5. **Post-Purchase: 1-Month Check-In** (Brianna: "1 mo after — check up, food replenish offer")
   - triggers 30 days after `purchase_complete`
   - SMS: "Hey [Name]! How's [Animal Name] settling in? Any questions?"
   - Email: 1-month care check-in + feeder/supply restock link + "Need anything? Just reply."

6. **Post-Purchase: 6-Month Upgrade** (Brianna: "6mo after — tank upgrade")
   - triggers 180 days after `purchase_complete`
   - Email: "[Animal Name] is growing! Here's our guide to upgrading their enclosure" + recommended products
   - SMS: "Hey [Name], [Animal Name] might be ready for a bigger setup! We put together some tips for you: [link]"

7. **Post-Purchase: 1-Year Anniversary** (Brianna: "1 yr after — coupon/special offer")
   - triggers 365 days after `purchase_complete`
   - Email: "Happy 1 year with [Animal Name]! Here's a special offer as a thank you" + discount code for next purchase
   - SMS: "Happy 1 year anniversary with [Animal Name]! We have a special deal for you as a thank you: [link]"

8. **Looky-Loo Conversion (Brianna #15)** (triggers when AI marks contact as `browsing` for 7+ days)
   - Day 7: Email — care guide for species they asked about (builds trust, shows expertise)
   - Day 10: SMS — "Hey [Name], just wanted to check if you had any questions about [species]. Happy to help!"
   - Day 14: Email — featured available animals matching their interest + "No pressure, just keeping you posted"
   - Day 21: SMS — social proof ("We just shipped a [species] to a happy customer in [State]!")
   - Day 30: Email — special offer / first-time buyer discount
   - Goal: convert browsers to buyers through education and gentle follow-up

**Sequence builder UI:**
- Visual step-by-step builder
- Each step: delay (hours/days), channel (email/SMS), template selection
- Test/preview before activating
- See enrollment stats (how many contacts in each sequence, open rates, click rates)

**How scheduled sends work:**
- Vercel Cron job runs every 15 minutes
- Queries `sequence_enrollments` where `status = 'active'` AND `next_send_at <= now()`
- Sends the message, advances `current_step`, calculates `next_send_at`
- If last step completed, sets `status = 'completed'`

**Tier access:**
- Starter: 5 sequences max, email only
- Growth: unlimited sequences, email + SMS, new animal alerts, referral tracking
- Pro: + A/B testing on subject lines and send times

---

### Module 5: Animal Profiles (Brianna #4, #7, #8)

**What it does:** Every animal gets its own rich profile page — not just an inventory listing. The profile tracks who asked about it, what social posts featured it, and its complete history. This is the "gecko memory" that lets breeders never lose track of interest.

**Animal profile includes:**
1. **Identity:** Name, species, morph, sex, age, date of birth, weight, lineage
2. **Photos & Videos:** Gallery with media from `media_assets`, drag-to-reorder, set primary photo
3. **Personality:** Free-text description ("Friendly eater, loves to climb, great with handling")
4. **Pricing:** Listed price, status (available/on-hold/sold)
5. **Feeding status:** Established, picky, etc.
6. **Who asked about this animal (Brianna #7):** List of contacts from `animal_inquiries` — name, date, what they said, buyer intent level
7. **Social media history (Brianna #8):** Every post that featured this animal, with engagement metrics. Total posts, total reach, total engagement.
8. **Sale history:** If sold — who bought it, when, for how much, linked deal

**Key interactions:**
- From an animal profile, breeder can: "Message everyone who asked about this animal" (one-click bulk outreach)
- From an animal profile, breeder can: "Create a post about this animal" (pre-fills AI with animal details)
- When an animal is marked "sold": auto-updates inventory, creates purchase record, notifies waitlist for similar morphs
- When an animal is marked "available": auto-triggers "New Animal Alert" sequence to matching contacts

**Public animal profile page (on breeder website):**
- `/[breeder-slug]/animals/[animal-id]`
- Shows: photos, morph, sex, age, personality, price, availability status
- "I'm Interested" button → captures lead (name, email, phone, species interest)
- Does NOT show who else asked about it (private to breeder)

**Inventory sync (Brianna: "every sale goes into sheets for inventory tracking"):**
- When a deal is marked `complete`, the animal's status auto-updates to `sold`
- Purchase record auto-created in `purchases` table
- Contact's `total_purchases`, `total_spent`, `last_purchase_at` auto-updated
- Activity log entry created for reporting
- CSV export of all animals (current inventory + sales history)

**Tier access:**
- Starter: basic animal list (name, species, morph, price, status)
- Growth: full animal profiles with inquiry tracking, media, social history
- Pro: same as Growth + AI-powered "which animal should I post/promote" suggestions

---

### Module 6: Deal Tracker + Purchase History (Brianna #14)

**What it does:** Kanban-style board showing every deal at a glance. Stages: Interested → Deposit → Paid → Shipping → Shipped → Delivered → Complete (and Lost). Plus full purchase history for recognizing repeat buyers.

**User flow:**
1. Breeder opens Deals
2. Sees columns for each stage with deal cards
3. Each card shows: contact name, animal/morph, amount, days in stage
4. Drag-and-drop to move deals between stages
5. Click card to see full details: contact info, conversation history, payments, shipment status
6. "Send Invoice" button → generates Stripe payment link → sends to buyer via SMS/email
7. When Stripe payment webhook fires → deal auto-advances to next stage
8. When shipment is created → deal auto-advances to "Shipping"

**Invoice / Payment flow:**
- Breeder clicks "Send Invoice" on a deal
- Enters amount (or auto-filled from animal price)
- HatchKit creates a Stripe Payment Link
- Sends SMS + email to buyer with payment link
- Stripe webhook fires on payment → updates deal stage, logs in activity

**Waitlist (for upcoming clutches):**
- Breeder creates a waitlist entry: species, morph, expected date
- Public on breeder's website: "Join the waitlist for [morph] [species]"
- When breeder marks animals as available, everyone on matching waitlist gets notified

**Purchase History (Brianna #14: Buyer History Tracking):**
- Every completed deal creates a permanent record in the `purchases` table
- Contact profile shows: "2 purchases, $1,400 total, last purchase March 2026"
- Repeat buyers auto-tagged as `repeat-buyer` and `vip`
- Breeder sees a badge: "Returning Customer" when repeat buyer messages
- Purchase history exportable to CSV (Brianna: "every sale goes into sheets")
- Post-purchase lifecycle sequences auto-trigger (1-month, 6-month, 1-year)

**Tier access:**
- Starter: contact list only (no deal board)
- Growth: full deal tracker + invoicing + waitlist + purchase history
- Pro: same as Growth

---

### Module 7: Auto Social Posts

**What it does:** AI generates social media posts in the breeder's voice. Posts rotate through 8 categories. Breeder approves via dashboard or SMS before posting.

**Content categories (from existing templates):**
1. Animal Spotlight — showcase a specific animal
2. Care Tips — species-specific care advice
3. Behind the Scenes — day in the life, facility, feeding
4. Morph Education — genetics, morph explanations
5. Customer Stories — happy buyer testimonials
6. Seasonal — breeding season updates, hatchling announcements
7. Q&A — common questions answered
8. For Sale — direct sales posts with pricing

**How it works:**
1. Sunday night cron job generates the week's posts using Claude
2. AI uses: breeder's brand voice, species list, current animal inventory, show schedule, season
3. Posts saved with `status: 'pending_approval'`
4. Breeder gets SMS Monday morning: "Your social posts for the week are ready! Reply 1 to see them."
5. For each post, breeder replies: "1" to approve, "2" to skip, or sends edit text
6. Approved posts publish at scheduled times via Meta Graph API
7. Dashboard shows full post calendar with engagement stats

**Per-Animal Content Tracker (Brianna #8):**
- Every social post links to the `animal_id` it features
- Animal profile page shows: "Posted 3 times — Last posted March 10 — 847 total engagement"
- Dashboard widget: "Animals that haven't been posted recently" — sorted by days since last post
- After a post publishes, cron job fetches engagement metrics via Meta Graph API and updates:
  - `social_posts.engagement` (likes, comments, shares, saves, reach)
  - `animals.total_social_posts` (increment)
  - `animals.total_engagement` (sum of all post engagement)

**Post Suggestion Engine (Brianna #9):**
- AI analyzes all animals and recommends which one to post next based on:
  1. **Hasn't been posted recently** — animals that haven't had a post in 2+ weeks
  2. **High inquiry count** — animals with many inquiries (demand signal)
  3. **New/just listed** — recently added animals need visibility
  4. **Price point rotation** — mix of budget and premium animals
  5. **High engagement history** — animals whose past posts performed well
  6. **Status = available** — don't promote sold animals
- Each AI-generated post includes `ai_suggestion_reason` explaining why this animal was chosen
- Dashboard shows: "Suggested next post: [Gecko Name] — hasn't been posted in 18 days, 5 people asked about similar morphs"

**Media Library (Brianna: "folder with named images, clips, music"):**
- Organized media management with folders: Animals, Shows, Facility, Customers, B-Roll, Music
- Each animal has a media tab on its profile showing all photos/videos
- Drag-and-drop upload with auto-tagging to the right animal
- When generating social posts, AI pulls from the media library automatically
- Breeder can upload b-roll clips; long-term: AI stitches b-roll into reels with captions
- Stores in Supabase Storage with metadata in `media_assets` table

**Image handling:**
- For animal spotlights and for-sale posts: pull from animal's media library automatically
- For other categories: pull from appropriate folder or breeder uploads
- AI selects best photo based on: not recently used, good engagement on past uses
- Long-term: AI-generated music for reels (Brianna), AI video editing for b-roll → reel conversion

**Tier access:**
- Starter: template library (DIY — no AI generation), basic media library
- Growth: AI-written posts 3/week, breeder approves, rotates 8 categories, content tracker, media library
- Pro: daily AI posts, auto-publish to Instagram/Facebook, approve via SMS, post suggestion engine, comment lead capture

---

### Module 8: Your Website

**What it does:** Every Growth/Pro breeder gets a professional website at `hatchkit.ai/[slug]` (or their own custom domain). Shows available animals, about info, contact form.

**Pages:**
1. **Home** — Hero with business name/logo, tagline, featured animals, CTA to contact
2. **Available Animals** — Gallery grid. Each card: photo, species, morph, sex, price, status badge. Click for detail page.
3. **About** — Breeder story, what they breed, how long they've been breeding
4. **Contact** — Form (name, email, phone, species interest, message). Submissions create new contact in HatchKit.
5. **Care Guides** (optional) — Blog-style care sheets

**Styling:** Uses breeder's brand colors and logo. Clean, mobile-first design. Every breeder gets the same layout but with their branding.

**Custom domains:** Growth/Pro breeders can point their own domain. Use Vercel's domain management API.

**SEO:** Each breeder website includes proper meta tags, structured data (LocalBusiness schema), and sitemap.

**Tier access:**
- Starter: not included
- Growth: full website with custom domain
- Pro: same as Growth

---

### Module 9: Media Library (Brianna: "folder with named images/clips/music")

**What it does:** Organized media management for all breeder content — photos, videos, b-roll clips, and music. Every asset is tagged to an animal, folder, and content type. Powers the social post engine and breeder website.

**User flow:**
1. Breeder opens Media Library
2. Sees folders: Animals, Shows, Facility, Customers, B-Roll, Music, General
3. Can upload via drag-and-drop (mobile: camera roll picker)
4. Each upload auto-detects type (photo/video) and prompts: "Which animal is this?" + "Add to folder"
5. Animal folder auto-populates from all media tagged to that animal
6. Breeder can browse, search, tag, rename, and delete assets

**Integration with other modules:**
- **Social Posts:** AI pulls from media library when generating posts. Breeder can also manually select.
- **Animal Profiles:** Animal's media tab shows all photos/videos from library
- **Breeder Website:** Available animals gallery pulls primary photos from library
- **Inbox:** Breeder can quickly attach a photo from library when replying to buyer

**B-Roll & Video (future — Brianna: "builds b-roll clips for me to add voiceover/captions"):**
- Breeder uploads raw b-roll clips to B-Roll folder
- Long-term: AI stitches clips into Instagram Reels with:
  - Auto-generated captions (from animal profile data)
  - Background music (from Music folder or AI-generated)
  - Breeder adds voiceover via mobile app
- MVP: just organized storage. Phase 3+: AI video editing.

**AI Music (future — Brianna: "robot that generates AI music"):**
- Generate royalty-free background music for reels/videos
- Store in Music folder
- Phase 4+ feature

**Tier access:**
- Starter: basic media upload (10GB storage)
- Growth: full media library with folders, auto-tagging, 50GB storage
- Pro: 200GB storage, b-roll builder (when available), AI music (when available)

---

### Module 10: Your Numbers

**What it does:** Analytics dashboard showing what's working. Built from the `activity_log` table.

**Dashboard cards:**
- Total leads (this month vs. last month)
- Leads by source (show, website, Instagram, Facebook, MorphMarket, comments, referral) — Brianna #12
- Lead-to-sale conversion rate (overall + by source, so breeders know which platform works best)
- Revenue (this month, this quarter, this year)
- Sales by species/morph
- Sales by show (which shows are worth attending?)
- Average deal value
- Top-performing follow-up sequences (open rate, reply rate)
- Shipping stats (on-time rate, hold rate, carrier comparison)
- Repeat buyer rate (Brianna #14)
- Social media metrics per animal (Brianna #8: which animals get the most attention)
- Lead magnet capture rate (Brianna: "lead magnet automated — records metrics of captures")
- Looky-loo conversion rate (Brianna #15: how many browsers became buyers)

**Tier access:**
- Starter: basic lead count and source breakdown
- Growth: not included (leads + deals visible on their respective pages)
- Pro: full analytics dashboard with all metrics, date range filters, CSV export

---

## 6. Dashboard Home (Today's Overview)

When a breeder logs in, they see a single-screen overview of what needs attention today (Brianna #13: Daily Breeder Dashboard):

1. **Unread messages** — count with link to inbox, with buyer intent badges (Brianna #5)
2. **Serious buyers to respond to** — contacts flagged as `serious` or `ready_to_buy` needing a reply (priority!)
3. **Follow-up reminders** — contacts to follow up with today (Brianna #6)
4. **Deals needing action** — deposits to follow up on, shipments to approve
5. **Pending social posts** — posts awaiting approval + AI suggestion for today's post (Brianna #9)
6. **Today's shipments** — what's going out today
7. **New leads** — leads captured today/this week with source breakdown
8. **Animals needing attention** — animals not posted recently, animals with high inquiry count but no post
9. **Quick stats** — leads this month, revenue this month, reply rate, conversion rate

---

## 7. Build Phases

### Phase 1: MVP (Build First — 3 Breeders Waiting)

The MVP must deliver the core value proposition: **capture leads at shows, follow up automatically, remember who asked about what, and stop losing sales.**

Build in this order:
1. **Auth + Breeder onboarding** (Supabase Auth, breeder profile setup)
2. **Dashboard layout** (sidebar nav, responsive, mobile-first, daily overview)
3. **Contacts + Lead Profiles** (CRUD, import, tagging, search, buyer intent badge — Brianna #3)
4. **Animal Profiles** (CRUD, photos, personality, status — Brianna #4)
5. **Customer-Animal Memory** (track who asked about what — Brianna #7)
6. **Show Lead Capture** (QR codes, scan landing page, instant SMS)
7. **Automatic Follow-Up** (sequence engine, default post-show sequence, email via Resend, SMS via Twilio)
8. **Basic Inbox** (SMS + email, conversation threads, send replies)
9. **AI Question Responder** (auto-draft replies to common questions — Brianna #2)
10. **Deal Tracker** (Kanban board, drag-and-drop, basic deal management)
11. **Follow-Up Reminders** (breeder gets reminded to follow up with people who went cold — Brianna #6)
12. **Settings** (account info, plan display, Stripe billing portal link)

**Phase 1 gets the first 3 breeders live and paying.** It includes the features Brianna said she needs most: unified inbox, AI responder, lead profiles, animal profiles, customer-animal memory, and follow-up reminders.

### Phase 2: Growth Features

13. **AI Buyer Interest Detection** (conversation analysis, intent scoring — Brianna #5)
14. **Looky-Loo Conversion System** (automated browser → buyer nurture — Brianna #15)
15. **Smart Shipping** (migrate existing agent, weather checks, buyer notifications)
16. **Media Library** (organized folders for photos, videos, clips — Brianna's folder system)
17. **Invoicing + Purchase History** (Stripe payment links, auto-advance deals, repeat buyer tracking — Brianna #14)
18. **Post-Purchase Lifecycle Sequences** (1-month check-in, 6-month upgrade, 1-year anniversary — Brianna's GHL gaps)
19. **AI Draft Replies** (Claude-powered inbox suggestions with breeder's voice)
20. **Breeder Websites** (public pages, animal profiles, contact form)

### Phase 3: Pro Features

21. **Auto Social Posts + Content Tracker** (AI generation, per-animal tracking — Brianna #8)
22. **Post Suggestion Engine** (AI recommends which animal to post next — Brianna #9)
23. **Social Comment Lead Capture** (turn comments into leads — Brianna #10)
24. **Customer Education Automation** (auto-send care guides on common questions — Brianna #11)
25. **Full Analytics Dashboard** (all metrics, source tracking, lead magnet metrics — Brianna #12)
26. **AI Auto-Response** (Pro tier — AI handles common questions autonomously)
27. **Instagram/Facebook DM inbox integration**
28. **Sales Source Tracking** (which platforms produce the most sales — Brianna #12)

### Phase 4: Scale

29. **B-Roll & Video Builder** (stitch clips into reels with captions — Brianna's GHL gap)
30. **AI Music Generation** (royalty-free background music for reels — Brianna's GHL gap)
31. **A/B Testing** (subject lines, send times for follow-up sequences)
32. **MorphMarket message integration**
33. **Referral tracking and rewards**
34. **Custom domain support**
35. **Multi-species / multi-location (Pro)**
36. **Mobile app (React Native or PWA)**

---

## 8. Existing Code Migration Guide

These files already exist in the `C:\Users\wallg\OneDrive\Desktop\HatchKit\` directory and should be migrated into the new app:

| Existing File | Migrate To | Notes |
|---|---|---|
| `agents/shipping-agent/index.js` | `lib/shipping/agent.ts` | Convert to TypeScript, replace GHL calls with Supabase |
| `agents/shipping-agent/prompts/system.md` | `lib/shipping/prompts/system.md` | Use as-is |
| `agents/shipping-agent/prompts/customer-comms.md` | `lib/shipping/prompts/customer-comms.md` | Use as-is |
| `integrations/weather-api.js` | `lib/weather/index.ts` | Convert to TypeScript |
| `integrations/meta-graph.js` | `lib/social/meta-graph.ts` | Convert to TypeScript |
| `data/species-db.json` | Seed into Supabase OR keep as JSON in `lib/shipping/data/` | Start with JSON, migrate to DB table later for admin editing |
| `data/carrier-hubs.json` | `lib/shipping/data/carrier-hubs.json` | Use as-is |
| `templates/emails/*.html` | Seed into `templates` table per breeder | Convert variable placeholders to match our merge variable system |
| `templates/sms/*.txt` | Seed into `templates` table per breeder | Same |
| `data/clients.json` | Reference for seed data structure | Use SunScale Geckos as the demo/seed breeder |

---

## 9. Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic (Claude AI)
ANTHROPIC_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Resend (email)
RESEND_API_KEY=

# OpenWeatherMap
OPENWEATHER_API_KEY=

# Meta (Instagram/Facebook)
META_APP_ID=
META_APP_SECRET=
```

---

## 10. UI/UX Guidelines

- **Mobile-first.** Breeders use their phones at shows. The dashboard must be fully usable on mobile.
- **Dark sidebar, light content area.** Sidebar: #111111 background. Content: #F5F5F0 or white.
- **Brand colors:** Primary green #1B5E20, accent orange #FF6F00, dark #111111, light bg #F5F5F0.
- **Fonts:** Plus Jakarta Sans for headings (weight 700-800), DM Sans for body text.
- **Keep it simple.** These users are not technical. Every action should be obvious. No jargon. Label buttons with what they do ("Send Invoice", not "Generate Payment Link").
- **Fast.** Server components where possible. Optimistic updates for drag-and-drop. Skeleton loaders.
- **Notifications via SMS.** Breeders check texts more than email. Critical notifications (new lead, payment received, shipment decision) should text them.

---

## 11. Non-Functional Requirements

- **Multi-tenant security:** RLS on every table. No breeder can ever see another breeder's data.
- **Rate limiting:** API routes rate-limited (especially public scan endpoints).
- **Encryption:** Meta access tokens and Stripe keys stored encrypted.
- **Backup:** Supabase point-in-time recovery enabled.
- **Monitoring:** Log errors to Vercel. Alert on failed SMS/email sends, failed webhook deliveries.
- **GDPR/Privacy:** Contact opt-out honored immediately. Unsubscribe stops all automated messages. Data export available on request.

---

## 12. Success Metrics

For the first 3 breeders, within 90 days:
- Each breeder captures 50+ leads at their next show using QR codes
- Follow-up sequences achieve >30% open rate on emails
- At least 10% of captured leads convert to a sale or deposit
- Breeders reply to inbox messages 5x faster than before
- Each breeder's setup fee is recouped (for the money-back guarantee)

---

## 13. Breeder-Validated Feature Map

This section documents the mapping between real breeder feedback (Brianna, YetiGex — March 16, 2026) and the PRD. Every feature she requested is accounted for.

| # | Brianna's Feature | PRD Module | Status |
|---|---|---|---|
| 1 | Unified Message Inbox | Module 3: One Inbox | Covered |
| 2 | AI Question Responder | Module 3: AI Draft Replies + Auto-Response | Covered |
| 3 | Customer Lead Profiles | Contacts table + buyer intent field | Covered |
| 4 | Gecko Profile Pages | Module 5: Animal Profiles (NEW) | Added |
| 5 | Buyer Interest Detection | Module 3: AI Buyer Interest Detection (NEW) | Added |
| 6 | Follow-Up Reminder System | Module 4: Automatic Follow-Up + Dashboard reminders | Covered |
| 7 | Customer-Gecko Memory | animal_inquiries table (NEW) + contact.animals_asked_about | Added |
| 8 | Content Tracker for Each Gecko | social_posts.animal_id + animals.total_social_posts (NEW) | Added |
| 9 | Post Suggestion Engine | Module 7: Post Suggestion Engine (NEW) | Added |
| 10 | Lead Capture from Comments | Module 3: Social Comment Lead Capture (NEW) | Added |
| 11 | Customer Education Automation | Module 4: Care guide sequences + AI auto-send | Covered |
| 12 | Sales Source Tracking | Module 10: Your Numbers + contacts.source | Covered |
| 13 | Daily Breeder Dashboard | Dashboard Home (enhanced) | Covered |
| 14 | Buyer History Tracking | purchases table (NEW) + contact purchase fields | Added |
| 15 | Looky-Loo Conversion System | Module 4: Looky-Loo Conversion sequence (NEW) | Added |

**Brianna's GHL Gaps (also addressed):**

| Gap | PRD Solution | Status |
|---|---|---|
| 1-year post-purchase coupon/offer | Sequence #7: 1-Year Anniversary | Added |
| 1-month post-purchase check-up + food offer | Sequence #5: 1-Month Check-In | Added |
| 6-month tank upgrade offer | Sequence #6: 6-Month Upgrade | Added |
| Folder with named images | Module 9: Media Library | Added |
| Folder with named clips | Module 9: Media Library (video type) | Added |
| Folder with AI-generated music | Module 9: Media Library (music type, Phase 4) | Added |
| Robot that generates AI music | Phase 4: AI Music Generation | Added |
| B-roll clip builder for voiceover/captions | Phase 4: B-Roll & Video Builder | Added |
| Every sale → sheets for inventory tracking | Module 5: Inventory sync + purchases table + CSV export | Added |
| Lead magnet automated with metrics | Module 1: Lead Capture + Module 10: capture rate metrics | Covered |
| Automated DM replies | Module 3: AI Auto-Response (Pro tier) | Covered |
| Automated shipping updates | Module 2: Smart Shipping notifications | Covered |

---

## 14. What to Build First (Immediate Next Session)

Start Claude Code with this prompt:

> Build HatchKit Phase 1. Create a new Next.js 15 app with Supabase Auth and the full database schema from HATCHKIT_PRD.md (all tables including animal_inquiries, media_assets, and purchases). Build a mobile-first dashboard with: sidebar navigation, daily overview home page, contacts page with lead profiles and buyer intent badges, animal profiles with customer-animal memory (who asked about what), show lead capture (QR codes + scan landing pages), basic inbox (SMS via Twilio + email via Resend) with AI draft replies, automatic follow-up sequences with default post-show sequence, deal tracker (Kanban board), and follow-up reminders. Use the tech stack, database schema, and UI guidelines from HATCHKIT_PRD.md. The app should be at `C:\Users\wallg\OneDrive\Desktop\HatchKit\hatchkit-app\`.
