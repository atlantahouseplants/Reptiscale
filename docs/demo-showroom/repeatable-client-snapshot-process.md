# Repeatable Client Snapshot Process

Last updated: 2026-06-08

## Recommendation

Use HighLevel as the repeatable delivery engine for Hatchkit client accounts.

The practical build path is:

1. Keep `SunScale Geckos - Demo` as the live showroom and source prototype.
2. Snapshot the reusable SunScale build after storefront, funnel, workflow, and CRM assets are complete.
3. Load that source snapshot into `Hatchkit Master Snapshot - v1`.
4. Sanitize the master account into a clean, client-ready template.
5. Export customer snapshots only from `Hatchkit Master Snapshot - v1`.

This avoids manually rebuilding the same pipelines, workflows, trigger links, products, smart-list logic, and pages when HighLevel snapshot import can copy the reusable structure.

Official HighLevel references:

- `https://help.gohighlevel.com/support/solutions/articles/48000982511-snapshots-overview`
- `https://help.gohighlevel.com/support/solutions/articles/48000982512-creating-new-snapshots-in-highlevel`
- `https://help.gohighlevel.com/support/solutions/articles/48000982582-load-snapshots-into-existing-sub-account`
- `https://help.gohighlevel.com/a/solutions/articles/155000001157/edit?portalId=48000045315`
- `https://help.gohighlevel.com/support/solutions/articles/155000001633`

## Account Roles

### Hatchkit Business CRM

Purpose:

- manage Hatchkit marketing, sales, customers, onboarding, support, and internal follow-up

Do not use this as the customer snapshot source unless the business CRM is intentionally separated from internal sales data first.

### SunScale Geckos Demo Account

Purpose:

- live sales showroom
- source prototype for reusable Hatchkit assets

This account may include:

- SunScale branding and demo proof
- fake contacts and demo opportunities
- accelerated demo workflows
- dummy animal inventory
- published showroom funnel pages
- a real HighLevel Store/Website that demonstrates the client storefront pattern
- test/order simulation
- workflow message examples

Use this account to prove and refine the breeder journey. Do not deliver it directly to clients.

### Hatchkit Master Snapshot - v1

Purpose:

- clean reusable master template for future Hatchkit clients

Location ID:

- `H81tekJbNbeyYsnTRKVH`

This account should include:

- reusable custom fields
- structured tags
- lead, sales, and shipping pipelines
- smart-list definitions
- reusable HighLevel Store/Website
- reusable campaign funnels
- production-timing workflows
- email/SMS templates with Hatchkit/client placeholders
- product ladder
- placeholder custom values
- setup and QA instructions

This account should not include:

- SunScale branding as final copy
- demo contacts
- fake opportunities
- `hatchkit.demo.*` test records
- accelerated one-minute demo waits
- live payment credentials
- live shipping-label automation
- assumptions that SMS is ready before A2P approval

### Future Client Account

Process:

1. Clone from the approved Hatchkit client snapshot.
2. Change business profile, sender settings, address, brand, species, and pricing.
3. Set client-specific custom values.
4. Import or create real animal inventory.
5. Connect payments, phone, email, social, and conversation providers as needed.
6. Test the full buyer journey.

## What Should Be Repeated

Repeatable through snapshot/API where possible:

- custom fields
- tags
- pipelines
- products/prices where snapshot support allows
- trigger links
- HighLevel Store pages
- product list/detail/cart/checkout/thank-you structure
- campaign funnels/pages
- forms and custom-code campaign paths
- smart-list filters
- workflow structure
- email/SMS templates
- custom values
- review/referral/VIP journey structure
- operator approval tasks and internal notifications

Client-specific after clone:

- business profile
- sender email and phone
- timezone
- brand assets and colors
- species/morph language
- actual animals, inventory, pricing, and availability
- payment provider
- conversation provider and A2P campaign
- social accounts
- domain and DNS
- shipping origin and policy language

Never snapshot as customer-ready:

- contacts
- conversations
- fake opportunities
- demo audit records
- real payment credentials
- live shipping-label credentials
- SunScale-only proof or test content

## Snapshot Build Order

1. Inventory `SunScale Geckos - Demo` and `Hatchkit Master Snapshot - v1`.
2. Finish the real HighLevel Store/Website in SunScale first, including product list, product detail, cart, checkout, thank-you, collections, and demo-safe checkout copy.
3. Create a HighLevel source snapshot from SunScale named `SunScale Demo Source - Hatchkit Base v0`.
4. Load that source snapshot into `Hatchkit Master Snapshot - v1`.
5. Resolve conflicts and keep the clean master foundation where it is better.
6. Rename `DEMO - Reptiscale - ...` assets to `HK - ...` or `Hatchkit - ...`.
7. Replace SunScale copy with placeholders and setup notes.
8. Convert accelerated waits from demo timing to production timing.
9. Remove test contacts, fake opportunities, demo proof, and SunScale-only tags.
10. Confirm custom-code form paths use tag-added or webhook-safe triggers.
11. Keep SMS actions disabled, draft-safe, or clearly gated until each client passes A2P approval.
12. QA the clean master with one temporary contact, then delete or document the QA record.
13. Export `Hatchkit Client Snapshot - v1` from the master account.
14. Import into `Hatchkit Snapshot QA - v1`.
15. Run the full QA path before using the snapshot for a paying customer.

## Current Inventory

Latest inventory file:

- `docs/hatchkit-master-snapshot/snapshot-asset-inventory.md`

Current read-back:

| Asset | SunScale Source | Hatchkit Master |
|---|---:|---:|
| custom fields | 17 | 17 |
| tags | 84 | 65 |
| custom values | 10 | 12 |
| pipelines | 3 | 0 |
| products | 8 | 4 |
| trigger links | 6 | 0 |
| workflows | 12 | 0 |

This confirms the SunScale account should be used as the source snapshot for reusable workflows, pipelines, trigger links, and page/funnel structure instead of manually rebuilding those assets from scratch.

## Storefront Direction

Hatchkit needs a real breeder HighLevel Store before the final client snapshot is created.

The Store is the main customer product surface and should include:

- Store/Website homepage or Products List Page
- available animals product grid
- product detail page
- cart page
- checkout page
- thank-you page
- product collections
- inventory-aware product records
- starter guide lead magnet
- review/referral page
- VIP availability list
- privacy and terms pages

Funnels should support campaigns and lead capture around the Store. They should not be the primary storefront for browsing and managing animal inventory.

HighLevel should be treated as a practical boutique breeder store and CRM in v1, not a Shopify replacement for high-volume ecommerce. Client-specific animal inventory should be loaded into products, variants/prices, collections, and store pages during onboarding.

## Automation Boundary

HighLevel owns:

- storefront and funnels
- ecommerce store pages
- product collections
- cart and checkout
- forms and order forms
- contacts
- custom fields
- tags
- pipelines
- opportunities
- smart lists
- products/prices
- store orders
- workflows
- email/SMS templates
- inbox/conversations
- snapshot cloning

The Vercel support layer owns:

- webhook receiver endpoints
- buyer journey payload normalization
- shipping/weather review
- operator approval payloads
- review-only label readiness checks
- integration glue that HighLevel should call, not own

Do not move live carrier label creation into automation without a human approval gate.

## Client Customization Checklist

For each new breeder:

- business name
- owner/operator name
- sender email and phone
- timezone
- business address
- shipping origin
- brand colors
- logo and hero assets
- species and morphs
- product ladder
- deposit policy
- live-arrival guarantee
- care guide language
- show/event sources
- social accounts
- payment mode/provider
- conversation provider/SMS setup
- webhook base URL if not using the shared production backend

## Current API Boundary

Built or inspected by API:

- custom fields
- tags
- contacts
- opportunities where scope allows
- notes/tasks
- custom values
- products/prices
- trigger links
- store shipping origin
- demo shipping zone/rate
- snapshot asset inventory

Blocked or unreliable by current access/scope:

- pipeline creation in the master account
- visual funnel/page editing
- visual workflow canvas editing
- snapshot creation and import where no API/connector action is available
- A2P approval and live SMS usability

Revisit this boundary periodically because HighLevel APIs and account scopes change.
