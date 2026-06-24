# Live Demo → GoHighLevel: Data-Flow Status & Handoff

Last updated: 2026-06-22

## TL;DR (read this first)

**Updated 2026-06-22 — the original premise (preserved below) was wrong.** The data reaches
GHL AND the workflows fire. All 12 workflows were already **Published** (verified via the GHL
workflow API), and the test contact's conversation history proved they send. The real
problems were: (a) per-workflow **trigger-tag mismatches** on a few workflows (backend emits
a tag the trigger didn't match), (b) one **inverted condition branch** (WF3), and (c) every
message node still held **generic placeholder copy**, not the final Sarah-voice copy. All
three were fixed in the 2026-06-22 session — see "What was actually wrong & fixed" below.
Remaining work: flip `DEMO_MESSAGING_MODE=workflow` + redeploy, then run the end-to-end test.

## What is VERIFIED working (proven 2026-06-11/15)

Each step of `/experience` POSTs to `https://reptiscale-demo.vercel.app`. The Express
backend (`server.js`) then, for each buyer step:
- upserts the GHL contact in the SunScale demo account (`oCn199rzTjj0rPgqXyXU`) with
  name / email / **phone** (normalized to E.164),
- sets custom fields (e.g. Customer Journey Stage),
- moves pipeline/opportunity stages,
- **adds the trigger tags** listed below.

Verified by querying GHL directly (`ghl/contacts.js` `getContact`/`searchContacts` with the
token in `.env`): a demo contact came back with `phone: +1…`, 5 custom fields, and tags
including `journey:lead-captured-webhook`. So the transport is solid — env vars, CORS, and
the webhook handlers all work.

## The webhook → trigger-tag map (the heart of it)

| Demo step | Webhook (frontend `lib/demo-journey.ts`) | Handler (`server.js`) | Trigger tag the backend adds |
|---|---|---|---|
| Intro submit | `/webhooks/hatchkit/demo-lead` (`stage:started`) | `handleDemoLead` | HatchKit SALES acct (`fqj4rbp2VRkvMa8GWVWn`); `status:demo-in-progress`, no task |
| 1 · Get Starter Guide | `/webhooks/ghl/lead-magnet` | `handleLeadMagnet` | `journey:lead-captured-webhook` |
| 2 · Interested in Mango | `/webhooks/ghl/offer-clicked` | `handleOfferClicked` | `journey:offer-presented` |
| 3 · Place $75 Deposit | `/webhooks/ghl/order-submitted` | `handleOrderSubmitted` | `journey:purchased` (+ shipping review) |
| 4 · Leave Review | `/webhooks/ghl/review-submitted` | `handleReviewSubmitted` | `journey:advocacy`, `review:received` |
| Finale | `/webhooks/hatchkit/demo-lead` (`stage:completed`) | `handleDemoLead` | HatchKit SALES acct; hot tag + task for Brianna |
| Shipping (auto after deposit) | server shipping review | — | `shipping:operator-review` → `shipping:ready-for-operator-approval` → `shipping:lag-confirmed` |

Payloads/offerKeys are load-bearing — never rename them.

## What was actually wrong & fixed (2026-06-22)

All 12 workflows were already **Published** (verified via the GHL workflow API) — the Draft
hypothesis was wrong. The test contact's GHL conversation history confirmed workflows fire
and send (deposit confirm, shipping review, VIP, care onboarding all sent while the backend
was in suppress mode). Per-workflow, fixed in the GHL UI with the user:

**Trigger-tag mismatches (these workflows never fired):**
- WF1 Starter Guide Lead Capture: trigger was `journey:lead-captured` → fixed to
  `journey:lead-captured-webhook` (the exact `-webhook` suffix bug — confirmed real).
- WF2 Lead Education Drip: trigger was a `journey:nurture`-style tag the backend never adds
  → fixed to `journey:lead-captured-webhook`.
- WF12 Content Approval: trigger was `content:pending-approval`, an orphan tag nothing adds
  → fixed to `ugc:requested` (added on the Leave-Review click), so it fires as the capstone.

**Logic bug:**
- WF3 Mango Interest Nurture: the Mango reservation offer (SMS + email) was wired to the
  *purchased* branch, so a not-yet-purchased prospect got nothing — the core "here's your
  reservation link" message never sent. Moved the sends to the not-purchased branch.

**Triggers verified CORRECT (no change needed):** WF3 `journey:offer-presented`, WF4
`journey:offer-presented`, WF5 `journey:purchased`, WF6 `shipping:operator-review`, WF7
`shipping:ready-for-operator-approval`, WF8 `shipping:simulated-shipped`, WF9
`journey:care-onboarding`, WF10 `shipping:lag-confirmed`, WF11 `review:received`.

**Copy:** every message node held generic AI filler ("we hope this message finds you well";
Mango called a "reptile"). Replaced all with final Sarah-voice copy from
`demo-message-final-copy.md`, writing new copy for nodes the doc didn't cover (extra
reservation/shipping/care/VIP emails). Removed decorative "Add Notes" dev-comment nodes
(WF2/3/4) and WF2's redundant extra Mango email.

**Buyer-POV principle:** the self-guided demo is experienced by ONE person (the viewer = the
buyer), so every message goes to the **contact**. "Notify Sarah"-style internal nodes (WF6,
WF12) were mis-named but already targeted the contact; reframed their copy as buyer-facing /
behind-the-scenes. Internal GHL *tasks* (not messages) are left as-is — they live in the
back office, useful if screen-sharing GHL during a sales call.

**Chain design confirmed:** the deposit step (`journey:purchased`) kicks off the auto-chain
shipping→delivery→care→review-request via tag handoffs (each workflow adds the next's trigger
tag). The Leave-Review click (`review:received` + `ugc:requested`) fires the finale (WF11 VIP
+ WF12 content) — giving the 4th demo button a visible payoff.

### Original (now-superseded) hypotheses — kept for history

1. ~~**Workflow is in Draft, not Published.**~~ False — all 12 were Published.
2. **Trigger-tag mismatch.** PARTLY TRUE and the most valuable lead — WF1/WF2/WF12 had it.
   GHL matches tag names EXACTLY; the backend adds `journey:lead-captured-webhook` (note the
   `-webhook` suffix), so a trigger set to `journey:lead-captured` never fires.
3. **Re-entry off + reused test contact** — see [[demo-phone-capture-gotcha]]: GHL dedups by
   email, so re-testing with the same email can land on a contact that already ran or that
   silently kept no phone. Test with a fresh email alias each time (`you+t1@gmail.com`).

## Messaging ownership: `DEMO_MESSAGING_MODE` (server.js)

A single env var on the `reptiscale-demo` Vercel project controls who sends the buyer-facing
email/SMS (gated at the `sendSMS`/`sendEmail` choke point):
- **unset / `backend` (current default):** the backend sends them directly via the GHL
  Conversations API (copy lives in `server.js`, e.g. `starterGuideEmailHtml`). This is the
  email you currently receive. In this mode, the workflow message nodes are DUPLICATES.
- **`workflow` (the chosen direction):** backend suppresses its own sends; the contact/
  tags/fields/pipeline still happen, so the GHL **workflows own all messaging** (edit copy in
  the GHL UI). Verified locally: lead-magnet suppressed both sends but still tagged the contact.

To activate: Vercel → `reptiscale-demo` → Settings → Environment Variables → add
`DEMO_MESSAGING_MODE = workflow` (Production) → redeploy. Do this ONLY after the workflows are
confirmed firing, or the demo will send nothing.

Final copy for every node is in `docs/demo-showroom/demo-message-final-copy.md`.

## Safe rollout order

1. Publish the workflows + set exact trigger tags. Test with a fresh email + real mobile →
   you'll temporarily get TWO of each message (backend + workflow) = proof the workflow fires.
2. Flip `DEMO_MESSAGING_MODE=workflow` + redeploy → backend goes quiet, workflows own it.

## How to verify the data in GHL (commands)

From the repo root (token loads from `.env`):
```
node -e "require('dotenv').config(); const c=require('./ghl/contacts'); c.searchContacts('EMAIL_YOU_TESTED').then(r=>console.log(JSON.stringify(r[0]&&{id:r[0].id,phone:r[0].phone,tags:r[0].tags,fields:(r[0].customFields||[]).length},null,2)))"
```
Run the production webhook directly:
```
curl -s -X POST https://reptiscale-demo.vercel.app/webhooks/ghl/lead-magnet -H "Content-Type: application/json" -d '{"locationId":"oCn199rzTjj0rPgqXyXU","firstName":"Test","email":"FRESH+alias@gmail.com","phone":"4045551234","species_interest":"Crested Gecko","source":"website-self-demo","offerKey":"crested_gecko_starter_guide"}'
```
Backend runtime logs: Vercel project `prj_6d2s1mDxKApDB1JZvg1YjXA8uhoY`, team
`team_qIOvBzLvfo0oSi3cbtQsPkiW` (or the Vercel dashboard → reptiscale-demo → Logs).

## Open work for the next session

DONE 2026-06-22: (1) verified per-step contact data — all tags/fields/pipeline land correctly
(`scripts/verify-journey-data.js` drives the 4 steps and snapshots the contact; note GHL
search-index lags on tags, so read the final contact by ID, not via search). (2) All 12
workflows published, triggers fixed/verified, copy replaced — see "What was actually wrong &
fixed" above. No missing contact data; no `server.js` changes were needed.

DONE 2026-06-22 (cont.): **`DEMO_MESSAGING_MODE=workflow` is live and verified.** A full
backend-mode e2e run (contact "Rocky Maxwelltest", real mobile) proved all 12 workflows fire
with the new copy; WF4 correctly stayed silent (contact had purchased). Then flipped to
workflow mode and confirmed clean: a lead-magnet test now produces ONE workflow message, zero
backend duplicates, `emailSent/smsSent` both suppressed.

⚠️ **Root-cause lesson (cost ~45 min): the flip wasn't an env-var problem — production was
running 6-commit-STALE code** (deployment built from `e68f371`, which predates the
`DEMO_MESSAGING_MODE` feature added in `eea8d96`). No env value could ever work because the
deployed `server.js` didn't check the flag. The Vercel **"Redeploy" button rebuilds the same
frozen commit** — it does NOT pull latest `main`. Fixed by deploying current code with
`vercel --prod` (CLI authed as `atlantahouseplants`, project linked via `.vercel`). To
diagnose a "deployed but behaving old" issue: `git show <deployed-commit>:server.js | grep
<feature>` — check the DEPLOYED COMMIT, not just the env vars.

DONE 2026-06-22 (cont.):
- **Git connected.** The reptiscale-demo Vercel project is now linked to `atlantahouseplants/Reptiscale` (branch `main`), so `git push` auto-deploys. No more frozen-commit trap.
- **Final e2e verified clean** (contact `cactusrumbler@gmail.com`, real mobile): 28 messages,
  ALL new Sarah-voice copy, **ZERO backend duplicates** — full journey lead→drip→offer→deposit
  →shipping-review→in-transit→delivery→LAG→care→review→referral→VIP→content. Workflow mode
  confirmed end-to-end.
- **WF6/WF7 ordering fixed.** The shipping-review (WF6) and shipment (WF7) workflows used to
  race off deposit-time tags; in a real run WF6 lagged ~7 min and its "safe to ship" message
  landed AFTER "delivered". Fix applied in GHL: WF6 now adds a final tag `shipping:review-sent`,
  and WF7's trigger was changed from `shipping:ready-for-operator-approval` → `shipping:review-sent`,
  so the shipment chain waits for the review to finish.

OPEN (for next session):
1. **Re-verify the WF6/WF7 ordering fix** — run `/experience` once (fresh alias + real mobile,
   pause between steps) and confirm the shipping-review message (WF6) now arrives BEFORE the
   in-transit/delivery messages (WF7/WF8). Read the thread with `scripts/verify-journey-data.js`
   or the GHL conversation API (token in `.env`, `ghl/contacts.js`).
2. Watch WF6's webhook node latency — if it still lags badly, consider whether the
   "#1 Send Order Review Webhook" callback to `/webhooks/shipping/order-review` is redundant
   (the backend already runs shipping eval in `handleOrderSubmitted`).
