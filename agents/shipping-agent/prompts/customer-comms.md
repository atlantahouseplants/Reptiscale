# HatchKit Customer Communication Templates

These templates are used by the shipping agent and communication workflows.
Variables in `{{DOUBLE_BRACES}}` are replaced at send time.

---

## 1. Shipping Confirmed

**Use when:** Decision = APPROVE, ship date is set, label is being created.

### SMS Version
```
Hey {{FIRST_NAME}}! Great news — your {{SPECIES}} is shipping {{SHIP_DAY}}, {{SHIP_DATE}} via {{CARRIER}}. You'll get a tracking number that morning. Expected arrival: {{ARRIVAL_DATE}} by 10:30 AM. 🦎
```

### Email Subject
```
Your {{SPECIES}} ships {{SHIP_DAY}}! 🎉 Tracking + arrival details inside
```

### Email Body
```
Hey {{FIRST_NAME}},

Your {{SPECIES}} is packed and ready to go!

Here are your shipping details:

  Ship Date:     {{SHIP_DAY}}, {{SHIP_DATE}}
  Carrier:       {{CARRIER}}
  Expected Arrival: {{ARRIVAL_DATE}} by 10:30 AM
  Tracking Number: {{TRACKING_NUMBER}} (I'll text you this the morning of shipment)

Packing notes: {{PACKING_SUMMARY}}

A few things to have ready when your gecko arrives:
- Be home or arrange for someone to grab the package by noon
- Have your enclosure set up and at proper temps before arrival
- Open the box in a warm room away from drafts

I'll send you a tracking text the morning of {{SHIP_DATE}}. If you have any questions between now and then, just reply here.

Can't wait for you to meet {{HIM_HER}}! 🦎

— {{BREEDER_NAME}}
{{BUSINESS_NAME}}
```

---

## 2. Shipping Delayed — Weather

**Use when:** Decision = HOLD or DELAY due to unsafe temperatures on the route.

### SMS Version
```
Hey {{FIRST_NAME}}, I've been watching the weather for your shipment and it's not safe to send your {{SPECIES}} this week — {{WEATHER_REASON}}. Current best window looks like {{ESTIMATED_SHIP_DATE}}. I'll confirm as soon as the forecast locks in. Your gecko is happy and eating well here! 🦎
```

### Email Subject
```
Shipping update for your {{SPECIES}} — weather delay
```

### Email Body
```
Hey {{FIRST_NAME}},

I've been closely monitoring the weather along your shipping route and unfortunately I need to hold your {{SPECIES}} a bit longer than planned.

Here's what I'm seeing: {{WEATHER_REASON}}

Shipping live animals in conditions like this isn't safe — even with heat or cold packs, extreme temperatures at sorting facilities can be dangerous. I always put the animal's safety first, even if that means a delay.

Current forecast: The next safe shipping window looks like {{ESTIMATED_SHIP_DATE}}. I'll be watching the forecast daily and will confirm your ship date as soon as I'm confident in the conditions.

Your {{SPECIES}} is doing great here — eating well and comfortable. I'll keep {{HIM_HER}} in perfect condition until it's time to travel.

I'll reach out by {{FOLLOW_UP_DATE}} with an update either way.

Thanks so much for your patience — it means a lot to know you're the kind of keeper who cares about getting this right. 🦎

— {{BREEDER_NAME}}
{{BUSINESS_NAME}}
```

---

## 3. Shipping Delayed — Other Reason

**Use when:** Delay is not weather-related (animal health, logistics issue, etc.).

### SMS Version
```
Hey {{FIRST_NAME}}, quick update on your {{SPECIES}} shipment — I need to push the ship date to {{NEW_SHIP_DATE}}. {{BRIEF_REASON}} Sorry for the change! I'll have everything ready to go by then.
```

### Email Subject
```
Quick update on your {{SPECIES}} shipment
```

### Email Body
```
Hey {{FIRST_NAME}},

I wanted to reach out with a quick update on your {{SPECIES}} shipment.

I need to push your ship date from {{ORIGINAL_DATE}} to {{NEW_SHIP_DATE}}. {{FULL_REASON}}

I apologize for the inconvenience — I want to make sure everything is perfect before your new animal heads your way.

Your new estimated arrival is {{NEW_ARRIVAL_DATE}}. I'll send tracking info the morning of {{NEW_SHIP_DATE}}.

If you have any questions or concerns, please don't hesitate to reach out.

— {{BREEDER_NAME}}
{{BUSINESS_NAME}}
```

---

## 4. Shipment In Transit

**Use when:** Label created, package dropped off, tracking is live.

### SMS Version
```
🦎 Your {{SPECIES}} is on the way! Tracking: {{TRACKING_NUMBER}} ({{CARRIER}}). Expected arrival: {{ARRIVAL_DATE}} by 10:30 AM. Be home to grab it! Reply with any questions.
```

### Email Subject
```
Your {{SPECIES}} is on the way! 🚚 Tracking: {{TRACKING_NUMBER}}
```

### Email Body
```
Hey {{FIRST_NAME}},

Your {{SPECIES}} has officially left the building! 🎉

Tracking Information:
  Carrier:         {{CARRIER}}
  Tracking Number: {{TRACKING_NUMBER}}
  Track online:    {{TRACKING_URL}}
  Expected Arrival: {{ARRIVAL_DATE}} by 10:30 AM

A few important reminders:
• Be home (or have someone there) to receive the package — don't let it sit outside
• If you have a hold-at-location set up, the package will be at: {{HOLD_LOCATION_ADDRESS}}
• Open the box in a warm room away from drafts and AC vents
• Give your new gecko 24–48 hours to settle before handling

If anything looks off when the package arrives, take photos immediately and contact me right away. I stand behind every animal I ship with a live arrival guarantee.

So excited for you — enjoy your new gecko! 🦎

— {{BREEDER_NAME}}
{{BUSINESS_NAME}}
```

---

## 5. Delivery Confirmation + Care Tips Request

**Use when:** Tracking shows delivered. Send ~2 hours after expected delivery.

### SMS Version
```
Hey {{FIRST_NAME}}! Tracking shows your {{SPECIES}} arrived — hope {{HE_SHE}} settled in beautifully! How's {{HE_SHE}} doing? Reply anytime if you have questions. 🦎
```

### Email Subject
```
Did your {{SPECIES}} arrive safely? 🦎 + care tips inside
```

### Email Body
```
Hey {{FIRST_NAME}},

Tracking shows your {{SPECIES}} arrived today — I hope the unboxing was exciting!

A few quick care reminders for the first week:

🌡️ Temperature: Keep the warm side at {{WARM_TEMP_RANGE}} and cool side at {{COOL_TEMP_RANGE}}
🏠 Hide: Make sure there's a hide on both the warm and cool side
💧 Water: Fresh water available at all times
🍽️ Feeding: Wait 3–5 days before offering the first meal — let {{HIM_HER}} decompress
👋 Handling: Hold off on handling for the first week

If you notice anything concerning — not eating after 2 weeks, unusual lethargy, labored breathing — don't hesitate to reach out. I'm always happy to help troubleshoot.

One small ask: if you love your new gecko, would you mind leaving a quick review or sharing a photo on Instagram and tagging us? It means the world to a small breeder like me and helps other keepers find us. 🙏

Enjoy your new gecko! Feel free to reach out anytime.

— {{BREEDER_NAME}}
{{BUSINESS_NAME}}
```

---

## 6. Live Arrival Guarantee (LAG) Follow-Up

**Use when:** Customer reports DOA or health issue on arrival. Time-sensitive.

### SMS Version
```
{{FIRST_NAME}}, I'm so sorry to hear that. Please take clear photos of the animal inside the unopened box and the outside packaging right now — I need these for the LAG claim. Send to {{BREEDER_EMAIL}} and I'll take care of you. 📸
```

### Email Subject
```
RE: Arrival issue — I've got you covered. Here's what to do right now.
```

### Email Body
```
Hey {{FIRST_NAME}},

I'm so sorry to hear about the issue with your shipment. I stand behind every animal I ship with a live arrival guarantee, and I'm going to make this right for you.

Here's what I need from you RIGHT NOW (time is critical for LAG claims):

1. 📸 Photos: Take clear photos of the animal inside the unopened (or just-opened) box, plus photos of the outside of the box including the shipping label
2. 📦 Keep everything: Don't discard the box, packing material, or heat/cold pack yet
3. 📧 Email to: {{BREEDER_EMAIL}} with subject line "LAG Claim — {{ORDER_ID}}"
4. ⏰ Deadline: LAG claims must be submitted within 1 hour of the delivery scan

Once I receive your photos I'll process your replacement/refund within {{RESOLUTION_TIMEFRAME}}.

I know this is disappointing and I genuinely apologize. This doesn't happen often, but when it does I take it seriously.

Please reach out immediately if you have any questions.

— {{BREEDER_NAME}}
{{BUSINESS_NAME}}
```
