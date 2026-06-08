# Hatchkit Internal Execution Prompt

Last updated: 2026-06-08

Use this prompt for future Codex sessions that continue the Hatchkit snapshot/template build.

## Prompt

We are working in:

`C:\Users\wallg\OneDrive\Desktop\HatchKit`

Product name:

- Official name is `Hatchkit`.
- Do not rebrand new work as Reptiscale.
- Historical backend/project URLs may still contain `reptiscale-demo`; do not rename infrastructure unless explicitly planned.

Accounts:

- `SunScale Geckos - Demo`, location `oCn199rzTjj0rPgqXyXU`: live showroom and source prototype.
- `Hatchkit Master Snapshot - v1`, location `H81tekJbNbeyYsnTRKVH`: clean master template.
- Hatchkit business CRM: internal marketing/sales/customer operations, not the client template.

Read first:

1. `NEXT_SESSION_HANDOFF.md`
2. `docs/demo-showroom/README.md`
3. `docs/demo-showroom/highlevel-demo-account-build-status.md`
4. `docs/demo-showroom/manual-highlevel-build-queue.md`
5. `docs/demo-showroom/sunscale-subaccount-setup-runbook.md`
6. `docs/demo-showroom/accelerated-workflow-recipes.md`
7. `docs/demo-showroom/repeatable-client-snapshot-process.md`
8. `docs/demo-showroom/automation-message-live-audit.md`
9. `docs/hatchkit-master-snapshot/README.md`
10. `docs/hatchkit-master-snapshot/strategic-build-plan.md`
11. `docs/hatchkit-master-snapshot/source-snapshot-asset-map.md`
12. `docs/hatchkit-master-snapshot/execution-loop.md`
13. `docs/hatchkit-master-snapshot/manual-build-queue.md`
14. `docs/hatchkit-master-snapshot/snapshot-asset-inventory.md`

Current strategy:

- Do not manually rebuild every pipeline, workflow, page, trigger link, smart list, and product in the master account if HighLevel snapshot import can carry reusable assets from SunScale.
- Finish reusable storefront/listing/source assets in SunScale first.
- Create `SunScale Demo Source - Hatchkit Base v0`.
- Load that source snapshot into `Hatchkit Master Snapshot - v1`.
- Sanitize the master.
- Export `Hatchkit Client Snapshot - v1` only from the clean master.

Operating rules:

- Build through API/connector/tooling first.
- Use the browser for HighLevel UI work only when API/connector support is missing.
- Keep manual steps only for real account-scope, UI, compliance, payment, SMS, or shipping-label blockers.
- Do not expose or print `.env` secrets or pasted private tokens.
- Do not write private tokens into files.
- Do not seed demo contacts or fake opportunities into the master template.
- Do not create live shipping labels.
- Do not create real payment charges.
- Do not assume live SMS works before A2P campaign approval and a real opted-in SMS test.
- Published HighLevel pages use custom HTML/code forms that post to the Vercel/Hatchkit webhook backend.
- Custom-code form paths need tag-added or webhook-safe triggers, not only native HighLevel `Form Submitted` triggers.
- Do not touch the nested `HatchKit.ai` folder unless explicitly asked.

Useful checks:

```powershell
node scripts\audit-demo-showroom-live.js
node scripts\audit-highlevel-automation-messages.js --wait=90 --fail-on-mismatch
npm run audit:snapshot-assets
npm run setup:master-snapshot
```

Current known state:

- Live showroom audit passes 17/17.
- Full message audit passes with `overallStatus=pass` and `mismatchCount=0`.
- All 12 accelerated SunScale workflows are published.
- A2P Brand is registered with TCR.
- A2P Campaign was submitted for review on 2026-06-05.
- Live SMS still needs campaign approval and a real opted-in test.
- Master account API foundation currently has 17 custom fields, 65 tags, 12 custom values, and 4 reusable products.
- Master pipeline creation is blocked by missing opportunities/pipelines write scope unless fixed or handled by snapshot/manual UI.

Internal loop:

1. Inventory source and master.
2. Build what tooling can safely build.
3. Snapshot/import what HighLevel can clone better than API can recreate.
4. Sanitize names, copy, timing, triggers, and placeholders.
5. Audit live/public paths and message content.
6. Repeat until only true human-in-loop tasks remain.
7. Present the user only the remaining manual walk-through steps with exact names and order.
