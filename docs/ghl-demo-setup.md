# HatchKit — GHL Demo Sub-Account Setup

Step-by-step guide to build the HatchKit demo inside your GHL sub-account.
Follow these in order. Each section takes 5-15 minutes.

**Sub-account:** HatchKit (already created)
**Custom fields:** Already created via API ✅

---

## 1. Create Pipelines (15 min)

### Lead Pipeline — "HatchKit - Lead Pipeline"
Go to: **Opportunities > Pipelines > + Create Pipeline**

| Stage Order | Stage Name  |
|-------------|-------------|
| 1           | New Lead    |
| 2           | Contacted   |
| 3           | Interested  |
| 4           | Qualified   |
| 5           | Customer    |
| 6           | Lost        |

### Sales Pipeline — "HatchKit - Sales Pipeline"

| Stage Order | Stage Name       |
|-------------|------------------|
| 1           | Animal Selected  |
| 2           | Invoice Sent     |
| 3           | Payment Received |
| 4           | Shipping Scheduled |
| 5           | Shipped          |
| 6           | Delivered        |
| 7           | Follow-Up Complete |

### Shipping Pipeline — "HatchKit - Shipping Pipeline"

| Stage Order | Stage Name      |
|-------------|-----------------|
| 1           | Pending Review  |
| 2           | Weather Check   |
| 3           | Approved to Ship |
| 4           | Label Created   |
| 5           | Dropped Off     |
| 6           | In Transit      |
| 7           | Delivered       |
| 8           | LAG Confirmed   |
| 9           | Complete        |

**After creating all 3:** Run `node scripts/sync-pipelines.js` to pull IDs into config.

---

## 2. Create Tags (5 min)

Go to: **Contacts > Tags > + Add Tag**

Create these tags:
```
source:show-qr
source:direct
source:website
source:referral
source:morphmarket
source:instagram
status:new-lead
status:hot-lead
status:customer
status:repeat-buyer
needs-attention
shipping:pending-weather-check
shipping:approved
shipping:in-transit
follow-up:complete
repeat-buyer-candidate
review-requested
content:pending-approval
```

---

## 3. Create Email Templates (20 min)

Go to: **Marketing > Emails > Templates > + Create Template**

Import these 6 templates from `data/breeders/sunscale-geckos/templates/emails/`:

| Template Name              | File                         |
|---------------------------|------------------------------|
| Show Welcome              | show-welcome.html            |
| Day 3 Featured Animals    | day3-featured-animals.html   |
| Day 7 Care Guide          | day7-care-guide.html         |
| Day 14 Special Offer      | day14-special-offer.html     |
| Shipping Confirmed        | shipping-confirmed.html      |
| Delivery Follow-Up        | delivery-followup.html       |

For each: Create new template > choose "Code" editor > paste the HTML content.

---

## 4. Create Show QR Form (10 min)

Go to: **Sites > Forms > + Create Form**

Name: **"Show QR Lead Capture"**

Fields:
1. First Name (Text, required)
2. Last Name (Text)
3. Email (Email, required)
4. Phone (Phone)
5. Species Interest (Dropdown — use values from the custom field)
6. Show Name (Hidden field — will be pre-filled from URL param)

Settings:
- Submit action: Redirect to a "Thank You" page or show inline message
- Notifications: OFF (the webhook handles everything)

---

## 5. Create the Show QR Landing Page (10 min)

Go to: **Sites > Funnels > + Create Funnel**

Name: **"Show QR Signup"**

**Option A — Use GHL Builder:**
- Add a single-page funnel step
- Header with logo + "Thanks for stopping by!"
- Embed the Show QR Lead Capture form
- Mobile-first layout

**Option B — Use our template:**
- The file `templates/pages/show-qr-landing.html` is a standalone HTML page
- You can host this on your Vercel deployment or any static host
- It posts directly to your webhook server (no GHL form needed)
- Replace the `{{merge_variables}}` with actual values

---

## 6. Create Workflows (30 min)

Go to: **Automation > Workflows > + Create Workflow**

Reference: `docs/ghl-workflows.md` for detailed config.

### Priority order (build these first for demo):

**Workflow 1: Show QR Lead Capture**
- Trigger: Form Submitted → "Show QR Lead Capture"
- Action: Webhook POST to `{{WEBHOOK_URL}}/webhooks/ghl/form-submission`

**Workflow 2: Post-Show Email Drip**
- Trigger: Tag Added → `source:show-qr`
- Actions: Send Show Welcome → Wait 3d → Send Day 3 → Wait 4d → Send Day 7 → Wait 7d → Send Day 14

**Workflow 3: Lead Score Alert**
- Trigger: Custom Field Changed → "Lead Score"
- Condition: Lead Score >= 8
- Actions: Move to Qualified → Tag `status:hot-lead` → Notify breeder

**Workflow 5: Payment → Shipping**
- Trigger: Stage Changed → Sales Pipeline → "Payment Received"
- Action: Webhook POST to `{{WEBHOOK_URL}}/webhooks/ghl/pipeline-change`

### Build later (after demo is working):
- Workflow 4: Invoice Follow-Up
- Workflow 6: Post-Delivery Follow-Up
- Workflow 7: Daily Weather Check
- Workflow 8: Shipping Status Notifications
- Workflow 9: Daily Content Generation
- Workflow 10: SMS Content Approval

---

## 7. Deploy Webhook Server (5 min)

```bash
# From the HatchKit directory:
vercel --prod

# Note the URL (e.g., https://hatchkit-xxx.vercel.app)
# Update all webhook URLs in GHL workflows to use this URL
```

---

## 8. Create a Test Contact & Run the Demo (10 min)

1. Open the Show QR Landing Page on your phone
2. Fill in your own info as a test
3. Check that:
   - Contact appears in GHL
   - Tag `source:show-qr` was added
   - Welcome email was sent (Workflow 2)
4. Manually move the test contact through Sales Pipeline stages
5. Watch the webhook server logs: `vercel logs --follow`

Or run the simulation script:
```bash
node scripts/simulate-demo.js --server https://YOUR-VERCEL-URL.vercel.app
```

---

## Quick Reference — What to Show in a Demo

When showing HatchKit to a potential breeder customer:

1. **"Scan this QR code"** — Show the QR landing page on your phone
2. **"See the lead come in"** — Open GHL contacts, show the new lead appear with tags + fields
3. **"Automatic follow-up"** — Show the email drip workflow, the Day 1/3/7/14 sequence
4. **"Smart lead scoring"** — Show a contact's lead score field, explain the 0-10 scale
5. **"Payment to shipping"** — Walk through the Sales Pipeline stages, show how payment triggers shipping evaluation
6. **"Weather-safe shipping"** — Show the shipping pipeline, explain the weather check
7. **"All automated, all branded"** — Show the email templates with the breeder's name/colors

**Key talking points:**
- "This is YOUR brand, not ours"
- "Every text and email goes out from you"
- "We handle the tech, you handle the animals"
- "Works with your show schedule — scan QR, leads flow in automatically"
