# SunScale Demo — Final Message Copy (copy-paste for GoHighLevel nodes)

Last updated: 2026-06-11
Voice: Sarah Mitchell, SunScale Geckos, Raleigh NC — warm, knowledgeable, safety-first.

Design rule: every subject/first line matches what the /experience demo screen shows
(lib/demo-journey.ts EVENTS), so the message that lands on the prospect's real phone/inbox
is the one the demo promised. Don't reword one without the other.

Merge fields used: {{contact.first_name}}, {{custom_values.starter_guide_url}},
{{custom_values.mango_detail_url}}, {{custom_values.reservation_url}},
{{custom_values.review_url}}, {{custom_values.referral_url}}, {{custom_values.vip_url}}.

## Sent by the webhook server (do NOT duplicate in workflows)

On the live-demo path these four instant messages come from the HatchKit server, not GHL nodes:

1. Lead magnet email — subject `Your Crested Gecko Starter Guide` + intro SMS
   ("Hey {first}! I sent the Crested Gecko Starter Guide from SunScale Geckos…Reply STOP anytime.")
2. Offer-clicked SMS ("Want help deciding on Mango - Harlequin Dalmatian? I can answer care,
   shipping, and reservation questions here.")
3. Order SMS ("Thank you for your Animal Reservation Deposit order with SunScale Geckos…")
4. Review thank-you SMS (referral/VIP invite).

The GHL workflow nodes below carry the rest of the journey. Where a workflow ALSO has an
immediate send (for GHL-page signups, not the website demo), the copy is provided and marked.

---

## WF1 — DEMO - Reptiscale - Starter Guide Lead Capture

### Node: Immediate SMS (GHL-page signups only — server covers the website path)

```
Hey {{contact.first_name}}! Sarah from SunScale Geckos here 🦎 Your free Crested Gecko Starter Guide just landed in your email (check spam if it's hiding). I'll text day-1 care basics tomorrow — and if you ever have a question, just reply here. I read every message. (Reply STOP to opt out)
```

### Node: Immediate email (GHL-page signups only)

Subject:
```
Here's your free Crested Gecko Starter Guide 🦎
```

Body:
```
Hi {{contact.first_name}},

Welcome! Here's your free Crested Gecko Starter Guide:

👉 Get the guide: {{custom_values.starter_guide_url}}

Inside you'll find:
• The exact enclosure setup I recommend for a first crestie (with budget options)
• Feeding made simple — what, how much, how often
• The 5 mistakes I see new keepers make (all avoidable)

Over the next couple of days I'll send a short day-1 care email and introduce you to a
gecko or two that do great with first-time keepers. No spam, no pressure — just the stuff
I wish someone had told me when I started.

Questions? Hit reply. You'll get me, not a robot.

— Sarah
SunScale Geckos · Raleigh, NC
```

---

## WF2 — DEMO - Reptiscale - Lead Education Drip

### Node: "Day 1 Care Basics" email (demo: wait 1 min · production: Day 1)

Subject:
```
Day-1 care basics: enclosure, humidity, first feeding
```

Body:
```
Hi {{contact.first_name}},

Quick one today — the three things that matter most in your gecko's first 24 hours home:

1. Enclosure first, gecko second. Have the enclosure fully set up and holding 72–78°F
   BEFORE your gecko arrives. Moving into a ready home beats moving into a construction zone.

2. Humidity rhythm, not constant fog. Mist in the evening until ~80%, let it dry to ~50%
   by midday. That dry-down matters as much as the spike.

3. Don't panic about food. A new crestie often skips meals for the first few days.
   Offer fresh food every other evening and let them settle.

That's genuinely 80% of it. Tomorrow I'll show you a gecko that checks every
beginner-friendly box.

— Sarah
SunScale Geckos · Raleigh, NC
```

### Node: "Available Animals" SMS (demo: wait 1 min after email · production: Day 2)

```
Want a beginner-friendly gecko? Meet Mango 👀 He's a Harlequin Dalmatian, $225, eating like a champ and totally unbothered by handling — exactly what you want in a first crestie. Photos + details: {{custom_values.mango_detail_url}}
```

---

## WF3 — DEMO - Reptiscale - Animal Interest - Mango

### Node: SMS (immediate on interest)

```
Great eye, {{contact.first_name}} — Mango's still available! 🧡 A $75 deposit holds him just for you while we sort pickup or wait for safe shipping weather (it counts toward his $225 total, and it's refundable if shipping can't be done safely). Hold him here: {{custom_values.reservation_url}} — or reply with any questions first.
```

### Node: Opportunity (no copy — name it)

```
{{contact.name}} - Mango interest
```

---

## WF4 — DEMO - Reptiscale - Reservation Abandonment

### Node: SMS (demo: wait 3 min, only if no deposit · production: Day 3)

```
Still thinking about Mango? Totally fine — no rush and no pressure. Happy to answer anything: total setup cost, feeding, how safe shipping works, or compare him with another beginner-friendly gecko. He stays available until someone places a deposit, so if you want him held, just reply HOLD and I'll take care of it.
```

### Node: Internal task

Title:
```
Follow up on Mango reservation — {{contact.name}}
```

Description:
```
Clicked Mango's page but no deposit after the reminder. Check their last messages and send a personal note (setup-cost worries and shipping questions are the usual blockers).
```

---

## WF5 — DEMO - Reptiscale - Deposit Paid

### Node: Purchase confirmation SMS (immediate)

```
Got your deposit — Mango's officially on hold for you! 🎉 Here's what happens next: I'll confirm your setup is ready, then run a weather + route check before we lock a ship date. You'll get every update right here — you never have to chase me for news. Welcome to the SunScale family, {{contact.first_name}}!
```

### Node (RECOMMENDED ADD): Deposit receipt email (immediate)

Subject:
```
Deposit received — Mango is on hold for you 🎉
```

Body:
```
Hi {{contact.first_name}},

It's official — Mango (Harlequin Dalmatian) is on hold for you.

Your order:
• Animal Reservation Deposit — $75 (applies to Mango's $225 total)
• Remaining balance: $150, due before ship day

What happens next:
1. Setup check — I'll confirm your enclosure is ready (reply with a photo and I'll
   sanity-check it for free)
2. Safety review — I check the full route + weather forecast before anything ships.
   No label gets created until conditions are safe.
3. Ship day — overnight priority in an insulated shipper, tracking sent to you the
   moment it's live.

I don't relax until he's home safe — you'll see every step right here.

— Sarah
SunScale Geckos · Raleigh, NC
```

---

## WF6 — DEMO - Reptiscale - Order Shipping Review

### Node: Buyer SMS (after operator-review tag · production: ship-week)

```
Good news, {{contact.first_name}} — I just ran Mango's route + weather check and it looks safe to ship Thursday 🌤️ One more step on my end: I personally review and approve every shipment before a label is ever created. No gecko leaves here unless I'd put my own animal on that truck.
```

---

## WF7 — DEMO - Reptiscale - Simulated Shipped

### Node: SMS

```
Mango's on the way! 🚚 He's packed snug in an insulated shipper (heat-checked this morning) and riding overnight priority. Your live tracking link appears right here the moment the carrier scans the label — that's this demo's stand-in for the real thing. I'll be watching every scan until he's home.
```

---

## WF8 — DEMO - Reptiscale - Simulated Delivered And LAG

### Node: Delivered SMS

```
Mango's been delivered! 📦 Open the box in a calm, warm room and move him straight into his enclosure — he'll want quiet time before any handling. Did he arrive safe and sound? Reply YES once he's settled in. I genuinely don't relax until I hear it 🦎
```

---

## WF9 — DEMO - Reptiscale - Care Onboarding

### Node: Day-0 welcome email

Subject:
```
Welcome home! Mango's first-week care 🏡
```

Body:
```
Hi {{contact.first_name}},

Mango's home — congratulations! 🎉 Here's exactly what the first week should look like:

Days 1–3: Leave him be. Hiding is normal and healthy. Keep handling to zero, mist in
the evening, and offer food every other night (don't worry if it goes untouched).

Days 4–5: First gentle handling — 5 minutes max, low to the ground, let him walk
hand-to-hand. End before he wants to.

Days 6–7: He should be eating by now and exploring after lights-out. If he hasn't
touched food by day 5, message me — we'll troubleshoot together (it's almost always
an easy fix).

One favor: reply with a photo of his setup. I'll give it a quick once-over so you can
stop second-guessing the internet.

— Sarah
SunScale Geckos · Raleigh, NC
```

### Node: Day-3 settling SMS (demo: wait 1 min)

```
Day-3 check-in 🦎 Is Mango eating yet? No stress if not — cresties often take a few days to settle. Keep the every-other-evening food schedule and evening misting. If he hasn't eaten by day 5, text me and we'll sort it together. You're doing great.
```

### Node: Day-7 checkup SMS (demo: wait 1 min)

```
One week home! 🎉 By now Mango should be eating steadily and cruising his enclosure at night. Two quick checks: humidity spiking ~80% after evening misting, and dropping back by midday. Both good? You've officially nailed the hard part. Anything seem off — I'm one text away.
```

---

## WF10 — DEMO - Reptiscale - Review And Referral

### Node: Review request email (demo: wait 1 min · production: Day 12)

Subject:
```
How's Mango settling in? Mind leaving a quick review?
```

Body:
```
Hi {{contact.first_name}},

It's been about two weeks — by now Mango should be eating well, exploring at night,
and starting to show his personality. I'd love to hear how it's going.

If the experience felt good, would you leave a quick review? It takes about 60 seconds
and it's honestly the biggest thing you can do for a small breeder like me — most of my
buyers find SunScale through reviews from keepers like you.

⭐ Leave a review: {{custom_values.review_url}}

And if anything is NOT going well — reply to this email instead. I want to fix it,
not have you write it in a review. 🙂

— Sarah
SunScale Geckos · Raleigh, NC
```

### Node: Referral SMS (demo: wait 1 min after review ask)

```
One more thing — know someone researching crested geckos? Send them my free starter guide (the same one you got): {{custom_values.referral_url}} Friends of SunScale keepers also get first look when new clutches drop 💚
```

---

## WF11 — DEMO - Reptiscale - Repeat Buyer VIP

### Node: VIP invite SMS

```
Want first dibs on future geckos? 🦎 VIP-list keepers see new clutches 48 hours before they hit the public page, get holiday availability early, and the occasional keeper-only care tip. One tap to join (free, leave anytime): {{custom_values.vip_url}}
```

---

## WF12 — DEMO - Reptiscale - Social Content Approval (internal, to breeder)

### Node: Internal SMS

```
📱 Your SunScale post is ready: Mango spotlight + care-tip CTA, photo attached. Reply 1 to approve & schedule, 2 to skip, or text your edits and I'll rework it.
```

---

## Referral Welcome — DEMO - Reptiscale - Referral Welcome (to the referred friend)

### Node: Immediate email

Subject:
```
A crested gecko starter guide, from a friend 🦎
```

Body:
```
Hi {{contact.first_name}},

Someone who knows you thought you might be researching crested geckos — so they sent
you my free Starter Guide. (Nice friend.)

👉 Get the guide: {{custom_values.starter_guide_url}}

I'm Sarah — I breed crested geckos at SunScale in Raleigh, NC. The guide covers the
enclosure setup, feeding, and the handful of mistakes that trip up most new keepers.

No catch and no spam: read the guide, and if you ever want help choosing a first
gecko, just reply. That's it.

— Sarah
SunScale Geckos · Raleigh, NC
```

### Node: Optional SMS (A2P-approved)

```
Hi {{contact.first_name}} — a friend sent you SunScale Geckos' free crested gecko starter guide: {{custom_values.starter_guide_url}} I'm Sarah, the breeder. Reply with any questions (or your budget if you want help choosing a first gecko). Reply STOP to opt out.
```
