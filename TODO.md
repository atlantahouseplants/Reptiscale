# HatchKit — Your Build To-Do List

Last updated: 2026-06-08 (for your work day on 2026-06-09)

This is your hands-on checklist. The items below are the parts that have to be done
by you inside GoHighLevel (Claude can't click the visual builders for you), ordered so
you get a quick win first, then knock out the big pieces. Everything you need is
already written up — just follow the linked kits.

---

## ✅ Already done (so you don't redo it)

- **The front door works and is LIVE.** hatchkitai.com → "Get a Free Demo" → 15-minute
  booking with Brianna. Booking creates the contact in your HatchKit sales account and
  notifies Brianna. The old leaky form is gone.
- **Self-guided live demo is LIVE.** hatchkitai.com/experience — a prospect plays the buyer
  and feels your real automations fire in real time (reusing the existing webhooks; nothing
  in the workflows changed). Finishing captures them as a HatchKit lead + notifies Brianna,
  then funnels to the free booking. Entry points: homepage primary CTA + navbar "Live Demo".
- **Booking calendar:** "Free HatchKit Demo," 15-min slots, in the HatchKit sub-account.
- **Website copy** reframed around "help breeders sell more," free/no-obligation demo,
  and de-emphasized Brianna (her story stays on the About page).
- **Build kits written** and ready to follow (links below).

---

## 🎯 Tomorrow's checklist (suggested order)

### 1. Quick win — test the booking (5 min)
- [ ] Open the booking page and book a test slot:
      https://api.leadconnectorhq.com/widget/booking/rqjzGHUbB4uUJn19zaXo
- [ ] Confirm Brianna gets the notification email at brianna@hatchkitai.com.
- [ ] Delete the test contact/appointment afterward.

### 2. Build the SunScale store — the headline demo asset (2–3 hrs)
Follow: **`docs/demo-showroom/store-completion-kit.md`** (paste-ready copy + 13-step checklist)
- [ ] GHL → SunScale account → `Sites → Stores → SunScale Geckos Store`.
- [ ] Activate the Ecommerce Store; confirm the 5 pages (Products, Detail, Cart, Checkout, Thank You).
- [ ] Apply branding + hero (kit section 1–2). Remove all default "My Store" copy.
- [ ] Build the 8 product detail pages from the kit (section 3) — copy is written for each.
- [ ] Set checkout (demo-safe) + thank-you copy (kit sections 5–6).
- [ ] Publish, grab the live store URL.
- [ ] Back here, Claude runs `npm run audit:store-readiness` to confirm it flipped to published.

### 3. Add the store workflows (1–2 hrs)
Follow: **`docs/demo-showroom/store-workflow-specs.md`** (7 workflows, build-ready)
- [ ] Build workflows 1–7 in SunScale → `Automation → Workflows`.
- [ ] Leave all SMS steps OFF (A2P still pending — see below).
- [ ] Do one test "purchase" and confirm enrollment in the execution logs.

### 4. Set up your HatchKit sales pipeline (20 min)
The HatchKit account's current pipelines are breeder-templates (Animal Selected / Shipping),
not for selling software.
- [ ] In the HatchKit account, rename/rebuild a pipeline to something like:
      **New Lead → Discovery Call Booked → Demo Completed → Proposal Sent → Closed Won / Closed Lost**.
- [ ] Tell Claude the final stage names — Claude will wire bookings to auto-create an
      opportunity at "Discovery Call Booked."

### 5. Connect social accounts (15 min)
- [ ] In SunScale → `Marketing → Social Planner`, connect the demo social accounts.
- [ ] (Optional) tell Claude when done and a content calendar can be prepped.

---

## ✅ A2P approved — SMS is LIVE (2026-06-10)
- Texts now send for real. The self-guided demo's welcome text fires from the backend, and
  the website copy now says "real automated emails and texts."
- [ ] **Do once in GHL:** confirm the SMS action steps inside the SunScale workflows are
  toggled **ON** (they were left OFF while waiting for A2P). The backend-sent texts already
  work; the workflow-sent texts (care tips, shipping updates) need that toggle flipped.

---

## 🔜 What Claude does once you've finished the above
- Verify the published store (`audit:store-readiness`) and the workflow messages (`audit:messages`).
- Wire booked demos → opportunities in your HatchKit sales pipeline.
- Prep the SunScale social content calendar.
- Then: package the repeatable client snapshot (the thing you actually sell to customer #2).

---

## Handy references
- Account architecture & IDs: `NEXT_SESSION_HANDOFF.md`
- Store build kit: `docs/demo-showroom/store-completion-kit.md`
- Store workflows: `docs/demo-showroom/store-workflow-specs.md`
- Booking calendar script (re-runnable): `scripts/setup-hatchkit-booking-calendar.js`
