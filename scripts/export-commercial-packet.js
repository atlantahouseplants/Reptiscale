#!/usr/bin/env node
/**
 * Export customer-facing Reptiscale sales and delivery packet.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'exports', 'reptiscale-commercial-packet');
const commercial = require('../data/reptiscale-commercial-model.json');

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
  return `$${Number(value).toLocaleString('en-US')}`;
}

function salesOnePager() {
  const growth = commercial.packages.find((pkg) => pkg.recommended) || commercial.packages[1];
  return `# Reptiscale Sales One-Pager

## ${commercial.positioning.headline}

${commercial.positioning.subheadline}

## Best Fit Customer

${commercial.positioning.primaryCustomer}

## Why It Works

Reptile sellers do not just need a website. They need a complete buyer journey:

1. Capture leads from shows, social, MorphMarket, referrals, and the website.
2. Follow up with care education and available animals.
3. Move serious buyers into a reservation or deposit offer.
4. Communicate purchase, pickup, shipping, and care clearly.
5. Ask for reviews, referrals, and repeat purchases.

## Recommended Package

${growth.name}: ${money(growth.setupFee)} setup + ${money(growth.monthlyFee)}/mo

Best for: ${growth.bestFor}

Includes:

${growth.includes.map((item) => `- ${item}`).join('\n')}

## Delivery Promise

${commercial.deliveryPromise}

## Close

"You raise the animals. Reptiscale runs the buyer journey."
`;
}

function pricingTableCsv() {
  return toCsv(commercial.packages.map((pkg) => ({
    package: pkg.name,
    setupFee: pkg.setupFee,
    monthlyFee: pkg.monthlyFee,
    bestFor: pkg.bestFor,
    speciesLimit: pkg.limits.species,
    monthlySocialPosts: pkg.limits.monthlySocialPosts,
    activeCampaigns: pkg.limits.activeCampaigns,
    recommended: pkg.recommended ? 'yes' : 'no',
  })), ['package', 'setupFee', 'monthlyFee', 'bestFor', 'speciesLimit', 'monthlySocialPosts', 'activeCampaigns', 'recommended']);
}

function addOnsCsv() {
  return toCsv(commercial.addOns.map((addOn) => ({
    name: addOn.name,
    price: addOn.price,
    billing: addOn.billing,
  })), ['name', 'price', 'billing']);
}

function onboardingTimelineCsv() {
  const rows = [
    ['Day 0', 'Payment and intake', 'Send intake form, access checklist, schedule kickoff'],
    ['Day 1-2', 'Account setup', 'Create HighLevel account, run setup script, confirm permissions'],
    ['Day 3-5', 'Brand and funnel build', 'Load brand, inventory, storefront, lead magnet, reservation page'],
    ['Day 6-8', 'Workflow setup', 'Build lead, offer, purchase, shipping, care, review/referral workflows'],
    ['Day 9-10', 'Testing', 'Submit lead, click offer, trigger purchase, test shipping and care sequence'],
    ['Day 11-12', 'Training', 'Teach inbox, pipeline, contact records, animal updates, content approval'],
    ['Day 13-14', 'Launch', 'Publish pages, activate workflows, send launch links, schedule review'],
  ].map(([day, phase, tasks]) => ({ day, phase, tasks }));
  return toCsv(rows, ['day', 'phase', 'tasks']);
}

function salesPipelineCsv() {
  return toCsv(commercial.salesPipeline.map((stage, index) => ({
    order: index + 1,
    stage,
    exitCriteria: {
      'New Prospect': 'Prospect identified and added to CRM',
      'Discovery Booked': 'Call scheduled',
      'Demo Completed': 'Demo shown and fit confirmed',
      'Proposal Sent': 'Package and pricing sent',
      'Won - Onboarding': 'Payment received and intake started',
      Lost: 'Reason documented',
      Nurture: 'Not ready now, follow-up scheduled',
    }[stage] || '',
  })), ['order', 'stage', 'exitCriteria']);
}

function customerSuccessPlan() {
  return `# Customer Success Plan

## Success Metrics

${commercial.successMetrics.map((metric) => `- ${metric}`).join('\n')}

## First 30 Days

Week 1:
- Confirm lead capture works.
- Watch every workflow trigger.
- Fix broken fields, copy, or links.

Week 2:
- Review first leads and buyer responses.
- Tune nurture and offer follow-up.

Week 3:
- Launch availability or social campaign.
- Ask for customer feedback.

Week 4:
- Run first monthly review.
- Ask for testimonial or referral if healthy.

## Monthly Review

1. Leads captured
2. Sales/deposits influenced
3. Shipping/care events
4. Reviews and referrals
5. Social content posted
6. Recommended improvement for next month
`;
}

function demoChecklist() {
  return `# Demo Checklist

- [ ] Open the Reptiscale sales page.
- [ ] Show the SunScale storefront.
- [ ] Submit the Crested Gecko Starter Guide form.
- [ ] Open the HighLevel contact record.
- [ ] Show tags, species interest, animal interest, offer name, journey stage, and next best action.
- [ ] Open an animal detail page.
- [ ] Show the reservation page.
- [ ] Explain purchase confirmation and safe-shipping workflow.
- [ ] Show care onboarding emails/SMS.
- [ ] Show review, referral, and VIP list follow-up.
- [ ] Recommend Starter, Growth, or Scale.
`;
}

function main() {
  ensureDir(OUT_DIR);

  write('sales-one-pager.md', salesOnePager());
  write('pricing-table.csv', pricingTableCsv());
  write('add-ons.csv', addOnsCsv());
  write('onboarding-timeline.csv', onboardingTimelineCsv());
  write('sales-pipeline.csv', salesPipelineCsv());
  write('customer-success-plan.md', customerSuccessPlan());
  write('demo-checklist.md', demoChecklist());
  write('commercial-model.json', JSON.stringify(commercial, null, 2));

  console.log(`Exported Reptiscale commercial packet to ${OUT_DIR}`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
