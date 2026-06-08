# Hatchkit Strategic Build Plan

Last updated: 2026-06-08

## Objective

Build a repeatable Hatchkit delivery system for reptile breeders without manually recreating assets that already exist in the SunScale demo account.

The final customer deliverable is a clean HighLevel snapshot exported from `Hatchkit Master Snapshot - v1`.

Official HighLevel snapshot references:

- `https://help.gohighlevel.com/support/solutions/articles/48000982511-snapshots-overview`
- `https://help.gohighlevel.com/support/solutions/articles/48000982512-creating-new-snapshots-in-highlevel`
- `https://help.gohighlevel.com/support/solutions/articles/48000982582-load-snapshots-into-existing-sub-account`

Official HighLevel Store references:

- `https://help.gohighlevel.com/a/solutions/articles/155000001157/edit?portalId=48000045315`
- `https://help.gohighlevel.com/support/solutions/articles/155000001633`
- `https://help.gohighlevel.com/support/solutions/articles/155000003435-how-to-use-the-inventory-management-features-for-your-online-store-in-highlevel`
- `https://help.gohighlevel.com/support/solutions/articles/155000006238-custom-product-details-page-for-e-commerce-stores`
- `https://help.gohighlevel.com/support/solutions/articles/155000007380-workflow-triggers-abandoned-checkout-trigger-for-e-commerce-stores`

## Account Map

### Hatchkit Business CRM

Use this for Hatchkit's own marketing, sales, customers, onboarding, support, and internal follow-up.

Do not use it as the customer template unless internal records are fully separated.

### SunScale Geckos - Demo

Location ID:

- `oCn199rzTjj0rPgqXyXU`

Use this as:

- live sales showroom
- proof account
- source prototype for reusable breeder assets

It can keep demo records and accelerated workflows because it is designed for sales demonstrations.

### Hatchkit Master Snapshot - v1

Location ID:

- `H81tekJbNbeyYsnTRKVH`

Use this as:

- clean reusable template account
- source account for `Hatchkit Client Snapshot - v1`

It must stay clean of demo contacts, fake opportunities, SunScale-specific final copy, real payment credentials, and live shipping-label automation.

### Hatchkit Snapshot QA - v1

Use this as:

- the test import account for validating the exported customer snapshot before using it with a real client

Create this only when the master account is ready to export.

## Current State

The SunScale account is ahead of the master account in reusable build assets.

Latest inventory:

- `docs/hatchkit-master-snapshot/snapshot-asset-inventory.md`

Current counts:

| Asset | SunScale Source | Hatchkit Master |
|---|---:|---:|
| custom fields | 17 | 17 |
| tags | 84 | 65 |
| custom values | 10 | 12 |
| pipelines | 3 | 0 |
| products | 8 | 4 |
| trigger links | 6 | 0 |
| workflows | 12 | 0 |

This means the smart path is to snapshot and import reusable structure from SunScale, then clean it in the master account.

## Build Phases

### Phase 1 - Inventory And Boundary

Status:

- API inventory is in place.

Actions:

- Run `npm run audit:snapshot-assets`.
- Confirm which assets exist in SunScale and master.
- Keep `snapshot-asset-inventory.md` as the current gap list.
- Separate reusable assets from demo-only records.

### Phase 2 - Finish Reusable SunScale Source Assets

Build the real store-shaped pieces once in SunScale before snapshotting.

Required:

- HighLevel Store/Website named `SunScale Geckos Store`
- Products List Page
- Product Details Page
- Cart Page
- Checkout Page
- Thank You Page
- available animal/product grid
- product collections
- branded checkout copy
- starter guide campaign funnel
- review/referral page
- VIP availability list
- privacy and terms pages
- store workflows for abandoned checkout, order submitted, and order fulfilled
- campaign workflow triggers that work with custom-code forms and webhooks

Keep accelerated timing in SunScale because it is still the sales showroom.

The current funnel-only showroom should remain as campaign proof, not as the final customer storefront pattern.

### Phase 3 - Create Source Snapshot

Create a HighLevel snapshot from SunScale named:

`SunScale Demo Source - Hatchkit Base v0`

Purpose:

- carry reusable HighLevel structure into the master account
- avoid manual recreation of Store pages, campaign funnels, pipelines, trigger links, workflows, products, collections, and smart-list logic

This snapshot is not the customer deliverable.

### Phase 4 - Import Into Hatchkit Master

Load the source snapshot into:

`Hatchkit Master Snapshot - v1`

During import:

- preserve the master account's cleaner custom fields and placeholder custom values where they are better
- accept reusable pipelines, pages, workflows, trigger links, and products from the source snapshot where useful
- accept the HighLevel Store structure from the source snapshot where useful
- resolve duplicates deliberately

### Phase 5 - Sanitize The Master

Remove or rewrite:

- `DEMO - Reptiscale - ...` names
- SunScale final copy
- animal-specific demo offers as default content
- SunScale Store branding and demo animal inventory as final template content
- accelerated waits
- demo-only tags
- fake contacts and opportunities
- any SMS assumptions before A2P approval

Convert to:

- `HK - ...` workflow names
- Hatchkit/client placeholders
- production-safe workflow timing
- client onboarding notes
- SMS gates and draft-safe instructions

### Phase 6 - QA Master

Use one temporary test contact.

Verify:

- store browsing and checkout work
- abandoned checkout and order-submitted paths enroll correctly
- form submission creates the contact
- expected tags and custom fields are applied
- smart-list filters catch the contact
- workflow enrollment occurs
- email content is correct
- SMS is disabled or safely gated until A2P approval
- pipeline/opportunity movement works
- webhook calls hit the correct support backend

Delete or document the temporary contact before export.

### Phase 7 - Export Client Snapshot

Export from `Hatchkit Master Snapshot - v1` as:

`Hatchkit Client Snapshot - v1`

Do not export directly from SunScale for client delivery.

### Phase 8 - QA Import

Import into:

`Hatchkit Snapshot QA - v1`

Run the full onboarding test:

- set business profile
- set custom values
- set domain/page URLs
- browse the Store and open product details
- complete a demo-safe store checkout path
- submit lead magnet
- reserve an animal
- simulate deposit/payment only where safe
- verify email
- verify SMS only after A2P-ready phone setup
- verify pipeline and workflow logs

### Phase 9 - First Client Delivery

Clone the approved client snapshot into a new client subaccount.

Then customize:

- branding
- pages
- animal inventory
- product collections
- store checkout settings
- products/prices
- messaging setup
- payments
- social accounts
- shipping origin and policy
- support handoff

## Build Priority

1. Keep the SunScale demo working and auditable.
2. Build the real reusable HighLevel Store in SunScale.
3. Snapshot/import instead of manually rebuilding.
4. Sanitize the master into a clean template.
5. QA through a separate import before selling as a deliverable.

## Decision Rules

- If an asset is reusable and already exists in SunScale, prefer snapshot/import.
- If an asset is core selling surface, build it as a HighLevel Store/Website, not as a funnel-only workaround.
- If an asset is pure CRM vocabulary and simple through API, build it in master through API.
- If an asset is visual HighLevel canvas work, use browser/manual only when API/connector cannot edit it.
- If an asset is client-specific, document it as onboarding work instead of putting real values into the master.
- If an action could send real SMS, charge money, or create a shipping label, gate it behind human approval.
