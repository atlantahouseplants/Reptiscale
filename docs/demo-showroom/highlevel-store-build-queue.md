# SunScale HighLevel Store Build Queue

Last updated: 2026-06-08

Account:

- `SunScale Geckos - Demo`
- Location ID: `oCn199rzTjj0rPgqXyXU`

## Purpose

Finish the real HighLevel Store that future Hatchkit clients should receive.

The current funnel can stay as a campaign funnel, but the store must become the primary storefront demo.

## Current API Foundation

Already present in SunScale:

- 8 active HighLevel products
- all 8 products have store images
- all 8 marked available in the online store
- 6 product collections created and products assigned
- store shipping origin synced
- demo-safe shipping zone/rate present

Current product set:

- `Animal Reservation Deposit`
- `Crested Gecko Care Starter Kit`
- `30-Minute Setup Review`
- `Crested Gecko Starter Guide`
- `Nova - Lilly White`
- `Mango - Harlequin Dalmatian`
- `Echo - Tricolor Pinstripe`
- `Pepper - Super Dalmatian`

Run:

```powershell
npm run sync:products
npm run sync:store-catalog
npm run audit:store-readiness
```

## Store Created

Name:

`SunScale Geckos Store`

Builder ID:

`c6oIcQOaIihVIc23qseX`

Preview URL:

`https://sites.leadconnectorhq.com/preview/c6oIcQOaIihVIc23qseX`

Current status:

`created_unpublished_visual_builder_required`

Recommended paths:

- Store home: `/store`
- Products List Page: `/store/products`
- Product Details Page: `/store/product`
- Cart: `/store/cart`
- Checkout: `/store/checkout`
- Thank You: `/store/thank-you`

If HighLevel generates default paths, keep them unless changing paths is safe and does not break checkout routing.

## Store Pages

HighLevel's Store builder should create or contain:

- Products List Page
- Product Details Page
- Cart Page
- Checkout Page
- Thank You Page

These are the required customer-template pages. Do not treat the old funnel steps as replacements for these pages.

## Store Layout Requirements

### Store Home / Products List

Must show:

- SunScale branding/logo
- clear available-animal heading
- product grid/list
- product photos if available
- price/status
- collection/category filters where useful
- starter guide CTA
- VIP list CTA
- Privacy/Terms links
- compliance footer

### Product Details

Must show:

- animal/product photos
- name
- species
- morph
- sex where known
- weight
- status
- price/deposit
- buyer fit
- care/shipping notes
- reserve/add-to-cart action
- related products or care kit suggestion if supported

### Cart

Must show:

- selected animal/product
- price/deposit
- reminder that shipping is reviewed before live-animal shipment

### Checkout

Must collect:

- name
- email
- phone only if needed and compliant
- shipping/pickup details
- additional notes if useful

Must state:

- demo-safe payment behavior for showroom testing
- no live shipping label is created automatically
- weather/operator review happens before live-animal shipping

### Thank You

Must explain:

- order/reservation received
- breeder will confirm setup and shipping/pickup
- care guide or inbox next step
- no live label has been created without approval

## Product Collections

Recommended collections:

- `Available Animals`
- `Crested Geckos`
- `Reserved / Sold Examples`
- `Care & Supplies`
- `Lead Magnets / Digital`
- `Deposits & Reservations`

If smart collections are available, use simple durable rules. Otherwise use manual collections.

## Workflows To Add Or Convert

Store workflows should use Ecommerce/Payments triggers where possible:

- `HK Demo - Store Abandoned Checkout`
- `HK Demo - Store Order Submitted`
- `HK Demo - Store Deposit Paid`
- `HK Demo - Store Shipping Review`
- `HK Demo - Store Order Fulfilled`
- `HK Demo - Post-Purchase Care Onboarding`
- `HK Demo - Review Referral VIP`

Trigger priorities:

1. Ecommerce Store `Abandoned Checkout`
2. Payments `Order Submitted` with order source `Store`
3. Ecommerce Store `Order Fulfilled`
4. Contact/tag triggers only where store events cannot cover the path

SMS remains gated until A2P approval and opted-in testing are complete.

## Snapshot Rules

The HighLevel Store should be included in:

`SunScale Demo Source - Hatchkit Base v0`

After importing into `Hatchkit Master Snapshot - v1`, sanitize:

- store name
- brand/logo
- animal products
- copy
- checkout notes
- workflow names
- timing
- SMS actions

## Manual UI Steps

These are likely required in HighLevel:

1. Go to `Sites -> Stores`.
2. Open `SunScale Geckos Store`.
3. Activate Ecommerce Store inside the Website/Store builder.
4. Confirm the five Store pages exist.
5. Confirm Product List, Product Details, Cart, Checkout, and Thank You pages/elements.
6. Replace generic `My Store` / `Our Products` branding, default hero image, compliance footer, Privacy/Terms, and support copy.
7. Select/filter products for the store.
8. Confirm the six API-created collections appear in the Store Builder.
9. Configure checkout fields and thank-you behavior.
10. Publish the store.
11. Confirm the live store URL.
12. Run `npm run audit:store-readiness`.

## Done Criteria

The store is demo-ready when:

- buyer can browse products/animals
- buyer can open a product details page
- buyer can add an animal/deposit/product to cart
- checkout is understandable and demo-safe
- thank-you page explains next steps
- order/checkout events are visible in HighLevel
- workflows enroll from store events
- no live shipping label is created
- no real charge is created during demo unless explicitly using a test/sandbox payment mode
