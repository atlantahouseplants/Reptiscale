# Reptiscale Demo Deployment Runbook

Client: SunScale Geckos
Location ID: fqj4rbp2VRkvMa8GWVWn

## Goal

Get a reachable webhook base URL so HighLevel can send demo buyer events into Reptiscale.

## Option A: Local Demo Tunnel

Use this when testing quickly before a sales call.

1. Start the webhook server.

```powershell
cd C:\Users\wallg\OneDrive\Desktop\HatchKit
npm start
```

2. Open a tunnel to port 3000.

```powershell
ngrok http 3000
```

3. Copy the HTTPS forwarding URL.

Example:

```
https://abc123.ngrok-free.app
```

4. Use that as `BASE_URL` in HighLevel workflow webhook actions.

## Option B: Hosted Demo

Use this for repeatable demos where the URL should stay stable.

Required environment variables:

- `GHL_PRIVATE_TOKEN`
- `GHL_LOCATION_ID`
- `GHL_API_BASE`
- `GHL_API_VERSION`
- `OPENWEATHERMAP_API_KEY`
- `ANTHROPIC_API_KEY` if Claude decisions should run instead of rule fallback
- `CLAUDE_MODEL`

The repo already includes `vercel.json` for a Node server deployment.

## Preflight

Run before wiring HighLevel:

```powershell
npm test
npm run export:demo
npm run verify:demo
```

## First Live Checks

Replace `BASE_URL` with the tunnel or hosted URL:

```powershell
Invoke-RestMethod -Method Get -Uri "BASE_URL/health"
Invoke-RestMethod -Method Get -Uri "BASE_URL/api/machine"
```

Then run:

```powershell
.\exports\reptiscale-demo\webhook-smoke-test.ps1 -BaseUrl "BASE_URL"
```

The smoke test posts demo buyer events. If the server is connected to HighLevel, it will create or update demo contacts and may send configured messages.

## Safety Note

The shipping review endpoints are review-only. They should never buy a carrier label automatically. The operator must approve the final label after checking animal, weather, package, service, and address details.
