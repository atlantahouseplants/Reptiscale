# Next Codex Chat Prompt

Copy this into a new Codex chat from:

`C:\Users\wallg\OneDrive\Desktop\HatchKit`

```text
We are working in:
C:\Users\wallg\OneDrive\Desktop\HatchKit

Product name:
- The official product name is Hatchkit.
- Do not introduce new Reptiscale naming.
- Historical backend/project URLs may still contain reptiscale-demo until a planned migration.

Please read these first:
1. NEXT_SESSION_HANDOFF.md
2. docs/demo-showroom/README.md
3. docs/demo-showroom/highlevel-demo-account-build-status.md
4. docs/demo-showroom/manual-highlevel-build-queue.md
5. docs/demo-showroom/sunscale-subaccount-setup-runbook.md
6. docs/demo-showroom/accelerated-workflow-recipes.md
7. docs/demo-showroom/repeatable-client-snapshot-process.md
8. docs/demo-showroom/automation-message-live-audit.md
9. docs/hatchkit-master-snapshot/README.md
10. docs/hatchkit-master-snapshot/strategic-build-plan.md
11. docs/hatchkit-master-snapshot/source-snapshot-asset-map.md
12. docs/hatchkit-master-snapshot/execution-loop.md
13. docs/hatchkit-master-snapshot/internal-execution-prompt.md
14. docs/hatchkit-master-snapshot/manual-build-queue.md
15. docs/hatchkit-master-snapshot/snapshot-asset-inventory.md
16. docs/demo-showroom/store-first-commerce-decision.md
17. docs/demo-showroom/highlevel-store-build-queue.md
18. docs/demo-showroom/sunscale-store-readiness.md

Accounts:
- SunScale Geckos - Demo: live showroom and source prototype.
- SunScale location ID: oCn199rzTjj0rPgqXyXU.
- Hatchkit Master Snapshot - v1: clean reusable master template.
- Master location ID: H81tekJbNbeyYsnTRKVH.
- Hatchkit business CRM: internal marketing/sales/customer operations, not the client template.

Published/live context:
- Published showroom: https://demo.hatchkitai.com
- Vercel/backend support layer: https://reptiscale-demo.vercel.app
- Live showroom audit passes 17/17.
- Message audit passes with overallStatus=pass and mismatchCount=0.
- All 12 accelerated SunScale workflows are published.
- Store-first decision: Hatchkit clients should receive a HighLevel Store/Website as the primary storefront. Funnels are campaign assets around the store.
- Store readiness audit currently passes the API foundation, including products and collections, but requires Store Builder UI work.
- Published HighLevel pages use custom HTML/code forms, not native HighLevel forms.
- Those forms post to the Vercel/Hatchkit webhook backend.
- Custom-code form paths need tag-added or webhook-safe triggers.
- A2P Brand is registered with TCR.
- A2P Campaign was submitted for review on 2026-06-05.
- Live SMS still needs campaign approval and a real opted-in SMS test.

Snapshot strategy:
- Do not manually rebuild every reusable asset in the master account if it can be copied from SunScale through a HighLevel snapshot.
- Finish/publish the created real HighLevel Store in SunScale first.
- Create SunScale Demo Source - Hatchkit Base v0.
- Load that source snapshot into Hatchkit Master Snapshot - v1.
- Sanitize the master.
- Export Hatchkit Client Snapshot - v1 only from the master.
- Import into Hatchkit Snapshot QA - v1 before using with a paying customer.

Current master state:
- 17 reusable custom fields.
- 65 structured tags.
- 12 placeholder custom values.
- 4 reusable products/prices.
- Pipelines are blocked by missing opportunities/pipelines write scope unless solved by source snapshot import or manual UI.

Useful checks:
node scripts\audit-demo-showroom-live.js
node scripts\audit-highlevel-automation-messages.js --wait=90 --fail-on-mismatch
npm run audit:snapshot-assets
npm run audit:store-readiness
npm run setup:master-snapshot
npm run sync:store-catalog

Constraints:
- Do not expose or print .env secrets or pasted private tokens.
- Do not write private tokens into files.
- Do not touch the nested HatchKit.ai folder unless explicitly asked.
- Do not create live shipping labels.
- Do not create real payment charges.
- Do not seed demo contacts or fake opportunities into the master account.
- Do not treat SMS as fully ready until campaign approval and a real opted-in test pass.

Goal for this new chat:
Build everything possible through API, connector tools, and browser automation first. Only after tool-possible work is exhausted, give the human operator exact manual HighLevel steps.

Start by checking repo state, running npm run audit:snapshot-assets and npm run audit:store-readiness, then help finish/publish `SunScale Geckos Store` in HighLevel before source snapshot creation.
```
