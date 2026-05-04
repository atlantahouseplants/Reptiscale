# HatchKit — GHL Workflow Definitions

These workflows must be created manually in the GHL UI for each breeder sub-account.
Reference this document when building a snapshot or onboarding a new breeder.

**Webhook Base URL:** `https://YOUR_VERCEL_URL` (replace after deployment)

---

## Workflow 1: Show QR Lead Capture

**Trigger:** Form Submitted → "Show QR Lead Capture Form"

**Actions:**
1. Webhook → POST `{BASE_URL}/webhooks/ghl/form-submission`
   - Send full form payload including: firstName, lastName, email, phone, species_interest, show_name
   - The server handles: contact creation, tagging, welcome SMS, lead scoring

**Notes:** The webhook server does all the heavy lifting. This workflow just bridges the GHL form to the server.

---

## Workflow 2: Post-Show Email Drip

**Trigger:** Tag Added → `source:show-qr`

**Conditions:** Contact has email

**Actions:**
1. **Immediately:** Send Email → "Show Welcome" template
   - Subject: "Thanks for stopping by {{business_name}}!"
2. **Wait 3 days**
3. Send Email → "Day 3 Featured Animals" template
   - Subject: "Check out these animals from {{business_name}}"
4. **Wait 4 days** (total day 7)
5. Send Email → "Day 7 Care Guide" template
   - Subject: "Your {{species_interest}} care guide from {{business_name}}"
6. **Wait 7 days** (total day 14)
7. Send Email → "Day 14 Special Offer" template
   - Subject: "Still thinking about it? Here's something special"

**Stop conditions:** Contact replies, deal created, or contact unsubscribes

---

## Workflow 3: Lead Score Alert

**Trigger:** Custom Field Changed → "Lead Score"

**Conditions:** Lead Score >= 8

**Actions:**
1. Move to Pipeline Stage → Lead Pipeline → "Qualified"
2. Add Tag → `status:hot-lead`
3. Internal Notification → Send email/SMS to breeder
   - "Hot lead alert! {{contact.name}} scored {{contact.lead_score}}/10. They're interested in {{contact.species_interest}}."
4. Create Task → "Follow up with {{contact.name}} — hot lead"

---

## Workflow 4: Invoice Follow-Up

**Trigger:** Pipeline Stage Changed → Sales Pipeline → "Invoice Sent"

**Actions:**
1. **Wait 24 hours**
2. If STILL at "Invoice Sent" stage:
   - Send SMS → "Hey {{contact.first_name}}, just checking in — did you see the invoice? Let me know if you have any questions!"
3. **Wait 48 hours**
4. If STILL at "Invoice Sent" stage:
   - Send Email → "Invoice Reminder" template
   - Subject: "Your invoice from {{business_name}} — just a friendly reminder"
5. **Wait 3 days**
6. If STILL at "Invoice Sent" stage:
   - Add Tag → `needs-attention`
   - Internal Notification → "{{contact.name}} hasn't paid after 6 days. Invoice may need follow-up."

---

## Workflow 5: Payment → Shipping Trigger

**Trigger:** Pipeline Stage Changed → Sales Pipeline → "Payment Received"

**Actions:**
1. Webhook → POST `{BASE_URL}/webhooks/ghl/pipeline-change`
   - Body: `{ "contactId": "{{contact.id}}", "pipelineId": "SALES_PIPELINE_ID", "pipeline_stage_name": "Payment Received", "locationId": "{{location.id}}" }`
2. The server will:
   - Fetch contact data
   - Run the shipping agent (weather check + AI decision)
   - Send shipping decision SMS to buyer
   - Update shipping_status custom field

**Notes:** This is the most critical webhook. Make sure the payload includes `contactId`, `pipelineId`, and `pipeline_stage_name`.

---

## Workflow 6: Post-Delivery Follow-Up

**Trigger:** Pipeline Stage Changed → Sales Pipeline → "Delivered"

**Actions:**
1. **Immediately:** Webhook → POST `{BASE_URL}/webhooks/ghl/pipeline-change`
   - The server sends a delivery confirmation SMS
2. **Wait 7 days**
3. Send Email → "Care Check-In" template
   - Subject: "How's your new animal settling in?"
4. **Wait 23 days** (total 30 days)
5. Send Email → "Review Request" template
   - Subject: "Would you leave us a quick review?"
   - Add Tag → `review-requested`

---

## Workflow 7: Daily Weather Check (Scheduled)

**Trigger:** Schedule → Every day at 6:00 AM (breeder's timezone)

**Actions:**
1. Webhook → POST `{BASE_URL}/webhooks/shipping/weather-check`
2. The server will:
   - Find all contacts with tag `shipping:pending-weather-check`
   - Re-evaluate weather for each pending shipment
   - If weather clears, send SMS notification to buyer

**Notes:** This can also be handled via Make.com if you prefer scheduled triggers there.

---

## Workflow 8: Shipping Status Notifications

**Trigger:** Custom Field Changed → "Shipping Status"

**Conditions & Actions:**
- If new value = "Approved to Ship":
  - Send SMS → "Great news! Weather looks good and your shipment has been approved! You'll get tracking info soon."
- If new value = "Label Created":
  - Send SMS → "Your shipping label is ready! We're packaging your animal with care."
- If new value = "In Transit":
  - Send SMS → "Your animal has been shipped! It's on its way via overnight delivery."
- If new value = "Delivered":
  - Send SMS → "Your animal has been delivered! Please confirm safe arrival when you can."

**Notes:** These are backup notifications. The webhook server also sends SMS for most of these stages, so check if the server already sent a message to avoid duplicates. You can use tags to prevent double-sending.

---

## Workflow 9: Daily Content Generation (Scheduled)

**Trigger:** Schedule → Every day at 9:00 AM (breeder's timezone)

**Actions:**
1. Webhook → POST `{BASE_URL}/api/content/daily-run`
2. The server will:
   - Generate a social media post for each active client
   - Send SMS approval request to breeder
   - Store post as "pending_approval"

**Tier:** Growth and Pro only

---

## Workflow 10: SMS Content Approval

**Trigger:** Inbound SMS Reply → from breeder's phone number

**Conditions:** Reply contains "1", "2", or text edit AND contact has tag `content:pending-approval`

**Actions:**
1. Webhook → POST `{BASE_URL}/webhooks/sms/content-approval`
   - Body: `{ "phone": "{{contact.phone}}", "body": "{{message.body}}", "contactId": "{{contact.id}}", "customData": { "clientId": "CLIENT_ID", "postId": "LATEST_POST_ID" } }`
2. The server will:
   - "1" → approve and publish to Instagram
   - "2" → skip this post
   - Other text → treat as edit instructions

**Notes:** The `clientId` and `postId` need to be passed in customData. This is tricky in GHL — you may need to store the latest pending postId as a custom field or use Make.com to bridge this.

---

## Workflow Setup Checklist

For each workflow, verify:
- [ ] Trigger is configured correctly
- [ ] Webhook URLs point to the correct deployed server
- [ ] Wait steps use the correct delays
- [ ] Stop conditions are set to prevent messages to unsubscribed contacts
- [ ] Email templates are imported and branded
- [ ] SMS templates are within character limits
- [ ] Internal notifications go to the breeder's email/phone
- [ ] Test with a dummy contact before going live
