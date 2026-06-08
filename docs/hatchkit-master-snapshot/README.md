# Hatchkit Master Snapshot

Last updated: 2026-06-08

Clean HighLevel source account:

- Name: `Hatchkit Master Snapshot - v1`
- Location ID: `H81tekJbNbeyYsnTRKVH`

## Purpose

This account is the clean reusable template that future Hatchkit client subaccounts are cloned from.

It is separate from:

- `HatchKit` business CRM: internal sales, marketing, leads, clients, and onboarding.
- `SunScale Geckos - Demo`: sales showroom with fake contacts, demo opportunities, accelerated workflows, and demo proof records.

## Strategy

Do not manually rebuild every reusable asset in the master account if the same asset already exists in SunScale.

Use SunScale as the source prototype, then clean the imported result:

1. Finish the real HighLevel Store plus reusable campaign funnels and workflows in `SunScale Geckos - Demo`.
2. Create `SunScale Demo Source - Hatchkit Base v0`.
3. Load that source snapshot into `Hatchkit Master Snapshot - v1`.
4. Sanitize the master account into the clean customer template.
5. Export `Hatchkit Client Snapshot - v1` only from the master account.

Supporting docs:

- `docs/hatchkit-master-snapshot/strategic-build-plan.md`
- `docs/hatchkit-master-snapshot/source-snapshot-asset-map.md`
- `docs/hatchkit-master-snapshot/execution-loop.md`
- `docs/hatchkit-master-snapshot/internal-execution-prompt.md`
- `docs/hatchkit-master-snapshot/snapshot-asset-inventory.md`
- `docs/demo-showroom/store-first-commerce-decision.md`
- `docs/demo-showroom/highlevel-store-build-queue.md`

## Snapshot Rule

Create customer snapshots from `Hatchkit Master Snapshot - v1`, not from the SunScale demo account.

The master snapshot should include:

- reusable custom fields
- structured tags
- lead, sales, and shipping pipelines
- product ladder
- placeholder custom values
- reusable smart-list definitions
- reusable HighLevel Store/Website
- reusable Store pages: Product List, Product Details, Cart, Checkout, Thank You
- reusable campaign funnels
- production-timing workflows
- email/SMS templates with Hatchkit/client placeholders
- setup and QA instructions

The master snapshot should not include:

- SunScale branding as final copy
- demo contacts
- fake opportunities
- `hatchkit.demo.*` test records
- accelerated one-minute demo waits
- live payment credentials
- live shipping-label automation
- assumptions that SMS is ready before A2P approval

## Current API Status

The clean master account is partially built through the HighLevel API.

- Created: 17 reusable contact custom fields.
- Created: 65 structured tags.
- Created: 12 placeholder custom values.
- Created: 4 reusable products/prices.
- Blocked: the 3 Hatchkit pipelines because the current token is not authorized for the opportunities/pipelines write scope.

Latest source/master inventory:

| Asset | SunScale Source | Hatchkit Master |
|---|---:|---:|
| custom fields | 17 | 17 |
| tags | 84 | 65 |
| custom values | 10 | 12 |
| pipelines | 3 | 0 |
| products | 8 | 4 |
| trigger links | 6 | 0 |
| workflows | 12 | 0 |

This confirms the SunScale account should be used to carry reusable Store structure, pipelines, products, trigger links, workflows, campaign pages, and smart-list structure into the master through snapshot import where possible.

The setup command can be rerun idempotently after the missing pipeline scope is granted:

```powershell
npm run setup:master-snapshot
```

This setup command creates only reusable CRM foundation objects. It must not seed demo contacts or opportunities.

## Build Order

1. Run `npm run audit:snapshot-assets` before each build pass.
2. Finish the real HighLevel Store/source assets in SunScale.
3. Create `SunScale Demo Source - Hatchkit Base v0`.
4. Load that source snapshot into `Hatchkit Master Snapshot - v1`.
5. Rerun `npm run setup:master-snapshot` only for API-safe master foundation updates.
6. Sanitize Store branding, product examples, names, copy, custom values, tags, workflow timing, triggers, and checkout behavior.
7. Create or fix any remaining pipelines manually only if snapshot import and API scope both cannot handle them.
8. QA the clean account with one temporary test contact, then delete or document that test contact before snapshot export.
9. Export `Hatchkit Client Snapshot - v1`.
10. Import the snapshot into a fresh QA subaccount.
11. Run the full client onboarding QA path.
