# Store-First Commerce Decision

Last updated: 2026-06-08

## Decision

Hatchkit should use a HighLevel Store/Website as the primary online selling surface for breeder clients.

Funnels remain part of Hatchkit, but only as campaign assets around the store:

- starter guide opt-in
- show QR lead capture
- featured animal promotion
- VIP/drop launch page
- abandoned reservation recovery
- referral/review capture

The current SunScale funnel was useful for a fast showroom proof, but it should not become the final customer storefront pattern.

## Why

The customer problem is not just "build a landing page." The breeder needs a place to list, merchandise, reserve, sell, and manage available animals.

HighLevel's current ecommerce docs support this direction:

- Only Websites can create and use the Ecommerce Online Store feature.
- Adding an online store creates the Products List, Product Details, Cart, Checkout, and Thank You pages.
- Products can be made visible in the online store.
- Products support images, rich descriptions, variants, SKU, weight, dimensions, and inventory tracking.
- Stores support product sorting, filtering, collections, checkout customization, abandoned checkout workflows, order submitted workflows, and fulfilled-order workflows.

Official references:

- `https://help.gohighlevel.com/a/solutions/articles/155000001157/edit?portalId=48000045315`
- `https://help.gohighlevel.com/support/solutions/articles/155000001633`
- `https://help.gohighlevel.com/support/solutions/articles/155000005071/`
- `https://help.gohighlevel.com/support/solutions/articles/155000003435-how-to-use-the-inventory-management-features-for-your-online-store-in-highlevel`
- `https://help.gohighlevel.com/support/solutions/articles/155000006616-products-manual-and-smart-collections`
- `https://help.gohighlevel.com/support/solutions/articles/155000006238-custom-product-details-page-for-e-commerce-stores`
- `https://help.gohighlevel.com/support/solutions/articles/155000007380-workflow-triggers-abandoned-checkout-trigger-for-e-commerce-stores`
- `https://help.gohighlevel.com/support/solutions/articles/155000003535-workflow-trigger-order-submitted`
- `https://help.gohighlevel.com/support/solutions/articles/155000007390-workflow-trigger-order-fulfilled-for-ecommerce-stores-`

## Product Positioning

Hatchkit is not trying to replace Shopify for high-volume ecommerce.

Hatchkit should be sold as:

- a boutique breeder storefront
- a CRM and buyer follow-up system
- a live-animal reservation and shipping-review workflow
- a care, review, referral, and repeat-buyer engine
- a HighLevel subaccount customized for each breeder

This is strong for small and mid-sized breeders who sell limited, high-touch inventory. It is not the right promise for large ecommerce sellers needing deep marketplace, warehouse, or Shopify app-ecosystem features.

## Required SunScale Demo Change

Before creating `SunScale Demo Source - Hatchkit Base v0`, build a real HighLevel Store in `SunScale Geckos - Demo`.

The Store should include:

- Products List Page with available animals and supplies
- Product Details Page
- Cart Page
- Checkout Page
- Thank You Page
- product collections
- sorting/filtering where useful
- branded checkout
- demo-safe purchase/reservation path
- store-order workflows

The existing funnel should stay, but it should become a campaign/demo funnel that supports the store.

## Required Snapshot Change

The source snapshot should copy:

- HighLevel Store structure
- store pages
- product list/detail/cart/checkout/thank-you setup
- store-safe products and collections
- abandoned checkout workflow
- order submitted workflow
- order fulfilled/shipping-review workflow

The master snapshot should sanitize:

- SunScale branding
- animal-specific copy
- demo-only products
- live SMS assumptions
- demo payment behavior

## Current API Boundary

API can currently help with:

- products
- prices
- product online-store visibility
- store shipping origin
- shipping zones/rates
- product collections and product assignment
- product/store readiness audit

Likely browser/manual Store Builder work:

- creating the Store/Website shell
- activating the Ecommerce Store in the builder
- adding and arranging Store elements
- styling Product List, Product Details, Cart, Checkout, and Thank You pages
- mapping Custom Product Detail Pages if needed
- final visual QA

## Demo Acceptance

The SunScale demo is not source-snapshot-ready until a prospect can:

1. Open the SunScale store.
2. Browse available animals.
3. Open an animal product detail page.
4. Add a reservation/deposit or product to cart.
5. Reach checkout without confusion.
6. Complete a demo-safe order path.
7. Land on a clear thank-you/next-step page.
8. See the CRM contact/order/workflow proof in HighLevel.
9. See abandoned checkout/order/shipping/care/review automation paths.
