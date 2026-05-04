// integrations/meta-graph.js
// Meta Graph API integration for Instagram + Facebook publishing

// Load .env and manually apply to process.env (dotenv v17 compatibility)
const _dotenv = require('dotenv').config();
if (_dotenv.parsed) {
  Object.keys(_dotenv.parsed).forEach(function(k) {
    if (!process.env[k]) process.env[k] = _dotenv.parsed[k];
  });
}

const axios = require('axios');

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || null;
const GRAPH_VERSION = 'v19.0';
const BASE_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;

// ─── Auth Helper ──────────────────────────────────────────────────────────────

function authHeaders() {
  return {
    Authorization: `Bearer ${META_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

function isMockMode() {
  if (!META_ACCESS_TOKEN) {
    console.warn('[MetaGraph] META_ACCESS_TOKEN not set — running in mock mode');
    return true;
  }
  return false;
}

// ─── Instagram Publishing ─────────────────────────────────────────────────────

/**
 * Publish an image post to Instagram via the two-step Graph API process.
 *
 * Step 1: Create a media container (POST /{pageId}/media)
 * Step 2: Publish the container (POST /{pageId}/media_publish)
 *
 * @param {string} pageId    - Instagram Business Account / Page ID
 * @param {string} caption   - Full caption text including hashtags
 * @param {string} imageUrl  - Publicly accessible URL of the image
 * @returns {Promise<object>} { success: true, postId: '...' }
 */
async function publishToInstagram(pageId, caption, imageUrl) {
  if (isMockMode()) {
    const mockId = `mock-ig-${Date.now()}`;
    console.log(`[MetaGraph] MOCK: Would publish to Instagram page ${pageId}`);
    console.log(`[MetaGraph] MOCK: Image URL: ${imageUrl}`);
    console.log(`[MetaGraph] MOCK: Caption length: ${caption.length} chars`);
    return { success: true, postId: mockId, mock: true };
  }

  try {
    // Step 1: Create media container
    const containerResponse = await axios.post(
      `${BASE_URL}/${pageId}/media`,
      {
        image_url: imageUrl,
        caption,
        access_token: META_ACCESS_TOKEN,
      },
      { headers: authHeaders() }
    );

    const creationId = containerResponse.data.id;
    if (!creationId) {
      throw new Error('Meta API did not return a container ID (creation_id)');
    }

    console.log(`[MetaGraph] Media container created: ${creationId}`);

    // Step 2: Publish the container
    const publishResponse = await axios.post(
      `${BASE_URL}/${pageId}/media_publish`,
      {
        creation_id: creationId,
        access_token: META_ACCESS_TOKEN,
      },
      { headers: authHeaders() }
    );

    const postId = publishResponse.data.id;
    console.log(`[MetaGraph] Published to Instagram: post ID ${postId}`);
    return { success: true, postId };
  } catch (err) {
    const apiError = err.response?.data?.error?.message || err.message;
    console.error(`[MetaGraph] Instagram publish failed: ${apiError}`);
    throw new Error(`Instagram publish failed: ${apiError}`);
  }
}

// ─── Facebook Publishing ──────────────────────────────────────────────────────

/**
 * Publish a photo to a Facebook Page.
 *
 * @param {string} pageId    - Facebook Page ID
 * @param {string} caption   - Post caption text
 * @param {string} imageUrl  - Publicly accessible URL of the image
 * @returns {Promise<object>} { success: true, postId: '...' }
 */
async function publishToFacebook(pageId, caption, imageUrl) {
  if (isMockMode()) {
    const mockId = `mock-fb-${Date.now()}`;
    console.log(`[MetaGraph] MOCK: Would publish to Facebook page ${pageId}`);
    return { success: true, postId: mockId, mock: true };
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/${pageId}/photos`,
      {
        caption,
        url: imageUrl,
        access_token: META_ACCESS_TOKEN,
      },
      { headers: authHeaders() }
    );

    const postId = response.data.id || response.data.post_id;
    console.log(`[MetaGraph] Published to Facebook: post ID ${postId}`);
    return { success: true, postId };
  } catch (err) {
    const apiError = err.response?.data?.error?.message || err.message;
    console.error(`[MetaGraph] Facebook publish failed: ${apiError}`);
    throw new Error(`Facebook publish failed: ${apiError}`);
  }
}

// ─── Recent Posts ─────────────────────────────────────────────────────────────

/**
 * Retrieve recent media posts from an Instagram Business Account.
 *
 * @param {string} pageId   - Instagram Business Account ID
 * @param {number} count    - Number of posts to retrieve (default 10)
 * @returns {Promise<Array>} Array of post objects
 */
async function getRecentPosts(pageId, count = 10) {
  if (isMockMode()) {
    console.log(`[MetaGraph] MOCK: Would fetch recent posts for page ${pageId}`);
    return [];
  }

  try {
    const response = await axios.get(`${BASE_URL}/${pageId}/media`, {
      params: {
        fields: 'id,caption,timestamp,like_count,comments_count,media_type,permalink',
        limit: count,
        access_token: META_ACCESS_TOKEN,
      },
      headers: authHeaders(),
    });

    return response.data.data || [];
  } catch (err) {
    const apiError = err.response?.data?.error?.message || err.message;
    console.error(`[MetaGraph] getRecentPosts failed: ${apiError}`);
    return [];
  }
}

// ─── Post Insights ────────────────────────────────────────────────────────────

/**
 * Retrieve performance insights for a specific Instagram post.
 *
 * @param {string} postId - Meta media ID of the post
 * @returns {Promise<object>} Insights object with metric data
 */
async function getPostInsights(postId) {
  if (isMockMode()) {
    console.log(`[MetaGraph] MOCK: Would fetch insights for post ${postId}`);
    return {
      mock: true,
      postId,
      metrics: {
        impressions: null,
        reach: null,
        engagement: null,
      },
    };
  }

  try {
    const response = await axios.get(`${BASE_URL}/${postId}/insights`, {
      params: {
        metric: 'impressions,reach,engagement',
        access_token: META_ACCESS_TOKEN,
      },
      headers: authHeaders(),
    });

    const metricsData = response.data.data || [];
    const insights = {};
    for (const metric of metricsData) {
      insights[metric.name] = metric.values?.[0]?.value || null;
    }

    return { success: true, postId, metrics: insights };
  } catch (err) {
    const apiError = err.response?.data?.error?.message || err.message;
    console.error(`[MetaGraph] getPostInsights failed: ${apiError}`);
    return { success: false, postId, error: apiError, metrics: {} };
  }
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  publishToInstagram,
  publishToFacebook,
  getRecentPosts,
  getPostInsights,
};
