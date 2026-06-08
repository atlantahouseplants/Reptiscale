#!/usr/bin/env node
/**
 * Verify the Reptiscale demo packet has the files and wiring expected for a
 * sales/demo build. This is intentionally local and does not call HighLevel,
 * weather, Claude, GitHub, or any carrier API.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EXPORT_DIR = path.join(ROOT, 'exports', 'reptiscale-demo');

const requiredFiles = [
  'NEXT_SESSION_HANDOFF.md',
  'server.js',
  'vercel.json',
  'data/reptiscale-machine.json',
  'data/demo-products.json',
  'data/breeders/sunscale-geckos/client.json',
  'agents/shipping-agent/fulfillment-gate.js',
  'agents/shipping-agent/order-normalizer.js',
  'lib/demo-control-room.js',
  'lib/demo-shipping-fixture.js',
  'templates/pages/reptiscale-demo-console.html',
  'exports/reptiscale-demo/manual-highlevel-buildout.md',
  'exports/reptiscale-demo/workflow-blueprint.json',
  'exports/reptiscale-demo/webhook-payloads.json',
  'exports/reptiscale-demo/deployment-runbook.md',
  'exports/reptiscale-demo/vercel-env-checklist.md',
  'exports/reptiscale-demo/highlevel-workflow-checklist.md',
  'exports/reptiscale-demo/highlevel-ai-workflow-prompts.md',
  'exports/reptiscale-demo/demo-test-plan.md',
  'exports/reptiscale-demo/vercel-deploy.ps1',
  'exports/reptiscale-demo/webhook-smoke-test.ps1',
  'docs/demo-showroom/import-data/contact-activity.csv',
  'scripts/sync-demo-contact-activity.js',
  'templates/pages/sunscale-demo/assets/sunscale-logo.svg',
  'templates/pages/sunscale-demo/assets/hero-pattern.svg',
  'templates/pages/sunscale-demo/assets/nova-placeholder.svg',
  'templates/pages/sunscale-demo/assets/mango-placeholder.svg',
  'templates/pages/sunscale-demo/assets/echo-placeholder.svg',
  'templates/pages/sunscale-demo/assets/pepper-placeholder.svg',
  'templates/pages/sunscale-demo/assets/starter-guide-cover.svg',
  'templates/pages/sunscale-demo/assets/qr-placeholder.svg',
  'templates/pages/sunscale-demo/assets/show-qr-live.svg',
  'docs/demo-showroom/visual-assets/show-qr-live.svg',
  'templates/pages/sunscale-demo/sunscale-demo.js',
];

const requiredWebhookEndpoints = [
  '/webhooks/ghl/lead-magnet',
  '/webhooks/ghl/offer-clicked',
  '/webhooks/ghl/order-submitted',
  '/webhooks/ghl/review-submitted',
  '/webhooks/ghl/referral',
  '/webhooks/shipping/evaluate',
  '/webhooks/shipping/operator-gate',
  '/webhooks/shipping/order-review',
  '/webhooks/shipping/weather-check',
];

const requiredServerEndpoints = [
  ...requiredWebhookEndpoints,
  '/demo',
  '/demo/store',
  '/demo/guide',
  '/demo/animal/mango',
  '/demo/reserve',
  '/demo/review',
  '/demo/vip',
  '/demo/show-qr',
  '/demo/operator',
  '/demo/sunscale',
  '/demo-showroom/assets',
  '/api/demo/readiness',
  '/api/demo/control-room',
  '/api/demo/shipping-review-fixture',
];

const requiredPayloads = [
  'leadMagnet',
  'offerClicked',
  'orderSubmitted',
  'reviewSubmitted',
  'referral',
  'operatorGate',
  'orderShippingReview',
];

const errors = [];
let checks = 0;

function check(condition, message) {
  checks += 1;
  if (!condition) errors.push(message);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function exists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function includes(filePath, text) {
  return fs.readFileSync(path.join(ROOT, filePath), 'utf8').includes(text);
}

for (const file of requiredFiles) {
  check(exists(file), `Missing required file: ${file}`);
}

const packageJson = readJson('package.json');
check(Boolean(packageJson.scripts.start), 'package.json missing start script');
check(Boolean(packageJson.scripts['export:demo']), 'package.json missing export:demo script');
check(Boolean(packageJson.scripts['simulate:shipping-review']), 'package.json missing simulate:shipping-review script');
check(Boolean(packageJson.scripts['setup:showroom']), 'package.json missing setup:showroom script');
check(Boolean(packageJson.scripts['sync:contact-activity']), 'package.json missing sync:contact-activity script');
check(Boolean(packageJson.scripts['verify:demo']), 'package.json missing verify:demo script');

const client = readJson('data/breeders/sunscale-geckos/client.json');
const breederGhlConfig = readJson('data/breeders/sunscale-geckos/ghl-config.json');
const hasPendingLocation = client.ghlLocationId === 'PENDING_SUNSCALE_DEMO_LOCATION_ID';
const hasPlausibleLocation = /^[A-Za-z0-9]{20,}$/.test(String(client.ghlLocationId || ''));
check(hasPendingLocation || hasPlausibleLocation, 'Demo HighLevel location ID is missing or malformed');
check(
  breederGhlConfig.locationId === client.ghlLocationId,
  'SunScale client and HighLevel config location IDs do not match'
);
check(Boolean(client.breederZip), 'Client missing breederZip');
check(Boolean(client.shippingOrigin), 'Client missing shippingOrigin');
check(Array.isArray(client.shippingOrigin?.streetLines) && client.shippingOrigin.streetLines.length > 0, 'shippingOrigin missing streetLines');
check(Boolean(client.shippingOrigin?.city), 'shippingOrigin missing city');
check(Boolean(client.shippingOrigin?.stateOrProvinceCode), 'shippingOrigin missing stateOrProvinceCode');
check(Boolean(client.shippingOrigin?.postalCode), 'shippingOrigin missing postalCode');

const blueprint = readJson('exports/reptiscale-demo/workflow-blueprint.json');
for (const endpoint of requiredWebhookEndpoints) {
  check(
    JSON.stringify(blueprint.webhooks || {}).includes(endpoint),
    `Workflow blueprint missing endpoint: ${endpoint}`
  );
}

const payloads = readJson('exports/reptiscale-demo/webhook-payloads.json');
for (const key of requiredPayloads) {
  check(Boolean(payloads[key]), `Webhook payloads missing sample: ${key}`);
}

check(Boolean(payloads.orderSubmitted?.shippingAddress), 'orderSubmitted payload missing shippingAddress');
check(Boolean(payloads.orderShippingReview?.shippingAddress), 'orderShippingReview payload missing shippingAddress');
check(Boolean(payloads.operatorGate?.shipper?.address), 'operatorGate payload missing shipper address');

for (const endpoint of requiredServerEndpoints) {
  check(includes('server.js', endpoint), `server.js missing endpoint string: ${endpoint}`);
}

check(includes('exports/reptiscale-demo/deployment-runbook.md', 'review-only'), 'Deployment runbook missing review-only safety note');
check(includes('exports/reptiscale-demo/deployment-runbook.md', '--project reptiscale-demo'), 'Deployment runbook missing explicit Vercel project command');
check(includes('exports/reptiscale-demo/vercel-env-checklist.md', 'GHL_PRIVATE_TOKEN'), 'Vercel env checklist missing GHL_PRIVATE_TOKEN');
check(includes('exports/reptiscale-demo/vercel-deploy.ps1', 'vercel link --yes --project'), 'Vercel deploy helper missing explicit project link');
check(includes('exports/reptiscale-demo/vercel-deploy.ps1', 'vercel deploy --prod'), 'Vercel deploy helper missing production deploy command');
check(includes('server.js', 'process.env.VERCEL'), 'server.js logging is not Vercel-aware');
check(includes('server.js', 'hatchkit-webhooks.log'), 'server.js missing Vercel temp log filename');
check(includes('server.js', 'log file unavailable'), 'server.js file logging can still crash API routes');
check(includes('templates/pages/reptiscale-demo-console.html', 'Demo Business Snapshot'), 'Demo console missing control room snapshot');
check(includes('templates/pages/reptiscale-demo-console.html', '/api/demo/control-room'), 'Demo console missing control room API link');
check(includes('exports/reptiscale-demo/highlevel-workflow-checklist.md', 'Manual Blocker'), 'Workflow checklist missing manual blocker section');
check(includes('exports/reptiscale-demo/highlevel-ai-workflow-prompts.md', 'Reptiscale - Daily Shipping Weather Re-Check'), 'Workflow prompt pack missing weather re-check prompt');
check(includes('exports/reptiscale-demo/highlevel-ai-workflow-prompts.md', 'shipping:ready-for-operator-approval'), 'Workflow prompt pack missing operator approval prompt');
check(includes('exports/reptiscale-demo/demo-test-plan.md', 'Pass Criteria'), 'Demo test plan missing pass criteria');
check(includes('exports/reptiscale-demo/webhook-smoke-test.ps1', 'Invoke-DemoWebhook'), 'Webhook smoke test missing Invoke-DemoWebhook helper');
check(includes('templates/pages/reptiscale-demo-console.html', 'Reptiscale Demo Console'), 'Demo console missing title');
check(includes('docs/demo-showroom/import-data/contact-activity.csv', 'HatchKit demo journey'), 'Contact activity import missing demo journey notes');
check(includes('scripts/setup-demo-showroom.js', 'sync:contact-activity'), 'Showroom setup missing contact activity sync step');
check(includes('templates/pages/sunscale-demo/storefront.html', '/demo-showroom/assets/'), 'SunScale storefront has broken visual asset paths');
check(includes('templates/pages/sunscale-demo/sunscale-demo.css', '/demo-showroom/assets/hero-pattern.svg'), 'SunScale CSS has broken hero asset path');
check(includes('templates/pages/sunscale-demo/show-qr.html', 'show-qr-live.svg'), 'Show QR page does not use the live QR asset');
check(includes('templates/pages/sunscale-demo/assets/show-qr-live.svg', '<svg'), 'Live QR asset is not an SVG');
check(includes('templates/pages/sunscale-demo/sunscale-demo.js', 'data-endpoint'), 'SunScale form handler missing form endpoint support');
check(includes('templates/pages/sunscale-demo/reservation.html', '/webhooks/ghl/order-submitted'), 'Reservation page is not wired to order-submitted webhook');
check(includes('templates/pages/sunscale-demo/vip.html', '/webhooks/ghl/lead-magnet'), 'VIP page is not wired to lead-magnet webhook');

if (!fs.existsSync(EXPORT_DIR)) {
  errors.push(`Missing export directory: ${EXPORT_DIR}`);
}

if (errors.length > 0) {
  console.error('Demo readiness checks failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Demo readiness checks passed (${checks} checks).`);
