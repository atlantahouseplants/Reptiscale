/**
 * Tier-Based Feature Gating
 *
 * Defines which features are available at each HatchKit pricing tier.
 * Used by the onboarding script to determine what to set up per breeder,
 * and by the server to gate feature access at runtime.
 */

const TIER_FEATURES = {
  starter: {
    price: { monthly: 149, setup: 499 },
    pipelines: ['lead_pipeline'],
    agents: [],
    maxSequences: 5,
    contentPostsPerWeek: 0,
    showQR: true,
    shippingAgent: false,
    leadScoring: false,
    aiDrafts: false,
    aiAutoResponse: false,
    inboxChannels: ['email', 'sms'],
    mediaStorageGB: 10,
    website: false,
    analytics: 'basic',           // lead count + source breakdown only
    commentLeadCapture: false,
    postSuggestionEngine: false,
    customDomain: false,
  },
  growth: {
    price: { monthly: 249, setup: 999 },
    pipelines: ['lead_pipeline', 'sales_pipeline', 'shipping_pipeline'],
    agents: ['shipping', 'lead-scoring'],
    maxSequences: -1,             // unlimited
    contentPostsPerWeek: 3,
    showQR: true,
    shippingAgent: true,
    leadScoring: true,
    aiDrafts: true,
    aiAutoResponse: false,
    inboxChannels: ['email', 'sms', 'instagram', 'facebook'],
    mediaStorageGB: 50,
    website: true,
    analytics: 'standard',       // leads + deals visible on pages
    commentLeadCapture: false,
    postSuggestionEngine: false,
    customDomain: true,
  },
  pro: {
    price: { monthly: 399, setup: 1499 },
    pipelines: ['lead_pipeline', 'sales_pipeline', 'shipping_pipeline'],
    agents: ['shipping', 'lead-scoring', 'content'],
    maxSequences: -1,
    contentPostsPerWeek: 7,       // daily
    showQR: true,
    shippingAgent: true,
    leadScoring: true,
    aiDrafts: true,
    aiAutoResponse: true,
    inboxChannels: ['email', 'sms', 'instagram', 'facebook', 'morphmarket'],
    mediaStorageGB: 200,
    website: true,
    analytics: 'full',           // all metrics, date range, CSV export
    commentLeadCapture: true,
    postSuggestionEngine: true,
    customDomain: true,
  },
};

/**
 * Check if a feature is available for a given tier.
 * @param {string} tier - 'starter', 'growth', or 'pro'
 * @param {string} feature - Feature key from TIER_FEATURES
 * @returns {boolean|any} - The feature value (boolean, number, array, etc.)
 */
function hasFeature(tier, feature) {
  const tierConfig = TIER_FEATURES[tier];
  if (!tierConfig) return false;
  return tierConfig[feature];
}

/**
 * Check if a specific pipeline should be created for this tier.
 */
function shouldCreatePipeline(tier, pipelineKey) {
  const tierConfig = TIER_FEATURES[tier];
  if (!tierConfig) return false;
  return tierConfig.pipelines.includes(pipelineKey);
}

/**
 * Check if an agent should be enabled for this tier.
 */
function shouldEnableAgent(tier, agentName) {
  const tierConfig = TIER_FEATURES[tier];
  if (!tierConfig) return false;
  return tierConfig.agents.includes(agentName);
}

/**
 * Get the full tier config.
 */
function getTierConfig(tier) {
  return TIER_FEATURES[tier] || null;
}

module.exports = {
  TIER_FEATURES,
  hasFeature,
  shouldCreatePipeline,
  shouldEnableAgent,
  getTierConfig,
};
