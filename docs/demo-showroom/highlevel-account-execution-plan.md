# HighLevel Account Execution Plan

Last updated: 2026-06-05

## Current Situation

There are two active GoHighLevel roles for this phase:

- `HatchKit`
- `SunScale Geckos - Demo`

`HatchKit` remains the working master/snapshot account. `SunScale Geckos - Demo` is the live showroom account.

## Recommendation

Use the existing `HatchKit` subaccount as the working master/snapshot account for now.

The `SunScale Geckos - Demo` subaccount now exists.

Location ID:

`oCn199rzTjj0rPgqXyXU`

Do not create another demo subaccount yet.

Later, when the snapshot is ready to test, create a temporary QA/import test account:

- `Hatchkit Snapshot QA - v1`

That QA account can be deleted or archived after the snapshot import test.

## Why This Structure

### Existing `HatchKit` Subaccount

Role:

- working master build account
- clean reusable snapshot source
- production-timing workflow source
- reusable templates, fields, tags, pipelines, pages, and workflows

What belongs here:

- reusable Hatchkit assets
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

### Temporary `Hatchkit Snapshot QA - v1` Account

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
3. `Hatchkit Snapshot QA - v1`

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
- HighLevel Store shell exists and is ready for final branding/layout/publish
- campaign funnels exist or are ready to build
- demo contacts/test contacts are absent, removable, or clearly tagged
- workflows are not full of demo-only timing

If mostly clean:

- keep `HatchKit` as master

If messy:

- use `HatchKit` as the temporary working/demo account
- create a new `HatchKit - Master Snapshot` account later

Default assumption:

- keep `HatchKit` as master unless the audit proves it is too messy.

### Step 2: Confirm SunScale Demo Subaccount

Status:

- Complete.
- Active account: `SunScale Geckos - Demo`.
- Location ID: `oCn199rzTjj0rPgqXyXU`.

Manual business settings to confirm/update:

- Business/account name: `SunScale Geckos - Demo`
- Timezone: `America/New_York`
- Industry/category: pet services, breeder, ecommerce, or closest available option
- Address: `3645 Essex Ave`, `Atlanta`, `GA`, `30339`
- Phone/email: `+19843001621` / `demo@hatchkitai.com`
- Website: `https://demo.hatchkitai.com/store`

Important:

- Mark internally that this is demo-only.
- Keep the prospect-facing demo branded as SunScale, but keep A2P/business verification tied to real owner/business details.
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
3. Once the Store-first demo works, snapshot/import clean reusable assets into `Hatchkit Master Snapshot - v1`.

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

Status:

- Complete through API for contacts and opportunities.

Loaded:

- Ava Bennett
- Marcus Hill
- Jenna Ortiz
- Noah Parker
- Priya Raman
- Drew Coleman
- Taylor Brooks
- Sarah Mitchell demo operator contact

Opportunities created across:

- Lead Pipeline
- Sales Pipeline
- Shipping Pipeline

Smart lists were created manually in HighLevel:

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

Current status:

- Live audit passes 17 of 17 checks.
- A2P Brand Registration is registered with TCR.
- A2P Campaign Registration was submitted for review on 2026-06-05.
- Test the CRM/webhook/workflow path now. Run a real opted-in SMS send test after campaign approval.

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

`Hatchkit Snapshot QA - v1`

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

- `Hatchkit Snapshot QA - v1`

Only use this to test import.

## Recommended Next Action

Confirm the A2P campaign is approved, confirm the phone number is usable for SMS in HighLevel, then run a real opted-in SMS test.

The next build session should:

1. verify campaign approval and SMS number status
2. run the full published demo test path with a fresh contact
3. check workflow logs for any messaging failures
4. document live SMS result after campaign approval
5. prepare reusable source snapshot import and master sanitization
