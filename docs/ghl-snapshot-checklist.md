# HatchKit — GHL Snapshot Checklist

Everything the snapshot sub-account must contain before exporting.
Use this as a checklist when building or verifying a snapshot.

---

## Pipelines (3)

- [ ] **Lead Pipeline** — "HatchKit - Lead Pipeline"
  - Stages: New Lead → Contacted → Interested → Qualified → Customer → Lost
- [ ] **Sales Pipeline** — "HatchKit - Sales Pipeline"
  - Stages: Animal Selected → Invoice Sent → Payment Received → Shipping Scheduled → Shipped → Delivered → Follow-Up Complete
- [ ] **Shipping Pipeline** — "HatchKit - Shipping Pipeline"
  - Stages: Pending Review → Weather Check → Approved to Ship → Label Created → Dropped Off → In Transit → Delivered → LAG Confirmed → Complete

---

## Custom Contact Fields (10)

- [ ] Species Interest (Dropdown: Leopard Gecko, Ball Python, Crested Gecko, Bearded Dragon, Corn Snake, Other)
- [ ] Morph Preference (Text)
- [ ] Price Tier (Dropdown: Budget ($25-75), Mid-Range ($75-250), Premium ($250-750), Designer ($750+))
- [ ] Shipping Preference (Dropdown: Ship to Home, Hold at FedEx, Local Pickup, Show Pickup)
- [ ] Temperature Tolerance Min (Number)
- [ ] Temperature Tolerance Max (Number)
- [ ] Show Source (Dropdown: NARBC Arlington, Tinley Park, Hamburg, Southeast Reptile Expo, Reptile Super Show, Online, Referral, Other)
- [ ] Lead Score (Number)
- [ ] Last Show Attended (Text)
- [ ] Shipping Status (Dropdown: Not Started, Pending Weather Check, Approved to Ship, Label Created, In Transit, Delivered, LAG Confirmed)

---

## Forms (2)

- [ ] **Show QR Lead Capture Form**
  - Fields: First Name, Last Name, Email, Phone, Species Interest (dropdown), Show Name (hidden/pre-filled)
  - On submit: Webhook to `/webhooks/ghl/form-submission`
  - Style: Mobile-first, breeder's brand colors

- [ ] **Website Contact Form**
  - Fields: First Name, Last Name, Email, Phone, Species Interest (dropdown), Message (textarea)
  - On submit: Create contact, add tag `source:website`
  - Style: Clean, matches breeder website

---

## Email Templates (6)

- [ ] **Show Welcome** (`show-welcome.html`)
  - Used in: Post-Show Drip (Day 1)
  - Variables: {{business_name}}, {{owner_first_name}}, {{show_name}}, {{species_interest}}

- [ ] **Day 3 Featured Animals** (`day3-featured-animals.html`)
  - Used in: Post-Show Drip (Day 3)
  - Variables: {{business_name}}, {{animal_name}}, {{animal_photo}}, {{animal_price}}

- [ ] **Day 7 Care Guide** (`day7-care-guide.html`)
  - Used in: Post-Show Drip (Day 7)
  - Variables: {{business_name}}, {{species_interest}}

- [ ] **Day 14 Special Offer** (`day14-special-offer.html`)
  - Used in: Post-Show Drip (Day 14)
  - Variables: {{business_name}}, {{owner_first_name}}, {{discount_code}}

- [ ] **Shipping Confirmed** (`shipping-confirmed.html`)
  - Used in: Payment → Shipping workflow
  - Variables: {{business_name}}, {{ship_date}}, {{carrier}}, {{tracking_number}}

- [ ] **Delivery Follow-Up** (`delivery-followup.html`)
  - Used in: Post-Delivery workflow (Day 7)
  - Variables: {{business_name}}, {{owner_first_name}}, {{animal_name}}

---

## SMS Templates (4)

- [ ] **Show Opt-In Confirmation**
  - "Hey {{first_name}}! Thanks for visiting {{business_name}} at {{show_name}}. I'll send a few follow-ups with available animals and care tips. Reply STOP anytime. — {{owner_first_name}}"

- [ ] **New Animal Alert**
  - "{{business_name}} just listed a new {{species}}! Check it out: {{link}} — {{owner_first_name}}"

- [ ] **Shipping Update**
  - "Update on your shipment from {{business_name}}: {{shipping_status}}. {{details}} — {{owner_first_name}}"

- [ ] **Delivery Confirmation**
  - "Your animal from {{business_name}} has arrived! Give them time to settle in. Questions? Just reply! — {{owner_first_name}}"

---

## Workflows (10)

See `docs/ghl-workflows.md` for detailed configuration.

- [ ] Workflow 1: Show QR Lead Capture (Form → Webhook)
- [ ] Workflow 2: Post-Show Email Drip (Tag → Day 1/3/7/14 emails)
- [ ] Workflow 3: Lead Score Alert (Field change → Qualify + Notify)
- [ ] Workflow 4: Invoice Follow-Up (Stage → 24h/72h reminders)
- [ ] Workflow 5: Payment → Shipping Trigger (Stage → Webhook)
- [ ] Workflow 6: Post-Delivery Follow-Up (Stage → Day 1/7/30 messages)
- [ ] Workflow 7: Daily Weather Check (Schedule → Webhook)
- [ ] Workflow 8: Shipping Status Notifications (Field change → SMS)
- [ ] Workflow 9: Daily Content Generation (Schedule → Webhook)
- [ ] Workflow 10: SMS Content Approval (Inbound SMS → Webhook)

---

## Webhook URLs (5)

All pointing to: `https://YOUR_VERCEL_URL`

- [ ] `/webhooks/ghl/pipeline-change` — Pipeline stage changes
- [ ] `/webhooks/ghl/new-contact` — New contact created
- [ ] `/webhooks/ghl/form-submission` — Form submissions
- [ ] `/webhooks/shipping/weather-check` — Daily weather cron
- [ ] `/api/content/daily-run` — Daily content cron

---

## Tags (Predefined)

### Source Tags
- [ ] `source:show-qr`
- [ ] `source:direct`
- [ ] `source:website`
- [ ] `source:referral`
- [ ] `source:morphmarket`
- [ ] `source:instagram`

### Status Tags
- [ ] `status:new-lead`
- [ ] `status:hot-lead`
- [ ] `status:customer`
- [ ] `status:repeat-buyer`
- [ ] `needs-attention`

### Shipping Tags
- [ ] `shipping:pending-weather-check`
- [ ] `shipping:approved`
- [ ] `shipping:in-transit`

### Other Tags
- [ ] `follow-up:complete`
- [ ] `repeat-buyer-candidate`
- [ ] `review-requested`
- [ ] `content:pending-approval`

---

## HighLevel Store

- [ ] **Store/Website**
  - Product List Page
  - Product Details Page
  - Cart Page
  - Checkout Page
  - Thank You Page
  - Breeder's logo + brand colors
  - Privacy/Terms footer
  - Checkout copy explains live-animal shipping review

- [ ] **Product Collections**
  - Available Animals
  - Species-specific collections
  - Care & Supplies
  - Lead Magnets / Digital

- [ ] **Available Animals Product List**
  - Grid of animal cards with photos
  - Each card: photo, species, morph, sex, price, status
  - Product detail pages or default Product Details Page
  - Add-to-cart/reserve action

---

## Campaign Funnels

- [ ] **Show QR Landing Page**
  - Mobile-first opt-in form
  - Breeder's logo + brand colors
  - "Thanks for stopping by {{business_name}}!"
  - Links to Show QR Lead Capture Form

- [ ] **Starter Guide / VIP / Review-Referral Campaign Pages**
  - Campaign-specific copy
  - Tag-added or webhook-safe triggers

---

## Calendar Settings

- [ ] Default shipping windows (Mon-Wed only)
- [ ] Breeder consultation booking (optional)

---

## Post-Snapshot Customization

After importing the snapshot for a new breeder, customize:

1. [ ] Replace all `{{business_name}}` with actual business name
2. [ ] Replace `{{owner_first_name}}` with owner's first name
3. [ ] Update brand colors in email templates and pages
4. [ ] Upload breeder's logo
5. [ ] Update webhook URLs to production server
6. [ ] Update Species Interest dropdown options to match breeder's species
7. [ ] Update Show Source dropdown options to match breeder's show circuit
8. [ ] Configure breeder's phone number for SMS
9. [ ] Run `node scripts/onboard-breeder.js` to register in webhook server
10. [ ] Test with dummy contact before going live
