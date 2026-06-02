# HighLevel Account Execution Plan

Last updated: 2026-06-02

## Current Situation

There is currently one GoHighLevel subaccount:

- `HatchKit`

This account already has the pipelines, workflows, custom fields, tags, and other buildout pieces referenced by the project docs.

## Recommendation

Use the existing `HatchKit` subaccount as the working master/snapshot account for now.

Create one new subaccount:

- `SunScale Geckos - Demo`

Do not create two new subaccounts yet.

Later, when the snapshot is ready to test, create a temporary QA/import test account:

- `Reptiscale Snapshot QA - v1`

That QA account can be deleted or archived after the snapshot import test.

## Why This Structure

### Existing `HatchKit` Subaccount

Role:

- working master build account
- clean reusable snapshot source
- production-timing workflow source
- reusable templates, fields, tags, pipelines, pages, and workflows

What belongs here:

- reusable Reptiscale/HatchKit assets
- production workflow timing
- clean pages and funnels
- generic/custom-value-driven copy
- no messy sales-call test contacts if avoidable

What should not live here long-term:

- repeated demo contacts from sales calls
- prospect-specific testing records
- accelerated demo workflows mixed with production workflows unless clearly prefixed
- fake conversations that would pollute the snapshot

### New `SunScale Geckos - Demo` Subaccount

Role:

- live sales showroom
- crested gecko breeder demo
- accelerated buyer journey
- dummy contacts, opportunities, workflows, messages, and social examples

What belongs here:

- SunScale Geckos branding
- SunScale storefront
- demo animals: Nova, Mango, Echo, Pepper
- demo products and payment/order simulation
- accelerated workflows with minute-level waits
- dummy contacts and opportunities
- test conversations
- populated smart lists
- shipping hold/approve/operator examples

What should not live here:

- clean snapshot source assets unless copied from master
- final production workflow timing only
- real customer data
- real shipping label creation

### Temporary `Reptiscale Snapshot QA - v1` Account

Role:

- prove the snapshot imports correctly into a fresh account

Create this only after:

- the master account is clean
- the snapshot is exported
- the demo account is working

Delete/archive after testing if no longer needed.

## Minimum Account Count

### Right Now

Use two total accounts:

1. `HatchKit`
2. `SunScale Geckos - Demo`

### Before Selling First Customer

Use three total accounts briefly:

1. `HatchKit`
2. `SunScale Geckos - Demo`
3. `Reptiscale Snapshot QA - v1`

### After QA

Keep two permanent accounts:

1. `HatchKit`
2. `SunScale Geckos - Demo`

## Execution Plan

### Step 1: Audit Existing HatchKit Account

Goal:

Decide whether the current `HatchKit` account is clean enough to become the master snapshot source.

Check:

- custom fields exist
- tags exist
- pipelines exist
- smart lists exist
- workflows exist
- pages/funnels exist or are ready to build
- demo contacts/test contacts are absent, removable, or clearly tagged
- workflows are not full of demo-only timing

If mostly clean:

- keep `HatchKit` as master

If messy:

- use `HatchKit` as the temporary working/demo account
- create a new `HatchKit - Master Snapshot` account later

Default assumption:

- keep `HatchKit` as master unless the audit proves it is too messy.

### Step 2: Create SunScale Demo Subaccount

Create a new HighLevel subaccount named:

`SunScale Geckos - Demo`

Suggested business settings:

- Business name: SunScale Geckos
- Owner/contact: demo owner
- Timezone: America/New_York
- Industry/category: pet services, breeder, ecommerce, or closest available option
- Address: demo-only address
- Phone/email: demo/test sender values

Important:

- Mark internally that this is demo-only.
- Do not use real customer data.
- Do not connect real payment/shipping behavior without a demo-safe setup.

### Step 3: Load Or Copy Master Assets

Preferred path:

1. Export or save a snapshot from `HatchKit`.
2. Load that snapshot into `SunScale Geckos - Demo`.
3. Customize the SunScale account.

Fallback path:

If the snapshot is not ready yet:

1. Manually recreate/copy the key assets into `SunScale Geckos - Demo`.
2. Use the project docs and scripts as the source of truth.
3. Once the demo works, back-port clean reusable assets into `HatchKit`.

### Step 4: Customize SunScale Demo Account

Customize:

- business name
- owner name
- brand colors/logo
- storefront copy
- starter guide copy
- demo animal inventory
- product names/prices
- sender email/phone behavior
- smart list names
- workflow timing
- demo links

Set workflow timing:

- demo account: accelerated timing
- master account: production timing

### Step 5: Load Demo Data

Load or manually create:

- Ava Bennett
- Marcus Hill
- Jenna Ortiz
- Noah Parker
- Priya Raman
- Drew Coleman

Create opportunities across:

- Lead Pipeline
- Sales Pipeline
- Shipping Pipeline

Populate smart lists:

- New Crested Gecko Leads
- Hot Animal Buyers
- Shipping Holds
- Operator Review Queue
- Ready For Label Approval
- Review / Referral Candidates
- Repeat Buyer VIP
- Demo Contacts

### Step 6: Wire The Demo Journey

Canonical demo path:

1. Starter guide form
2. Lead magnet delivery
3. Animal interest / offer clicked
4. Reservation reminder
5. Deposit/order submitted
6. Shipping review
7. Operator gate
8. Simulated shipped
9. Simulated delivered / LAG confirmed
10. Care onboarding
11. Review/referral
12. VIP repeat-buyer invite

Webhook base URL:

`https://reptiscale-demo.vercel.app`

### Step 7: Run A Live Test

Use one fresh test buyer.

Verify:

- contact created
- fields set
- tags added
- workflow history visible
- messages sent
- opportunities created or moved
- smart lists updated
- shipping review returns expected status
- review/referral loop starts

### Step 8: Clean Master Snapshot

After the SunScale demo works:

- remove demo-only records from `HatchKit`
- keep reusable assets
- keep production workflow timing
- ensure custom values are used where possible
- make sure workflows are safe for import
- save/export the snapshot

### Step 9: Snapshot QA Clone

Create:

`Reptiscale Snapshot QA - v1`

Import the snapshot.

Verify:

- fields copied
- tags copied
- pipelines copied
- workflows copied
- pages copied
- templates copied
- custom values can be changed
- workflows can be published after account-specific settings are updated

## Decision Tree

### If You Want The Fastest Sales Demo

Create only:

- `SunScale Geckos - Demo`

Then copy/build the showroom there.

### If The Existing HatchKit Account Is Too Messy

Create:

- `HatchKit - Master Snapshot`
- `SunScale Geckos - Demo`

Use the new master account as the clean source and keep the current HatchKit account as a reference.

### If You Are Ready To Export A Snapshot

Create:

- `Reptiscale Snapshot QA - v1`

Only use this to test import.

## Recommended Next Action

Create `SunScale Geckos - Demo` in HighLevel.

After it exists, the next build session should:

1. confirm the new location/subaccount ID
2. add it to the local breeder config
3. decide whether to load a snapshot or manually copy assets
4. build the buyer-facing showroom pages
5. wire accelerated workflows

