# HatchKit Demo Showroom Docs

Last updated: 2026-06-02

This folder is the source of truth for turning the current HatchKit/Reptiscale technical build into a sellable GoHighLevel demo showroom.

## Read In This Order

1. `hatchkit-ghl-demo-showroom-prd.md`
   - Defines the product decision, demo experience, required assets, and success criteria.

2. `master-build-plan.md`
   - Turns the PRD into build phases, deliverables, owners, and acceptance checks.

3. `subagent-execution-plan.md`
   - Defines the workstreams for parallel agent or human execution.

4. `highlevel-account-execution-plan.md`
   - Defines which HighLevel subaccounts to use or create.

5. `pre-subaccount-prep-plan.md`
   - Lists what can be prepared while waiting for the new HighLevel subaccount.

6. `pre-subaccount-build-package.md`
   - Index of completed copy-ready pages, workflow recipes, import data, script, and visual assets.

7. `gap-register.md`
   - Tracks what is missing between the current project and a sales-ready showroom.

8. `breeder-input-checklist.md`
   - Lists what to ask a real crested gecko breeder for better demo realism.

## Product Direction

Near-term product:

HatchKit/Reptiscale is a done-for-you GoHighLevel agency/SaaS system for reptile breeders.

The product sold to a breeder is a branded HighLevel subaccount with storefront, CRM, inbox, automations, campaigns, shipping review, care onboarding, reviews, referrals, and repeat-buyer systems.

The Vercel server is the automation support layer. It is not the main product demo.

## Immediate Next Step

Confirm the HighLevel account structure:

- use the existing `HatchKit` subaccount as the working master/snapshot account for now
- create one new `SunScale Geckos - Demo` subaccount for the live showroom

After that, execute the workstreams in `subagent-execution-plan.md`.
