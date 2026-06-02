# Copy-Ready SunScale Demo Pages

Last updated: 2026-06-02

Use these pages to build the `SunScale Geckos - Demo` HighLevel showroom.

## Shared Settings

Business name: SunScale Geckos  
Owner: Sarah Mitchell  
Primary species: Crested gecko  
Webhook base URL: `https://reptiscale-demo.vercel.app`  
Location ID: replace with the new `SunScale Geckos - Demo` HighLevel location ID after the subaccount exists.

Suggested custom values:

- `{{custom_values.webhook_base_url}}`
- `{{custom_values.demo_location_id}}`
- `{{custom_values.starter_guide_url}}`
- `{{custom_values.mango_detail_url}}`
- `{{custom_values.reservation_url}}`
- `{{custom_values.review_url}}`
- `{{custom_values.referral_url}}`
- `{{custom_values.vip_url}}`

## Page 1: Storefront

HighLevel name:

`SunScale Demo - Storefront`

Purpose:

Show the breeder website/storefront a HatchKit customer receives.

Hero:

- Eyebrow: `Crested geckos raised with care`
- H1: `SunScale Geckos`
- Body: `Browse available crested geckos, reserve the right animal, and get clear care and shipping guidance before anything leaves the reptile room.`
- Primary CTA: `Shop Available Geckos` -> animal grid
- Secondary CTA: `Get the Starter Guide` -> starter guide page

Animal cards:

- Nova, Lilly White, Probable Female, 28g, $1,200, Available
- Mango, Harlequin Dalmatian, Unsexed Juvenile, 12g, $225, Available
- Echo, Tricolor Pinstripe, Male, 41g, $650, Reserved
- Pepper, Super Dalmatian, Probable Male, 24g, $475, Available

Trust band:

- Weather-first shipping
- Care onboarding
- Easy reservation
- VIP availability

Form:

Use the starter guide lead form.

Webhook:

`POST https://reptiscale-demo.vercel.app/webhooks/ghl/lead-magnet`

Required hidden fields:

- `locationId`
- `source=website`
- `offerKey=crested_gecko_starter_guide`
- `species_interest=Crested Gecko`

## Page 2: Starter Guide

HighLevel name:

`SunScale Demo - Crested Gecko Starter Guide`

Purpose:

Lead magnet capture.

Headline:

`Crested Gecko Starter Guide`

Body:

`A simple care plan for new keepers who want to know what to buy, how to set up the enclosure, and how to tell whether a beginner gecko is the right fit.`

Bullets:

- Enclosure size, humidity, feeding, heat, and first-week expectations.
- What to buy before pickup or shipping day.
- How to decide between beginner, collector, and breeder-quality animals.

Form fields:

- First name
- Email
- Mobile phone
- Budget range

Webhook:

`POST /webhooks/ghl/lead-magnet`

Success message:

`Your guide request is in. Watch for care tips and current availability from SunScale Geckos.`

## Page 3: Mango Animal Detail

HighLevel name:

`SunScale Demo - Mango Animal Detail`

Purpose:

Show a buyer-specific animal page and trigger animal interest.

Headline:

`Mango`

Subheadline:

`Harlequin Dalmatian crested gecko`

Details:

- Price: `$225`
- Status: `Available`
- Sex: `Unsexed juvenile`
- Weight: `12g`
- Temperament: `Curious and active`
- Buyer fit: `First-time crested gecko owner`

Body:

`Mango is a bright, beginner-friendly juvenile with red-orange tone, clean spotting, and a curious feeding response. This is the kind of animal that helps a new keeper feel confident without jumping into a high-end breeder project.`

Primary CTA:

`Reserve Mango` -> reservation page

Secondary CTA:

`Ask Sarah a question` -> webhook or contact form

Webhook on interest click:

`POST /webhooks/ghl/offer-clicked`

Payload values:

- `species_interest=Crested Gecko`
- `animalInterest=Mango - Harlequin Dalmatian`
- `offerKey=animal_reservation`

## Page 4: Reservation

HighLevel name:

`SunScale Demo - Mango Reservation`

Purpose:

Simulate or collect the animal reservation deposit.

Headline:

`Reserve Mango`

Body:

`A $75 reservation deposit holds Mango while pickup, shipping, weather, and setup details are confirmed. Sarah reviews every live-animal shipment before a label is purchased.`

Offer:

- Animal Reservation Deposit: `$75`
- Optional Care Starter Kit: `$49`
- Optional Setup Review: `$35`

Demo-safe CTA:

`Simulate Deposit Paid`

Production CTA:

`Pay Reservation Deposit`

Webhook for simulation:

`POST /webhooks/ghl/order-submitted`

Payload values:

- `productName=Animal Reservation Deposit`
- `amount=75`
- `purchaseStatus=Deposit Paid`
- `animalInterest=Mango - Harlequin Dalmatian`
- `species_interest=Crested Gecko`
- `preferredShipDate=2026-06-08`

## Page 5: Review / Referral

HighLevel name:

`SunScale Demo - Review And Referral`

Purpose:

Show the post-delivery advocacy system.

Headline:

`How did Mango settle in?`

Body:

`Safe arrival is only the start. SunScale checks in after delivery, asks how the new animal is settling, and turns happy buyers into reviews, referrals, and future repeat buyers.`

Review form fields:

- Rating
- Review text
- Photo permission
- Email

Referral form fields:

- Friend first name
- Friend email
- Friend phone
- Species interest

Webhooks:

- `POST /webhooks/ghl/review-submitted`
- `POST /webhooks/ghl/referral`

## Page 6: VIP List

HighLevel name:

`SunScale Demo - VIP Availability List`

Purpose:

Show the repeat-buyer/waitlist system.

Headline:

`Get first look at future geckos`

Body:

`VIP buyers hear about upcoming animals, show pickup options, and future clutch updates before the public feed sees them.`

Form fields:

- First name
- Email
- Phone
- Species interest
- Budget range
- Preferred pickup/shipping option

Tags:

- `journey:repeat-buyer`
- `waitlist:active`
- `campaign:availability-alerts`
- `interest:crested-gecko`

Success message:

`You're on the VIP list. Watch for future clutch updates and first-look availability from SunScale Geckos.`

