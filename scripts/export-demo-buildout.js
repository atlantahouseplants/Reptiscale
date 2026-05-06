#!/usr/bin/env node
/**
 * Export the Reptiscale demo buildout packet.
 *
 * The packet is designed for manual HighLevel setup where the API cannot create
 * every object. It contains products, inventory, workflow blueprints, webhook
 * payloads, social content, and a short sales demo script.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'exports', 'reptiscale-demo');

const machine = require('../data/reptiscale-machine.json');
const products = require('../data/demo-products.json');
const client = require('../data/breeders/sunscale-geckos/client.json');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(fileName, contents) {
  const filePath = path.join(OUT_DIR, fileName);
  fs.writeFileSync(filePath, contents.endsWith('\n') ? contents : `${contents}\n`);
  return filePath;
}

function csvEscape(value) {
  const text = value === undefined || value === null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(rows, columns) {
  return [
    columns.join(','),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(',')),
  ].join('\n');
}

function money(value) {
  return Number(value || 0).toFixed(2);
}

function demoShippingOrigin() {
  return client.shippingOrigin || {
    streetLines: ['123 Breeder Lane'],
    city: 'Raleigh',
    stateOrProvinceCode: 'NC',
    postalCode: client.breederZip,
    countryCode: 'US',
  };
}

function workflowBlueprint() {
  return {
    name: machine.name,
    locationId: client.ghlLocationId,
    lifecycleStages: machine.lifecycleStages.map((stage) => ({
      key: stage.key,
      label: stage.label,
      goal: stage.goal,
      createInHighLevel: stage.highLevelObjects,
      tags: stage.automationTags,
    })),
    workflows: machine.campaigns.map((campaign) => ({
      key: campaign.key,
      name: campaign.name,
      trigger: campaign.trigger,
      steps: campaign.steps,
      recommendedAssets: {
        emailTemplates: `templates/emails/lifecycle/${campaign.key}`,
        smsTemplates: `templates/sms/lifecycle/${campaign.key}`,
      },
    })),
    webhooks: {
      leadMagnet: '/webhooks/ghl/lead-magnet',
      offerClicked: '/webhooks/ghl/offer-clicked',
      orderSubmitted: '/webhooks/ghl/order-submitted',
      reviewSubmitted: '/webhooks/ghl/review-submitted',
      referral: '/webhooks/ghl/referral',
      shippingEvaluate: '/webhooks/shipping/evaluate',
      shippingOperatorGate: '/webhooks/shipping/operator-gate',
      orderShippingReview: '/webhooks/shipping/order-review',
      weatherCheck: '/webhooks/shipping/weather-check',
    },
  };
}

function endpointMap() {
  return [
    ['Lead magnet form', '/webhooks/ghl/lead-magnet', 'Creates or updates the contact, tags buyer interest, and starts lead nurture.'],
    ['Offer click', '/webhooks/ghl/offer-clicked', 'Marks animal/offer interest and starts reservation follow-up.'],
    ['Order submitted', '/webhooks/ghl/order-submitted', 'Marks purchase, sends confirmation, checks shipping, and builds operator review when possible.'],
    ['Review submitted', '/webhooks/ghl/review-submitted', 'Moves the buyer into advocacy, referral, and proof collection.'],
    ['Referral submitted', '/webhooks/ghl/referral', 'Captures referred leads and starts the buyer journey.'],
    ['Shipping evaluate', '/webhooks/shipping/evaluate', 'Runs weather/species decision for a route.'],
    ['Operator gate', '/webhooks/shipping/operator-gate', 'Checks weather decision plus label payload readiness. Review-only.'],
    ['Order shipping review', '/webhooks/shipping/order-review', 'Normalizes an order into the operator gate. Review-only.'],
    ['Weather re-check', '/webhooks/shipping/weather-check', 'Re-checks pending shipments on a schedule.'],
  ];
}

function manualBuildoutMarkdown() {
  return `# Reptiscale Demo HighLevel Buildout

Client: ${client.businessName}
Location ID: ${client.ghlLocationId}

## Demo Positioning

${machine.positioning.oneLine}

Primary buyer: ${machine.positioning.primaryBuyer}

Core promise: ${machine.positioning.corePromise}

## Build In HighLevel

1. Website and funnel pages
- Storefront: templates/pages/reptiscale-storefront.html
- Lead magnet: templates/pages/crested-gecko-starter-guide.html
- Animal detail: templates/pages/animal-detail.html
- Reservation offer: templates/pages/reservation-offer.html

2. Products and payments
- Animal Reservation Deposit: $75
- Crested Gecko Care Starter Kit: $49
- 30-Minute Setup Review: $35
- Crested Gecko Starter Guide: free

3. Pipelines to create or verify
- HatchKit - Lead Pipeline: New Lead, Contacted, Interested, Qualified, Customer, Lost
- HatchKit - Sales Pipeline: Animal Selected, Invoice Sent, Payment Received, Shipping Scheduled, Shipped, Delivered, Follow-Up Complete
- HatchKit - Shipping Pipeline: Pending Review, Weather Check, Approved to Ship, Label Created, Dropped Off, In Transit, Delivered, LAG Confirmed, Complete

4. Workflows
${machine.campaigns.map((campaign) => `- ${campaign.name}: ${campaign.trigger}`).join('\n')}

5. Smart lists
- New crested gecko leads: tag interest:crested-gecko and status:new-lead
- Hot animal buyers: tag journey:offer-presented or status:hot-lead
- Shipping holds: tag shipping:hold or shipping:pending-weather-check
- Operator review queue: tag shipping:operator-review and not shipping:ready-for-operator-approval
- Ready for label approval: tag shipping:ready-for-operator-approval
- Review and referral candidates: tag journey:advocacy or review:received
- Repeat buyer VIP: tag journey:repeat-buyer or status:repeat-buyer

6. Manual blocker
The HighLevel token may not be able to create opportunities in this account. If opportunity creation fails, manually add the demo opportunities to the pipelines above using demo-script.md as the guide.

7. Useful companion files
- deployment-runbook.md
- vercel-env-checklist.md
- highlevel-workflow-checklist.md
- demo-test-plan.md
- vercel-deploy.ps1
- webhook-smoke-test.ps1

8. Local demo console
- Open {BASE_URL}/demo after the server is running.

## Webhook Mapping

- Lead magnet forms -> POST /webhooks/ghl/lead-magnet
- Animal page view or CTA click -> POST /webhooks/ghl/offer-clicked
- Order form/payment confirmation -> POST /webhooks/ghl/order-submitted
- Review form -> POST /webhooks/ghl/review-submitted
- Referral form -> POST /webhooks/ghl/referral
- Shipping check action -> POST /webhooks/shipping/evaluate
- Pre-label operator review -> POST /webhooks/shipping/operator-gate
- Order-to-shipping review -> POST /webhooks/shipping/order-review
`;
}

function deploymentRunbookMarkdown() {
  return `# Reptiscale Demo Deployment Runbook

Client: ${client.businessName}
Location ID: ${client.ghlLocationId}

## Goal

Get a reachable webhook base URL so HighLevel can send demo buyer events into Reptiscale.

## Option A: Local Demo Tunnel

Use this when testing quickly before a sales call.

1. Start the webhook server.

\`\`\`powershell
cd C:\\Users\\wallg\\OneDrive\\Desktop\\HatchKit
npm start
\`\`\`

2. Open a tunnel to port 3000.

\`\`\`powershell
ngrok http 3000
\`\`\`

3. Copy the HTTPS forwarding URL.

Example:

\`\`\`
https://abc123.ngrok-free.app
\`\`\`

4. Use that as \`BASE_URL\` in HighLevel workflow webhook actions.

## Option B: Hosted Demo

Use this for repeatable demos where the URL should stay stable.

The first Vercel link/create step should use an explicit lowercase project name. This avoids the project-name validation error that can happen when Vercel infers a name from the local shell/session.

\`\`\`powershell
vercel link --yes --project reptiscale-demo
vercel deploy
\`\`\`

For a production URL:

\`\`\`powershell
vercel deploy --prod
\`\`\`

Required environment variables:

- \`GHL_PRIVATE_TOKEN\`
- \`GHL_LOCATION_ID\`
- \`GHL_API_BASE\`
- \`GHL_API_VERSION\`
- \`OPENWEATHERMAP_API_KEY\`
- \`ANTHROPIC_API_KEY\` if Claude decisions should run instead of rule fallback
- \`CLAUDE_MODEL\`

The repo already includes \`vercel.json\` for a Node server deployment.

Use \`vercel-env-checklist.md\` before wiring live HighLevel workflows.

## Preflight

Run before wiring HighLevel:

\`\`\`powershell
npm test
npm run export:demo
npm run verify:demo
\`\`\`

## First Live Checks

Replace \`BASE_URL\` with the tunnel or hosted URL:

\`\`\`powershell
Invoke-RestMethod -Method Get -Uri "BASE_URL/health"
Invoke-RestMethod -Method Get -Uri "BASE_URL/api/machine"
\`\`\`

Open:

\`\`\`text
BASE_URL/demo
\`\`\`

Then run:

\`\`\`powershell
.\\exports\\reptiscale-demo\\webhook-smoke-test.ps1 -BaseUrl "BASE_URL"
\`\`\`

The smoke test posts demo buyer events. If the server is connected to HighLevel, it will create or update demo contacts and may send configured messages.

## Safety Note

The shipping review endpoints are review-only. They should never buy a carrier label automatically. The operator must approve the final label after checking animal, weather, package, service, and address details.
`;
}

function vercelDeployPowerShell() {
  return `param(
  [string]$ProjectName = "reptiscale-demo",
  [switch]$Production
)

$ErrorActionPreference = "Stop"

Write-Host "Linking Vercel project: $ProjectName"
vercel link --yes --project $ProjectName

if ($Production) {
  Write-Host "Deploying production build for: $ProjectName"
  vercel deploy --prod
} else {
  Write-Host "Deploying preview build for: $ProjectName"
  vercel deploy
}
`;
}

function vercelEnvChecklistMarkdown() {
  return `# Vercel Environment Checklist

Project name: \`reptiscale-demo\`

Set these in Vercel before wiring live HighLevel workflows.

## Required For HighLevel Webhooks

- \`GHL_PRIVATE_TOKEN\`
- \`GHL_LOCATION_ID\`
- \`GHL_API_BASE\`
- \`GHL_API_VERSION\`

## Required For Live Shipping Weather

- \`OPENWEATHERMAP_API_KEY\`

## Optional For AI Decisions

- \`ANTHROPIC_API_KEY\`
- \`CLAUDE_MODEL\`

If \`ANTHROPIC_API_KEY\` is missing, the shipping agent falls back to rule-based decisions.

## Commands

Use Vercel's interactive env command so secrets are not printed in shell history:

\`\`\`powershell
vercel env add GHL_PRIVATE_TOKEN production
vercel env add GHL_LOCATION_ID production
vercel env add GHL_API_BASE production
vercel env add GHL_API_VERSION production
vercel env add OPENWEATHERMAP_API_KEY production
vercel env add ANTHROPIC_API_KEY production
vercel env add CLAUDE_MODEL production
\`\`\`

After adding or changing environment variables, redeploy:

\`\`\`powershell
vercel deploy --prod
\`\`\`

## Safe Partial Deploy

\`/demo\`, \`/health\`, \`/api/machine\`, and \`/api/demo/readiness\` can load before secrets are configured.

Do not connect live HighLevel workflows until the required HighLevel and weather variables are set.
`;
}

function highLevelWorkflowChecklistMarkdown() {
  const rows = endpointMap()
    .map(([name, path, purpose]) => `| ${name} | \`${path}\` | ${purpose} |`)
    .join('\n');

  return `# HighLevel Workflow Checklist

Client: ${client.businessName}
Location ID: ${client.ghlLocationId}

Use this after the webhook server has a public \`BASE_URL\`.

## Endpoint Map

| Event | Endpoint | Purpose |
|---|---|---|
${rows}

## Workflows To Build

### 1. Lead Magnet Delivery

Trigger: Starter guide form submitted.

Webhook action:

\`POST {BASE_URL}/webhooks/ghl/lead-magnet\`

Required payload fields:

- \`locationId\`
- \`firstName\`
- \`email\`
- \`phone\`
- \`species_interest\`
- \`source\`
- \`offerKey\`

### 2. Offer Clicked / Animal Interest

Trigger: Animal detail CTA, reservation page visit, or manual workflow action.

Webhook action:

\`POST {BASE_URL}/webhooks/ghl/offer-clicked\`

Required payload fields:

- \`locationId\`
- \`email\` or \`contactId\`
- \`species_interest\`
- \`animalInterest\`
- \`offerKey\`

### 3. Order Submitted

Trigger: Payment received, order form submitted, or deposit paid.

Webhook action:

\`POST {BASE_URL}/webhooks/ghl/order-submitted\`

Recommended payload fields:

- \`locationId\`
- \`contactId\`, \`email\`, or \`phone\`
- \`species_interest\`
- \`animalInterest\`
- \`productName\`
- \`amount\`
- \`purchaseStatus\`
- \`shippingAddress\`
- \`preferredShipDate\`

### 4. Order Shipping Review

Trigger: Same order/payment event, or a separate internal fulfillment workflow.

Webhook action:

\`POST {BASE_URL}/webhooks/shipping/order-review\`

Use this to show the operator review package directly.

### 5. Shipping Weather Re-Check

Trigger: Daily scheduled workflow, early morning in the breeder's timezone.

Webhook action:

\`POST {BASE_URL}/webhooks/shipping/weather-check\`

### 6. Review Submitted

Trigger: Review form submitted or manual review received.

Webhook action:

\`POST {BASE_URL}/webhooks/ghl/review-submitted\`

### 7. Referral Submitted

Trigger: Referral form submitted.

Webhook action:

\`POST {BASE_URL}/webhooks/ghl/referral\`

## Smart Lists

- New crested gecko leads: \`interest:crested-gecko\` and \`status:new-lead\`
- Hot animal buyers: \`journey:offer-presented\` or \`status:hot-lead\`
- Shipping holds: \`shipping:hold\` or \`shipping:pending-weather-check\`
- Operator review queue: \`shipping:operator-review\` and not \`shipping:ready-for-operator-approval\`
- Ready for label approval: \`shipping:ready-for-operator-approval\`
- Review/referral candidates: \`journey:advocacy\` or \`review:received\`
- Repeat buyer VIP: \`journey:repeat-buyer\` or \`status:repeat-buyer\`

## Manual Blocker

The current token cannot create opportunities or pipelines. Build those manually in HighLevel, then use these webhook workflows to automate the customer journey around them.
`;
}

function demoTestPlanMarkdown() {
  return `# Reptiscale Demo Test Plan

Run this before showing the demo to a prospect.

## Local Checks

\`\`\`powershell
npm test
npm run simulate:shipping-review
npm run export:demo
npm run verify:demo
\`\`\`

## Server Checks

1. Start or deploy the server.
2. Confirm \`GET /health\` returns \`status: ok\`.
3. Confirm \`GET /api/machine\` returns the Reptiscale machine.
4. Open \`/demo\`.
5. Run \`webhook-smoke-test.ps1\` against the base URL.

The smoke test posts demo buyer events. Use demo contact details only.

## HighLevel Checks

- Demo contact exists or can be created.
- Custom fields are visible on the contact record.
- Operator-review tags exist.
- Manual pipelines exist.
- Workflow webhook actions point to the correct \`BASE_URL\`.
- Order/payment workflow includes shipping address fields.

## Sales Demo Path

1. Open storefront.
2. Submit starter guide form.
3. Show CRM contact fields and tags.
4. Open animal detail page.
5. Show reservation offer.
6. Trigger order submitted.
7. Show order-to-shipping operator review.
8. Show care onboarding templates.
9. Show review/referral and VIP repeat-buyer flow.

## Pass Criteria

- Lead is captured.
- Interest and animal preference are stored.
- Purchase stage is updated.
- Shipping decision is produced.
- Operator review returns a clear disposition.
- Care/review/referral follow-up is explainable in HighLevel.
`;
}

function webhookSmokeTestPowerShell() {
  const payloads = JSON.stringify(webhookPayloads(), null, 2);
  const calls = [
    ['Lead Magnet', '/webhooks/ghl/lead-magnet', 'leadMagnet'],
    ['Offer Clicked', '/webhooks/ghl/offer-clicked', 'offerClicked'],
    ['Order Submitted', '/webhooks/ghl/order-submitted', 'orderSubmitted'],
    ['Order Shipping Review', '/webhooks/shipping/order-review', 'orderShippingReview'],
    ['Review Submitted', '/webhooks/ghl/review-submitted', 'reviewSubmitted'],
    ['Referral', '/webhooks/ghl/referral', 'referral'],
  ];

  return `param(
  [string]$BaseUrl = "http://localhost:3000"
)

$Payloads = @'
${payloads}
'@ | ConvertFrom-Json

function Invoke-DemoWebhook {
  param(
    [string]$Name,
    [string]$Path,
    [object]$Payload
  )

  $Uri = "$BaseUrl$Path"
  Write-Host ""
  Write-Host "== $Name =="
  Write-Host $Uri

  try {
    $Body = $Payload | ConvertTo-Json -Depth 30
    $Result = Invoke-RestMethod -Method Post -Uri $Uri -ContentType "application/json" -Body $Body
    $Result | ConvertTo-Json -Depth 12
  } catch {
    Write-Host "Request failed: $($_.Exception.Message)"
    if ($_.ErrorDetails.Message) {
      Write-Host $_.ErrorDetails.Message
    }
  }
}

Write-Host "Checking $BaseUrl/health"
Invoke-RestMethod -Method Get -Uri "$BaseUrl/health" | ConvertTo-Json -Depth 5

${calls.map(([name, path, key]) => `Invoke-DemoWebhook -Name "${name}" -Path "${path}" -Payload $Payloads.${key}`).join('\n')}
`;
}

function demoScriptMarkdown() {
  return `# Reptiscale Demo Script

## 1. Start With The Store
Show the storefront as the breeder's online home: available animals, guide capture, questions, and reservation links.

## 2. Capture A New Buyer
Submit the starter guide form. Explain that HighLevel creates or updates the contact, tags the source and interest, sets the customer journey stage, and starts nurture.

## 3. Show The CRM Record
Open the demo contact and show custom fields: Species Interest, Animal Interest, Offer Name, Purchase Status, Customer Journey Stage, and Next Best Action.

## 4. Move From Interest To Offer
Open an animal detail page and reservation page. Explain that the click can tag the buyer as Offer Presented and trigger reservation follow-up.

## 5. Process Purchase And Shipping
Use the order-submitted webhook or HighLevel payment event. Reptiscale marks the buyer as purchased, sends confirmation, and evaluates weather before shipping.
Then show the order-to-shipping review package: the system normalizes the buyer address, breeder origin, species, package profile, and weather decision into a review-only label payload for the human operator.

## 6. Care Onboarding
Show the post-purchase emails and SMS templates: setup checklist, delivery check-in, day 3 settling-in, and day 7 care.

## 7. Reviews, Referrals, Repeat Buyers
Show the advocacy workflow: review request, photo permission, referral link, and VIP availability list.

## Closing Line
"This is not just a website. It is the full breeder customer journey, built in HighLevel and made reusable for reptile sellers."
`;
}

function socialCalendarCsv() {
  const rows = [
    ['2026-05-04', 'Instagram', 'Animal spotlight', 'Nova the Lilly White crested gecko', 'Reserve Nova or join the VIP list'],
    ['2026-05-05', 'Facebook', 'Care tip', 'Humidity mistakes new crested gecko owners make', 'Download the starter guide'],
    ['2026-05-06', 'Instagram', 'Behind the scenes', 'Feeding night and growth checks', 'Ask about current availability'],
    ['2026-05-07', 'TikTok', 'Education', 'Beginner versus collector crested geckos', 'Comment budget for recommendations'],
    ['2026-05-08', 'Instagram', 'Offer', 'Reservation deposits explained', 'Reserve a gecko'],
    ['2026-05-09', 'Facebook', 'Proof', 'Safe arrival and setup checklist story', 'Join the starter guide list'],
    ['2026-05-10', 'Instagram', 'Waitlist', 'Next clutch preview and VIP first look', 'Join VIP availability alerts'],
    ['2026-05-11', 'Instagram', 'Animal spotlight', 'Mango the Harlequin Dalmatian', 'View details'],
    ['2026-05-12', 'Facebook', 'Care tip', 'What to do during the first 72 hours', 'Download the starter guide'],
    ['2026-05-13', 'Instagram', 'Shipping', 'Why weather holds protect the animal', 'Ask about shipping'],
    ['2026-05-14', 'TikTok', 'Education', 'Crested gecko food routine for beginners', 'Save this checklist'],
    ['2026-05-15', 'Instagram', 'Offer', 'Care Starter Kit order bump', 'Add the kit before pickup'],
    ['2026-05-16', 'Facebook', 'Referral', 'Refer a friend researching crested geckos', 'Share the guide'],
    ['2026-05-17', 'Instagram', 'Behind the scenes', 'Cleaning and enrichment day', 'Join the VIP list'],
  ].map(([date, platform, pillar, topic, cta]) => ({ date, platform, pillar, topic, cta }));
  return toCsv(rows, ['date', 'platform', 'pillar', 'topic', 'cta']);
}

function webhookPayloads() {
  return {
    leadMagnet: {
      locationId: client.ghlLocationId,
      firstName: 'Demo',
      email: 'demo.lead@example.com',
      phone: '+14045550199',
      species_interest: 'Crested Gecko',
      source: 'website',
      offerKey: 'crested_gecko_starter_guide',
    },
    offerClicked: {
      locationId: client.ghlLocationId,
      email: 'demo.lead@example.com',
      species_interest: 'Crested Gecko',
      animalInterest: 'Mango - Harlequin Dalmatian',
      offerKey: 'animal_reservation',
    },
    orderSubmitted: {
      locationId: client.ghlLocationId,
      firstName: 'Demo',
      lastName: 'Buyer',
      email: 'demo.lead@example.com',
      phone: '+14045550199',
      species_interest: 'Crested Gecko',
      animalInterest: 'Mango - Harlequin Dalmatian',
      productName: 'Animal Reservation Deposit',
      amount: 75,
      purchaseStatus: 'Deposit Paid',
      destinationZip: '30339',
      shippingAddress: {
        address1: '100 Buyer Street',
        city: 'Atlanta',
        state: 'GA',
        postalCode: '30339',
        countryCode: 'US',
        residential: true,
      },
      preferredShipDate: '2026-05-11',
    },
    reviewSubmitted: {
      locationId: client.ghlLocationId,
      email: 'demo.lead@example.com',
      species_interest: 'Crested Gecko',
      rating: 5,
    },
    referral: {
      locationId: client.ghlLocationId,
      firstName: 'Referral',
      email: 'referral.lead@example.com',
      phone: '+14045550198',
      species_interest: 'Crested Gecko',
      referralSource: 'Demo Lead',
    },
    operatorGate: {
      contactId: 'optional-ghl-contact-id',
      species: 'crested_gecko',
      originZip: client.breederZip,
      destinationZip: '30339',
      preferredShipDate: '2026-05-11',
      profileKey: 'crestedGecko',
      shipper: {
        contact: {
          personName: client.ownerName,
          phoneNumber: client.ownerPhone,
          companyName: client.businessName,
          email: client.ownerEmail,
        },
        address: {
          ...demoShippingOrigin(),
        },
      },
      recipient: {
        contact: {
          personName: 'Demo Buyer',
          phoneNumber: '+14045550199',
          email: 'demo.lead@example.com',
        },
        address: {
          streetLines: ['100 Buyer Street'],
          city: 'Atlanta',
          stateOrProvinceCode: 'GA',
          postalCode: '30339',
          countryCode: 'US',
          residential: true,
        },
      },
    },
    orderShippingReview: {
      locationId: client.ghlLocationId,
      contactId: 'optional-ghl-contact-id',
      customer: {
        firstName: 'Demo',
        lastName: 'Buyer',
        email: 'demo.lead@example.com',
        phone: '+14045550199',
      },
      order: {
        id: 'DEMO-ORDER-1001',
        productName: 'Animal Reservation Deposit',
        amount: 75,
        purchaseStatus: 'Deposit Paid',
        species_interest: 'Crested Gecko',
        animalInterest: 'Mango - Harlequin Dalmatian',
      },
      shippingAddress: {
        address1: '100 Buyer Street',
        city: 'Atlanta',
        state: 'GA',
        postalCode: '30339',
        countryCode: 'US',
        residential: true,
      },
      preferredShipDate: '2026-05-11',
    },
  };
}

function main() {
  ensureDir(OUT_DIR);

  write('manual-highlevel-buildout.md', manualBuildoutMarkdown());
  write('workflow-blueprint.json', JSON.stringify(workflowBlueprint(), null, 2));
  write('products.csv', toCsv(products.products.map((product) => ({
    sku: product.sku,
    name: product.name,
    type: product.type,
    price: money(product.price),
    description: product.description,
    highLevelUse: product.highLevelUse,
  })), ['sku', 'name', 'type', 'price', 'description', 'highLevelUse']));
  write('animals.csv', toCsv(products.animals.map((animal) => ({
    sku: animal.sku,
    name: animal.name,
    species: animal.species,
    morph: animal.morph,
    sex: animal.sex,
    price: money(animal.price),
    status: animal.status,
    weightGrams: animal.weightGrams,
    shippingProfile: animal.shippingProfile,
    recommendedBuyer: animal.recommendedBuyer,
    description: animal.description,
  })), ['sku', 'name', 'species', 'morph', 'sex', 'price', 'status', 'weightGrams', 'shippingProfile', 'recommendedBuyer', 'description']));
  write('social-calendar.csv', socialCalendarCsv());
  write('demo-script.md', demoScriptMarkdown());
  write('webhook-payloads.json', JSON.stringify(webhookPayloads(), null, 2));
  write('deployment-runbook.md', deploymentRunbookMarkdown());
  write('vercel-env-checklist.md', vercelEnvChecklistMarkdown());
  write('highlevel-workflow-checklist.md', highLevelWorkflowChecklistMarkdown());
  write('demo-test-plan.md', demoTestPlanMarkdown());
  write('vercel-deploy.ps1', vercelDeployPowerShell());
  write('webhook-smoke-test.ps1', webhookSmokeTestPowerShell());

  console.log(`Exported Reptiscale demo buildout to ${OUT_DIR}`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
