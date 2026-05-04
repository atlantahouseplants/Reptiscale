# HighLevel API Scope Fix

The HatchKit demo setup script can create contacts, tags, and custom fields with
the current private integration token, but pipeline and opportunity creation are
blocked by HighLevel authorization.

## Current Blocker

`npm run setup:demo` reports:

```text
Create pipeline "HatchKit - Lead Pipeline": The token is not authorized for this scope.
Create pipeline "HatchKit - Sales Pipeline": The token is not authorized for this scope.
Create pipeline "HatchKit - Shipping Pipeline": The token is not authorized for this scope.
```

Because the pipelines cannot be created, demo opportunities are skipped.

## Required HighLevel Scopes

In the HatchKit private integration, enable:

- Opportunities: Read
- Opportunities: Write
- Contacts: Read
- Contacts: Write
- Locations: Read
- Conversations: Write, if SMS/webhook demos should send messages
- Workflows: Read, if workflow sync/inspection is needed

After saving scopes, confirm the token in `.env` is current:

```env
GHL_PRIVATE_TOKEN=pit_...
GHL_LOCATION_ID=fqj4rbp2VRkvMa8GWVWn
```

Then rerun:

```bash
npm run setup:demo
```

Expected result after the scope fix:

- 10 custom fields synced
- 3 HatchKit pipelines created/synced
- required tags present
- 6 demo contacts present
- demo opportunities created in Lead, Sales, and Shipping pipelines
