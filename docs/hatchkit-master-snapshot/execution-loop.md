# Hatchkit Snapshot Execution Loop

Last updated: 2026-06-08

## Goal

Drive the Hatchkit template build as far as possible with API, scripts, connector tools, and browser automation before asking the human operator to do manual HighLevel steps.

## Loop

### 1. Inventory

Run:

```powershell
npm run audit:snapshot-assets
```

Review:

- `docs/hatchkit-master-snapshot/snapshot-asset-inventory.md`
- `docs/hatchkit-master-snapshot/snapshot-asset-inventory.json`
- `docs/demo-showroom/sunscale-store-readiness.md`

Decide whether each gap should be:

- built by API
- copied by HighLevel snapshot
- edited in browser/UI
- left as client onboarding
- left as provider/compliance work

### 2. Build What API Can Build

Use scripts for repeatable API work:

```powershell
npm run setup:master-snapshot
npm run sync:products
npm run audit:store-readiness
```

Allowed API-built master assets:

- custom fields
- tags
- custom values
- reusable products/prices
- product online-store visibility
- pipelines only if scope allows
- trigger links only if scope allows and values are clean

Do not API-seed:

- demo contacts
- fake opportunities
- proof records
- real payment credentials
- live shipping-label automation

### 3. Snapshot What HighLevel Can Clone

Prefer HighLevel snapshot/import for:

- HighLevel Store/Website structure
- Product List, Product Details, Cart, Checkout, and Thank You pages
- product collections
- visual pages/funnels
- custom-code form layouts
- workflow canvas structure
- trigger link wiring
- smart lists
- pipelines if API scope is blocked
- product examples if import support works better than API

Source snapshot name:

`SunScale Demo Source - Hatchkit Base v0`

Load target:

`Hatchkit Master Snapshot - v1`

### 4. Sanitize The Master

After source snapshot import, clean:

- Store/Website names, branding, product examples, and checkout copy
- names
- copy
- timing
- placeholders
- trigger paths
- webhook URLs
- product examples
- tags
- smart-list filters

Required naming:

- use `Hatchkit`, `HK - ...`, or `Hatchkit - ...`
- do not introduce new `Reptiscale` names
- keep historical backend URLs only where they are currently required infrastructure

### 5. Audit

Run Store readiness checks after product or Store changes:

```powershell
npm run audit:store-readiness
```

Run public/demo checks when the SunScale demo changes:

```powershell
node scripts\audit-demo-showroom-live.js
node scripts\audit-highlevel-automation-messages.js --wait=90 --fail-on-mismatch
```

Run source/master inventory after master changes:

```powershell
npm run audit:snapshot-assets
```

### 6. QA The Master

Use one temporary QA contact.

Confirm:

- Store product list/detail/cart/checkout path
- abandoned checkout and order-submitted trigger enrollment
- lead capture path
- tags
- fields
- smart-list membership
- workflow enrollment
- email content
- SMS gating
- pipeline/opportunity movement
- webhook calls

Delete or document the QA contact before export.

### 7. Export And QA Import

Export:

`Hatchkit Client Snapshot - v1`

Import into:

`Hatchkit Snapshot QA - v1`

Run the full buyer journey there before client delivery.

## Stop Conditions

Only stop for human-in-loop work when:

- HighLevel snapshot creation/import requires UI access not available to tools
- Store Builder layout, product page mapping, or collection setup requires UI access not available to tools
- API scope blocks writes and no safe browser automation path exists
- A2P approval or SMS provider status must be checked by the account owner
- payment setup requires real account credentials
- domain/DNS setup requires registrar access
- a live shipping label could be created
- visual review/brand approval is required

## Manual Output Format

When tool-possible work is exhausted, give the user:

1. What is already done.
2. The exact remaining manual steps in order.
3. The exact account and page to open.
4. The exact names to create or select.
5. The test to run afterward.
6. Any step that must wait for A2P, payment, domain, or shipping-provider readiness.
