# HighLevel Snapshot Build

The end goal is a master Reptiscale HighLevel snapshot that can be cloned for every customer.

## Snapshot Must Include

### Custom Fields

- Species Interest
- Morph Preference
- Price Tier
- Shipping Preference
- Temperature Tolerance Min
- Temperature Tolerance Max
- Show Source
- Lead Score
- Last Show Attended
- Shipping Status
- Customer Journey Stage
- Animal Interest
- Offer Name
- Purchase Status
- Last Purchase Amount
- Referral Source
- Next Best Action

### Tags

Use the journey/source/offer/purchase/content/care/shipping/referral tags from `scripts/setup-demo-account.js`.

### Pipelines

Lead Pipeline:

- New Lead
- Contacted
- Interested
- Qualified
- Customer
- Lost

Sales Pipeline:

- Animal Selected
- Invoice Sent
- Payment Received
- Shipping Scheduled
- Shipped
- Delivered
- Follow-Up Complete

Shipping Pipeline:

- Pending Review
- Weather Check
- Approved to Ship
- Label Created
- Dropped Off
- In Transit
- Delivered
- LAG Confirmed
- Complete

### Funnels And Pages

- Storefront
- Starter guide capture
- Animal detail
- Reservation offer
- Show QR signup
- Review/referral page
- VIP availability list

### Workflows

- Lead magnet delivery
- New lead education
- Show lead follow-up
- Offer clicked follow-up
- Reservation abandonment
- Purchase confirmation
- Shipping decision
- Order-to-shipping operator review
- Shipping hold update
- Care onboarding
- Review/referral request
- Repeat-buyer VIP
- Social content approval

## Clone Procedure

1. Clone the snapshot.
2. Update business profile.
3. Update sender phone/email.
4. Replace logo, colors, and copy.
5. Load initial animals.
6. Update webhook base URL.
7. Replace demo shipping origin with the breeder's real fulfillment address.
8. Test all workflows before activation.

## Snapshot QA

Every snapshot version needs:

- a version number
- release notes
- test customer
- full lead-to-purchase test
- workflow trigger screenshots
- rollback notes
