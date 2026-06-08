# Source Snapshot Asset Map

Last updated: 2026-06-08

## Purpose

This map decides what should be copied from `SunScale Geckos - Demo`, what should stay in `Hatchkit Master Snapshot - v1`, and what should be customized only after a client buys.

## Asset Map

| Asset class | Repeatable? | Best source | Master treatment | Notes |
|---|---|---|---|---|
| Custom fields | Yes | API/master foundation | Keep master versions | 17 reusable fields already exist in both accounts. |
| Tags | Mostly | API plus source snapshot | Keep structured Hatchkit tags; remove demo-only tags | Do not keep source/test tags in the client template unless useful. |
| Custom values | Yes | Master foundation | Keep placeholder values | Use placeholders such as `{{business_name}}`, not SunScale final values. |
| Pipelines | Yes | SunScale snapshot or API if scope is fixed | Import or create clean `Hatchkit - ...` pipelines | Master API pipeline creation is currently blocked by scope. |
| Opportunities | No | None | Do not keep | Opportunities are test/client records, not template assets. |
| Contacts | No | None | Do not keep | Delete or exclude demo/test contacts before export. |
| Smart lists | Yes | SunScale UI/snapshot | Sanitize names and filters | Use lifecycle, offer, shipping, care, review, and VIP tags. |
| Products/prices | Yes, with client edits | SunScale snapshot plus master foundation | Keep generic ladder; customize pricing during onboarding | Animal-specific products should become examples or be replaced per client. |
| HighLevel Store | Yes | SunScale Store/snapshot | Sanitize as the main client storefront | This is the primary buyer-facing product surface. |
| Store pages | Yes | SunScale Store/snapshot | Keep structure; replace branding and products | Product List, Product Details, Cart, Checkout, and Thank You are required. |
| Product collections | Yes | SunScale Store/snapshot | Replace example collections during onboarding | Use Available Animals, species groups, Care & Supplies, and VIP/drop style collections. |
| Trigger links | Yes | SunScale snapshot | Rename to Hatchkit/client-safe labels | Useful for QR, starter guide, VIP, referral, and reservation paths. |
| Forms | Yes | SunScale pages/snapshot | Keep structure; replace copy/placeholders | Published forms are custom HTML/code forms posting to the webhook backend. |
| Campaign funnels/pages | Yes | SunScale snapshot | Sanitize brand/copy/assets | Use funnels for lead magnets, show QR, featured animal promos, referral, and VIP campaigns. |
| Workflows | Yes | SunScale snapshot | Convert to production timing and client placeholders | Rename from demo/Reptiscale labels to Hatchkit labels. |
| Email templates | Yes | SunScale workflows | Replace with Hatchkit/client placeholders | Keep audited copy quality. |
| SMS templates | Yes, gated | SunScale workflows | Keep draft-safe or gated | Do not assume SMS is usable before A2P approval for each client. |
| Conversations/inbox | No | None | Do not keep | Conversation examples are demo proof, not template data. |
| Payment provider | No | Client setup | Leave setup notes | Do not create real charges during build/QA. |
| Shipping labels | No | Client setup/support layer | Keep human approval gate | Do not create live shipping labels automatically. |
| Social Planner | Partly | Client setup | Use setup notes | Social accounts and approvers are client-specific. |
| Business profile | No | Client setup | Use onboarding checklist | Name, address, phone, and compliance values are client-specific. |
| Domains/DNS | No | Client setup | Use onboarding checklist | Each client needs its own domain/subdomain. |

## SunScale Source Snapshot

Create after reusable source assets are complete:

`SunScale Demo Source - Hatchkit Base v0`

Use it to carry:

- HighLevel Store structure
- Product List, Product Details, Cart, Checkout, and Thank You pages
- product collections
- pipelines
- smart lists
- campaign pages/funnels
- custom-code forms
- trigger links
- workflow structure
- message bodies
- product examples

Do not treat it as the final deliverable.

## Hatchkit Master Sanitization

After importing the source snapshot into master:

- rename `DEMO - Reptiscale - ...` workflows
- replace SunScale names, animals, URLs, and proof language
- convert one-minute waits into production timing
- remove demo/test records
- change animal-specific tags/products into generic examples or onboarding tasks
- gate SMS steps until A2P is approved per client
- confirm store triggers for abandoned checkout, order submitted, and order fulfilled
- confirm tag-added triggers for custom-code campaign form paths
- confirm webhook URLs use custom values or setup notes

## HighLevel Store MVP

Build this once in SunScale before creating the source snapshot, then sanitize it in master.

The Store is the main online selling surface for Hatchkit clients. Funnels support campaigns around the Store.

### Pages

- Store or Website homepage
- Products List Page
- Product Details Page
- Cart Page
- Checkout Page
- Thank You Page
- Privacy Policy
- Terms of Service

Campaign funnels/pages around the Store:

- Starter guide lead magnet
- Show QR opt-in
- Featured animal/drop launch page
- Review/referral page
- VIP availability list

### Store Data

The v1 template should support a boutique breeder catalog. It should not promise Shopify-level ecommerce for large sellers.

Use:

- product records for deposit, starter kit, guide, consult, and example animals
- product photos, descriptions, SKU, status, and inventory where available
- product collections for availability/species/supplies
- store checkout and thank-you pages
- custom values for current primary URLs and business details
- custom fields/tags for buyer interest and follow-up
- webhook support for safer backend handling

During client onboarding, load:

- real available animals
- species/morphs
- prices
- care notes
- hold/deposit policy
- shipping policy
- live-arrival guarantee language
- photos
- inventory quantities/status

## First Client Snapshot Contents

The exported `Hatchkit Client Snapshot - v1` should include:

- CRM fields and tags
- lead, sales, and shipping pipelines
- smart lists
- HighLevel Store
- store product list/detail/cart/checkout/thank-you pages
- product collections
- lead magnet, review/referral, VIP, and show QR campaign funnels
- production-timing workflows
- email/SMS templates with safe placeholders
- product ladder examples
- onboarding notes

It should not include:

- SunScale contacts
- demo opportunities
- fake messages
- live payment details
- live phone/SMS assumptions
- live shipping-label automation
