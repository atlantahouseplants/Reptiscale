# Support Playbook

## Support Principles

Breeders are busy and usually on their phones. Keep support short, practical, and specific.

## Priority Levels

| Priority | Example | Response Target |
|---|---|---|
| P0 | Live workflow sending wrong customer messages | Same day |
| P1 | Payment, shipping, or lead capture broken | Same business day |
| P2 | Page edit, campaign edit, reporting question | 1 business day |
| P3 | New feature request or strategy idea | Next review call |

## Common Requests

### "A buyer did not get the text."

Check:

- Phone number exists and is valid.
- Contact has not opted out.
- GHL conversation exists.
- Workflow action fired.
- SMS provider is connected.

### "I need to hold shipping because of weather."

Check:

- Contact has destination ZIP.
- Species field is correct.
- Shipping status is Pending Weather Check or Hold.
- Customer has received hold message.
- Next Best Action says to monitor weather.

### "I sold this animal."

Do:

- Mark animal as Reserved or Sold.
- Add purchase tag if needed.
- Update Animal Interest and Purchase Status fields.
- Move opportunity manually if API scope is unavailable.
- Trigger care onboarding if payment happened outside HighLevel.

### "Can you post this animal?"

Do:

- Add or update animal profile.
- Generate social caption.
- Queue for approval.
- Tag post with animal SKU.
- Link CTA to animal detail or reservation page.

## Support Macros

### SMS Not Sending

I am checking the contact record, opt-out status, and workflow history now. If the number is valid and opted in, I will either re-send the message or adjust the workflow so it fires correctly going forward.

### Shipping Hold

The safest move is to hold shipment until the route is inside the species-safe range. I will update the contact, tag the shipment as a weather hold, and make sure the buyer gets a clear explanation instead of wondering what happened.

### Animal Sold

I will mark the animal as sold/reserved, update the buyer record, and make sure the follow-up moves from sales into shipping and care onboarding.
