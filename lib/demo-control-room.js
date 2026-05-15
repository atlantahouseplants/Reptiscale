const client = require('../data/breeders/sunscale-geckos/client.json');
const machine = require('../data/reptiscale-machine.json');
const products = require('../data/demo-products.json');

function money(value) {
  return `$${Number(value || 0).toFixed(0)}`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function buildJourneyScenario() {
  const outcomesByStage = {
    brand_discovery: 'Buyer finds SunScale from Instagram, show QR, MorphMarket, referral, or search.',
    lead_capture: 'Starter guide captures contact info, species interest, source, and budget.',
    nurture: 'Email/SMS drip teaches care basics and shows animals that match the buyer.',
    offer: 'Buyer sees the reservation deposit, care kit, consult, or waitlist offer.',
    purchase: 'Deposit or full payment triggers customer tags, care expectations, and shipping review.',
    shipping: 'Weather and payload readiness create a review-only operator decision.',
    onboarding: 'Buyer gets setup reminders, arrival-day checks, and first-week care guidance.',
    advocacy: 'Safe arrival turns into review, photo permission, referral, and social proof.',
    repeat_buyer: 'VIP alerts and future clutch updates bring the buyer back.',
  };

  return machine.lifecycleStages.map((stage, index) => ({
    number: index + 1,
    key: stage.key,
    label: stage.label,
    goal: stage.goal,
    outcome: outcomesByStage[stage.key] || stage.goal,
    highLevelObjects: stage.highLevelObjects || [],
    tags: stage.automationTags || [],
  }));
}

function buildManualSetup() {
  return [
    {
      area: 'Pipelines',
      owner: 'Manual in HighLevel',
      status: 'needed',
      items: [
        'HatchKit - Lead Pipeline',
        'HatchKit - Sales Pipeline',
        'HatchKit - Shipping Pipeline',
      ],
    },
    {
      area: 'Opportunities',
      owner: 'Manual in HighLevel',
      status: 'needed',
      items: [
        'Ava Bennett lead opportunity',
        'Marcus Hill sale and shipping opportunities',
        'Priya Raman sale and approved shipping opportunities',
        'Drew Coleman delivered and LAG confirmed opportunities',
      ],
    },
    {
      area: 'Workflows',
      owner: 'Build from exported checklist',
      status: 'ready-to-wire',
      items: [
        'Lead magnet delivery',
        'Offer clicked / animal interest',
        'Order submitted',
        'Order shipping review',
        'Daily weather re-check',
        'Review submitted',
        'Referral submitted',
      ],
    },
    {
      area: 'Smart Lists',
      owner: 'Manual in HighLevel',
      status: 'ready-to-build',
      items: [
        'New crested gecko leads',
        'Hot animal buyers',
        'Shipping holds',
        'Operator review queue',
        'Ready for label approval',
        'Review/referral candidates',
        'Repeat buyer VIP',
      ],
    },
  ];
}

function buildContentCalendar(startDate = new Date()) {
  const animals = products.animals || [];
  const spotlight = animals.find((animal) => animal.status === 'Available') || animals[0] || {};
  const topics = [
    ['Instagram', 'Animal spotlight', `${spotlight.name || 'Featured animal'} availability post`, 'View details'],
    ['Facebook', 'Care tip', 'First 72 hours with a new crested gecko', 'Download the starter guide'],
    ['Instagram', 'Behind the scenes', 'Feeding night, weight checks, and breeder notes', 'Ask about current availability'],
    ['TikTok', 'Education', 'Beginner versus collector crested geckos', 'Comment budget for recommendations'],
    ['Instagram', 'Offer', 'Reservation deposits and safe shipping explained', 'Reserve a gecko'],
    ['Facebook', 'Proof', 'Safe arrival, setup checklist, and buyer story', 'Join the starter guide list'],
    ['Instagram', 'Waitlist', 'Next clutch preview and VIP first look', 'Join VIP alerts'],
  ];

  return topics.map(([platform, pillar, topic, cta], index) => ({
    date: isoDate(addDays(startDate, index)),
    platform,
    pillar,
    topic,
    cta,
    status: index === 0 ? 'ready-for-review' : 'planned',
  }));
}

function buildOfferStack() {
  return machine.offers.map((offer) => ({
    key: offer.key,
    name: offer.name,
    type: offer.type,
    price: offer.price,
    priceLabel: money(offer.price),
    goal: offer.goal,
    upsell: offer.upsell || null,
    downsell: offer.downsell || null,
  }));
}

function buildRevenueSnapshot() {
  const reservation = machine.offers.find((offer) => offer.key === 'animal_reservation')?.price || 0;
  const kit = machine.offers.find((offer) => offer.key === 'care_starter_kit')?.price || 0;
  const consult = machine.offers.find((offer) => offer.key === 'breeder_consult')?.price || 0;
  const sampleAnimal = (products.animals || []).find((animal) => animal.name === 'Mango') || (products.animals || [])[0] || {};
  const immediateCart = reservation + kit + consult;

  return {
    sampleAnimal: sampleAnimal.name || 'Demo animal',
    animalPrice: sampleAnimal.price || 0,
    animalPriceLabel: money(sampleAnimal.price),
    immediateCart,
    immediateCartLabel: money(immediateCart),
    attachRateUpsells: ['Care starter kit', '30-minute setup review'],
    repeatRevenuePath: ['VIP alerts', 'Future clutch waitlist', 'Referral buyer', 'Care add-ons'],
  };
}

function buildDemoControlRoom(options = {}) {
  return {
    generatedAt: new Date().toISOString(),
    client: {
      businessName: client.businessName,
      locationId: client.ghlLocationId,
      ownerName: client.ownerName,
      species: client.species,
    },
    positioning: machine.positioning,
    journeyScenario: buildJourneyScenario(),
    manualSetup: buildManualSetup(),
    offerStack: buildOfferStack(),
    revenueSnapshot: buildRevenueSnapshot(),
    contentCalendar: buildContentCalendar(options.startDate || new Date()),
    demoPages: [
      { label: 'Storefront', href: '/exports/reptiscale-demo/products.csv' },
      { label: 'Starter guide page', href: '/templates/pages/crested-gecko-starter-guide.html' },
      { label: 'Reservation offer', href: '/templates/pages/reservation-offer.html' },
      { label: 'Workflow checklist', href: '/exports/reptiscale-demo/highlevel-workflow-checklist.md' },
    ],
  };
}

module.exports = {
  buildDemoControlRoom,
};
