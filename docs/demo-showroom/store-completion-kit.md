# SunScale Store Completion Kit

Last updated: 2026-06-08

Purpose: everything you need to take `SunScale Geckos Store` from an unpublished
shell to a live, sellable storefront in one sitting. This is paste-ready copy mapped
to the HighLevel visual-builder steps. Claude built the API foundation (products,
images, prices, collections, shipping origin); the steps below are the manual
visual-builder work that only you can click.

## Where To Work

- HighLevel account: `SunScale Geckos - Demo`
- Location ID: `oCn199rzTjj0rPgqXyXU`
- Path: `Sites -> Stores -> SunScale Geckos Store`
- Store builder ID: `c6oIcQOaIihVIc23qseX`
- Preview URL: `https://sites.leadconnectorhq.com/preview/c6oIcQOaIihVIc23qseX`
- Current status (per `npm run audit:store-readiness`): `store_shell_created_visual_builder_required`

After each work session, re-run:

```powershell
npm run audit:store-readiness
```

Done when the status flips away from `visual_builder_required` and a live store URL resolves.

## Live Product Truth (verified 2026-06-08 via API)

| Product | Type | Price | In store | Image |
|---|---|---:|:--:|:--:|
| Nova - Lilly White | Animal | $1,200 | yes | yes |
| Echo - Tricolor Pinstripe | Animal | $650 | yes | yes |
| Pepper - Super Dalmatian | Animal | $475 | yes | yes |
| Mango - Harlequin Dalmatian | Animal | $225 | yes | yes |
| Animal Reservation Deposit | Deposit | $75 | yes | yes |
| Crested Gecko Care Starter Kit | Supplies | $49 | yes | yes |
| 30-Minute Setup Review | Service | $35 | yes | yes |
| Crested Gecko Starter Guide | Lead magnet | Free | yes | yes |

Collections already created (6): `Available Animals`, `Crested Geckos`,
`Reserved / Sold Examples`, `Care & Supplies`, `Lead Magnets / Digital`,
`Deposits & Reservations`.

---

## 1. Global Store Branding

Replace all default Store Builder branding (`My Store`, `Our Products`, default hero image).

- Store name: `SunScale Geckos`
- Tagline: `Crested geckos raised with care`
- Logo: SunScale logo asset (same logo used on the funnel at `demo.hatchkitai.com`)
- Primary color: `#2F80ED` (Hatch Blue) for buttons/links
- Accent: `#00B8A9` (Fresh Teal) for trust/safety badges
- Background: `#FFF7E6` (Warm Eggshell) for soft sections; white for cards

## 2. Store Home / Products List Page

**Hero**

- Eyebrow: `Crested geckos raised with care`
- H1: `SunScale Geckos`
- Subhead: `Browse available crested geckos, reserve the right animal, and get clear care and shipping guidance before anything leaves the reptile room.`
- Primary button: `Shop Available Geckos` -> scroll to grid / Available Animals collection
- Secondary button: `Get the Free Starter Guide` -> Crested Gecko Starter Guide product

**Trust band (4 items, use teal check icons)**

- Weather-first shipping
- Care onboarding after purchase
- Simple reservation deposits
- VIP first-look on future geckos

**Product grid**

Surface `Available Animals` first, then `Care & Supplies`. Show photo, name, morph,
price, and status badge (`Available` / `Reserved`) on each card.

**Bottom CTA strip**

- Heading: `Not ready to pick an animal yet?`
- Button: `Get the Free Starter Guide`

## 3. Product Detail Pages (paste-ready)

Use this structure on every product: photo(s), name, the spec line, the description,
the care/shipping note, and the action button. Animals use `Reserve` (routes to the
Animal Reservation Deposit); supplies/services use `Add to Cart`.

### Nova — Lilly White
- Spec: Crested gecko · Lilly White · Probable female · 28g · **$1,200** · Available
- Description: `Nova is a clean, high-contrast Lilly White with strong dorsal structure and even pattern — a standout pick for a keeper ready to step into collector-grade animals. Calm in hand and a confident feeder.`
- Care/shipping note: `Live arrival is reviewed before any label is purchased. Nova ships only on a safe weather window or is available for local pickup.`
- Action: `Reserve Nova`

### Echo — Tricolor Pinstripe
- Spec: Crested gecko · Tricolor Pinstripe · Male · 41g · **$650** · Reserved
- Description: `Echo is a proven, full-grown tricolor pin with crisp edge work — shown here as an example of a reserved animal so buyers can see how SunScale handles a held/sold listing.`
- Care/shipping note: `This animal is currently reserved. Join the VIP list to hear about similar males first.`
- Action: `Join VIP for Similar` (routes to VIP / Starter Guide) — keep purchase disabled to demonstrate a Reserved state.

### Pepper — Super Dalmatian
- Spec: Crested gecko · Super Dalmatian · Probable male · 24g · **$475** · Available
- Description: `Pepper carries heavy, well-distributed dalmatian spotting on a clean base — a strong mid-tier animal for a keeper who wants spots without a top-shelf budget. Active and curious.`
- Care/shipping note: `Live arrival is reviewed before any label is purchased. Safe weather window or local pickup.`
- Action: `Reserve Pepper`

### Mango — Harlequin Dalmatian
- Spec: Crested gecko · Harlequin Dalmatian · Unsexed juvenile · 12g · **$225** · Available
- Description: `Mango is a bright, beginner-friendly juvenile with red-orange tone, clean spotting, and a curious feeding response — the kind of animal that helps a new keeper feel confident without jumping into a high-end project.`
- Care/shipping note: `Live arrival is reviewed before any label is purchased. Safe weather window or local pickup.`
- Action: `Reserve Mango`

### Animal Reservation Deposit
- Spec: Deposit · **$75** · refundable toward purchase
- Description: `A $75 reservation deposit holds your chosen gecko while pickup, shipping, weather, and setup details are confirmed. The deposit applies to the final price. Sarah reviews every live-animal shipment before a label is purchased.`
- Action: `Pay Reservation Deposit` (demo-safe — see checkout note)

### Crested Gecko Care Starter Kit
- Spec: Supplies · **$49**
- Description: `The essentials a new keeper should have ready before pickup or shipping day: appropriate enclosure guidance, hydration and feeding basics, and a setup checklist. Pairs well with any first gecko.`
- Action: `Add to Cart`

### 30-Minute Setup Review
- Spec: Service · **$35**
- Description: `A short one-on-one review of your enclosure photos and setup before your gecko arrives. Sarah checks humidity, temperature, hides, and feeding plan so day one goes smoothly.`
- Action: `Add to Cart`

### Crested Gecko Starter Guide
- Spec: Digital · **Free**
- Description: `A simple care plan for new keepers: enclosure size, humidity, feeding, heat, first-week expectations, and what to buy before pickup or shipping day. Free — just tell us where to send it.`
- Action: `Get the Free Guide` (captures the lead; routes into the starter-guide journey)

## 4. Cart Page

- Show selected animal/product, price/deposit, quantity.
- Reminder block (teal): `Live animals are never auto-shipped. After checkout, Sarah confirms pickup or a safe shipping window before anything leaves the reptile room.`

## 5. Checkout Page

**Collect:** name, email, phone, shipping/pickup preference, optional notes.

**Demo-safe behavior — required copy near the pay button:**

`This is a demonstration store. No live payment is charged and no shipping label is created automatically. For real orders, SunScale reviews weather and shipping before any live-animal label is purchased.`

> Keep payments in test/sandbox mode for the showroom. Do not connect a live payment
> processor that would create real charges during a demo.

## 6. Thank-You Page

- Heading: `Reservation received — nicely done.`
- Body: `Thanks for reserving with SunScale Geckos. Sarah will confirm your pickup or a safe shipping window, send your care guide, and walk you through next steps. No shipping label is created until your shipment is reviewed and approved.`
- Next-step button: `Read the Care Guide` -> Starter Guide.

## 7. Footer / Compliance (all pages)

- Compliance footer (same as funnel): business name, contact, and the A2P-required language already approved on `demo.hatchkitai.com`.
- Links: `Privacy Policy`, `Terms` (reuse the published pages).
- Add the HighLevel chat widget for A2P consistency.

## 8. Publish + Verify Checklist

1. `Sites -> Stores -> SunScale Geckos Store`.
2. Activate the Ecommerce Store in the Website/Store builder.
3. Confirm the 5 store pages exist: Products List, Product Details, Cart, Checkout, Thank You.
4. Apply branding (section 1) — remove every `My Store` / `Our Products` / default hero.
5. Build the home/products list (section 2).
6. Confirm each of the 8 product detail pages reads like section 3.
7. Confirm the 6 API-created collections appear and are assigned.
8. Set checkout fields + demo-safe copy (section 5).
9. Set thank-you copy (section 6).
10. Apply footer/compliance (section 7).
11. Publish the store. Capture the live store URL.
12. Run `npm run audit:store-readiness` and confirm status changed.
13. Do one full outside-in test: browse -> product detail -> add to cart -> checkout -> thank-you, and confirm the order/checkout event appears in HighLevel.

## Done Criteria

- Buyer can browse animals, open a product detail page, add to cart, and reach a demo-safe checkout and thank-you page.
- Order/checkout events are visible in HighLevel.
- Store-triggered workflows enroll from store events (see `store-workflow-specs.md`).
- No live shipping label and no real charge during a demo.
