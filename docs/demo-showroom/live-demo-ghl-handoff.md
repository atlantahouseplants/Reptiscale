# Live Demo → GoHighLevel: Data-Flow Status & Handoff

Last updated: 2026-06-15

## TL;DR (read this first)

The website live demo **does** send its data to GoHighLevel, and it is verified working.
What is NOT happening is the **GHL workflows firing** on that data. So the perceived
"data isn't reaching GHL" is really "the data arrives and tags the contact, but the
workflows that should react to those tags aren't running." Two-part fix: (1) publish the
workflows with the exact trigger tags below, (2) decide who owns the message copy
(`DEMO_MESSAGING_MODE`).

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

## Why the workflows aren't firing (most → least likely)

1. **Workflow is in Draft, not Published.** The builder's top-right toggle. Drafts don't run
   for live contacts.
2. **Trigger-tag mismatch.** GHL matches tag names EXACTLY. The backend adds
   `journey:lead-captured-webhook` (note the `-webhook` suffix). A trigger set to
   `journey:lead-captured` will never fire. Set the trigger to the exact tag in the table.
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

1. Confirm (with the commands above) exactly which data lands on the contact for each of the
   4 buyer steps — tags, custom fields, pipeline stage — and note any gaps vs. the table.
2. With the user, get each GHL workflow Published and triggered on the exact tag.
3. Decide + flip `DEMO_MESSAGING_MODE` to `workflow` so GHL owns the copy; verify end-to-end
   with a fresh email + real mobile.
4. If any data the workflows need is missing from the contact (e.g. a field a workflow
   branches on), add it to the relevant handler in `server.js` and redeploy (push parent
   `Reptiscale` main → auto-deploys reptiscale-demo).
