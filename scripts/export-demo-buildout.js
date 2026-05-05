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
    },
  };
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
- Review and referral candidates: tag journey:advocacy or review:received
- Repeat buyer VIP: tag journey:repeat-buyer or status:repeat-buyer

6. Manual blocker
The HighLevel token may not be able to create opportunities in this account. If opportunity creation fails, manually add the demo opportunities to the pipelines above using demo-script.md as the guide.

## Webhook Mapping

- Lead magnet forms -> POST /webhooks/ghl/lead-magnet
- Animal page view or CTA click -> POST /webhooks/ghl/offer-clicked
- Order form/payment confirmation -> POST /webhooks/ghl/order-submitted
- Review form -> POST /webhooks/ghl/review-submitted
- Referral form -> POST /webhooks/ghl/referral
- Shipping check action -> POST /webhooks/shipping/evaluate
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
      email: 'demo.lead@example.com',
      species_interest: 'Crested Gecko',
      animalInterest: 'Mango - Harlequin Dalmatian',
      productName: 'Animal Reservation Deposit',
      amount: 75,
      purchaseStatus: 'Deposit Paid',
      destinationZip: '30339',
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

  console.log(`Exported Reptiscale demo buildout to ${OUT_DIR}`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
