# HatchKit — Make.com Scenario Blueprints

These JSON files are Make.com scenario blueprints that can be imported into any Make.com account.

## How to Import

1. Log into Make.com
2. Go to Scenarios → Create a new scenario
3. Click the `...` menu → Import Blueprint
4. Paste the JSON content from the relevant blueprint file
5. Replace placeholder variables:
   - `{{WEBHOOK_BASE_URL}}` → Your deployed Vercel URL (e.g., `https://hatchkit-server.vercel.app`)
   - `{{GHL_API_KEY}}` → The breeder's GHL Private Integration token
   - `{{LOCATION_ID}}` → The breeder's GHL Location ID
   - `{{CLIENT_ID}}` → The breeder's clientId (e.g., `sunscale-geckos`)
6. Set up connections (HTTP module needs no auth, just the URL)
7. Activate the scenario

## Available Scenarios

### daily-weather-check.json
- **Trigger:** Schedule — Every day at 6:00 AM
- **Action:** HTTP POST to `{WEBHOOK_BASE_URL}/webhooks/shipping/weather-check`
- **Purpose:** Re-checks weather for all pending shipments. If weather clears, the server sends SMS notifications to buyers.
- **Tier:** Growth and Pro

### daily-content-run.json
- **Trigger:** Schedule — Every day at 9:00 AM
- **Action:** HTTP POST to `{WEBHOOK_BASE_URL}/api/content/daily-run`
- **Purpose:** Generates social media posts for all active breeders. Posts go into approval queue.
- **Tier:** Growth (3/week) and Pro (daily)

## Customizing Schedules

Each scenario's schedule can be adjusted:
- **Weather checks:** Most breeders want this at 6 AM their local time
- **Content generation:** 9 AM works well — gives breeders time to review before posting

## Error Handling

Both scenarios include error handling:
- On failure: Log the error to a Make.com data store
- Retry: 1 automatic retry after 5 minutes
- Alert: Send email notification to HatchKit admin on persistent failure

## Using configure-scenarios.js

To auto-generate breeder-specific blueprint files:

```bash
node make-scenarios/configure-scenarios.js --breeder sunscale-geckos --url https://your-app.vercel.app
```

This reads the breeder config and outputs ready-to-import JSON with all variables substituted.
