# Automation Message Live Audit

Generated: 2026-06-07T19:48:50.514Z

Wait window: 90 seconds

Overall status: pass

Mismatch count: 0

## Results

### referral-isolation

- Email: `hatchkit.demo.audit.referral.20260607194711@example.com`
- Contact ID: `AwPDQGnbyWJxlJF43UAj`
- Trigger: POST /webhooks/ghl/referral
- Expected: No generic lead drip. Contact should have journey:referral-captured and no journey:lead-captured.
- Tags: `source:referral`, `referral:received`, `journey:referral-captured`, `status:new-lead`, `status:referred-lead`, `interest:crested-gecko`
- Status: pass
- Mismatch flags: none
- Messages found: 1
  - 3 / outbound / unknown / (no subject)
    Preview: Hi ReferralAudit, Automation message audit thought you might like SunScale Geckos because you are researching crested geckos. Start here with the Crested Gecko Starter Guide: https://demo.hatchkitai.com/guide [https://demo.hatchkitai.com/gu

### starter-guide-webhook

- Email: `hatchkit.demo.audit.guide.20260607194711@example.com`
- Contact ID: `wJZjjKeh2b02J1jiP0KY`
- Trigger: POST /webhooks/ghl/lead-magnet
- Expected: Correct starter-guide email from webhook. No journey:lead-captured generic workflow drip.
- Tags: `journey:lead-captured-webhook`, `message:starter-guide-sent`, `status:new-lead`, `source:automation-message-audit`, `interest:crested-gecko`, `offer:lead-magnet`, `content:starter-guide`
- Status: pass
- Mismatch flags: none
- Messages found: 1
  - 3 / outbound / unknown / (no subject)
    Preview: Hi GuideAudit, Here is the Crested Gecko Starter Guide from SunScale Geckos: https://demo.hatchkitai.com/guide [https://demo.hatchkitai.com/guide] Start with enclosure size, humidity, food, and the first-week checklist. If you want help cho

### lead-drip

- Email: `hatchkit.demo.audit.lead.20260607194711@example.com`
- Contact ID: `KzYAhoEUoOhQihH5y35W`
- Trigger: Add tag journey:lead-captured
- Expected: Correct lead-capture guide message. No Mango-platform, generic-reptile, attachment-claim, or exclusive-offers storefront copy.
- Tags: `status:new-lead`, `interest:crested-gecko`, `journey:lead-captured`, `offer:lead-magnet`, `content:starter-guide`, `journey:nurture`
- Status: pass
- Mismatch flags: none
- Messages found: 1
  - 3 / outbound / unknown / (no subject)
    Preview: Hi LeadAudit, Here is the Crested Gecko Starter Guide from SunScale Geckos: https://demo.hatchkitai.com/guide Start with enclosure size, humidity, food, and the first-week checklist. If you want help choosing a beginner-friendly gecko, repl

### review-vip

- Email: `hatchkit.demo.audit.reviewvip.20260607194711@example.com`
- Contact ID: `HXu3mnNVGbUxlKGt14gE`
- Trigger: Add tags review:received and journey:advocacy
- Expected: Repeat-buyer VIP invitation for proven buyer/reviewer. No first-time prospect copy.
- Tags: `status:customer`, `interest:crested-gecko`, `animal:mango-harlequin-dalmatian`, `review:received`, `journey:advocacy`, `journey:repeat-buyer`, `status:repeat-buyer`, `waitlist:active`, `campaign:availability-alerts`
- Status: pass
- Mismatch flags: none
- Messages found: 1
  - 3 / outbound / unknown / (no subject)
    Preview: Hello ReviewVipAudit, We are excited to offer you an exclusive first look at our upcoming SunScale geckos. As a valued repeat buyer, you're invited to join our VIP list to receive early updates and special offers on future clutches. Don't m

