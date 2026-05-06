# Vercel Environment Checklist

Project name: `reptiscale-demo`

Set these in Vercel before wiring live HighLevel workflows.

## Required For HighLevel Webhooks

- `GHL_PRIVATE_TOKEN`
- `GHL_LOCATION_ID`
- `GHL_API_BASE`
- `GHL_API_VERSION`

## Required For Live Shipping Weather

- `OPENWEATHERMAP_API_KEY`

## Optional For AI Decisions

- `ANTHROPIC_API_KEY`
- `CLAUDE_MODEL`

If `ANTHROPIC_API_KEY` is missing, the shipping agent falls back to rule-based decisions.

## Commands

Use Vercel's interactive env command so secrets are not printed in shell history:

```powershell
vercel env add GHL_PRIVATE_TOKEN production --project reptiscale-demo
vercel env add GHL_LOCATION_ID production --project reptiscale-demo
vercel env add GHL_API_BASE production --project reptiscale-demo
vercel env add GHL_API_VERSION production --project reptiscale-demo
vercel env add OPENWEATHERMAP_API_KEY production --project reptiscale-demo
vercel env add ANTHROPIC_API_KEY production --project reptiscale-demo
vercel env add CLAUDE_MODEL production --project reptiscale-demo
```

After adding or changing environment variables, redeploy:

```powershell
vercel deploy --prod --project reptiscale-demo
```

## Safe Partial Deploy

`/demo`, `/health`, `/api/machine`, and `/api/demo/readiness` can load before secrets are configured.

Do not connect live HighLevel workflows until the required HighLevel and weather variables are set.
