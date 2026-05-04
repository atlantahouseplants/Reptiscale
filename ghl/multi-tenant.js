/**
 * Multi-Tenant GHL Client Factory
 *
 * Creates per-breeder GHL API clients and provides breeder lookup
 * for routing incoming webhooks to the correct breeder context.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const BREEDERS_DIR = path.join(__dirname, '..', 'data', 'breeders');
const LEGACY_CONFIG_PATH = path.join(__dirname, '..', 'data', 'ghl-config.json');
const LEGACY_CLIENTS_PATH = path.join(__dirname, '..', 'data', 'clients.json');

const BASE_URL = process.env.GHL_API_BASE || 'https://services.leadconnectorhq.com';
const VERSION = process.env.GHL_API_VERSION || '2021-07-28';

// In-memory cache of breeder configs (refreshed on demand)
let _breederCache = null;
let _cacheTime = 0;
const CACHE_TTL_MS = 30000; // 30 seconds

// ─── Breeder Config Loading ──────────────────────────────────────────────────

/**
 * Load all breeder configs from data/breeders/{clientId}/ directories.
 * Falls back to legacy single-tenant config if no per-breeder dirs exist.
 */
function loadAllBreeders() {
  const now = Date.now();
  if (_breederCache && (now - _cacheTime) < CACHE_TTL_MS) {
    return _breederCache;
  }

  const breeders = {};

  // Try per-breeder directories first
  if (fs.existsSync(BREEDERS_DIR)) {
    const dirs = fs.readdirSync(BREEDERS_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    for (const clientId of dirs) {
      const breederDir = path.join(BREEDERS_DIR, clientId);
      const ghlConfigPath = path.join(breederDir, 'ghl-config.json');
      const clientConfigPath = path.join(breederDir, 'client.json');

      if (!fs.existsSync(ghlConfigPath)) continue;

      try {
        const ghlConfig = JSON.parse(fs.readFileSync(ghlConfigPath, 'utf8'));
        const clientConfig = fs.existsSync(clientConfigPath)
          ? JSON.parse(fs.readFileSync(clientConfigPath, 'utf8'))
          : {};

        const envTokenKey = `GHL_PRIVATE_TOKEN_${clientId.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}`;

        breeders[clientId] = {
          clientId,
          locationId: ghlConfig.locationId,
          token: process.env[envTokenKey] || process.env.GHL_PRIVATE_TOKEN,
          ghlConfig,
          clientConfig: { clientId, ...clientConfig },
        };
      } catch (err) {
        console.warn(`[multi-tenant] Failed to load breeder config for ${clientId}:`, err.message);
      }
    }
  }

  // Fallback: if no per-breeder configs, use legacy single-tenant setup
  if (Object.keys(breeders).length === 0) {
    try {
      const ghlConfig = JSON.parse(fs.readFileSync(LEGACY_CONFIG_PATH, 'utf8'));
      const clients = JSON.parse(fs.readFileSync(LEGACY_CLIENTS_PATH, 'utf8'));
      const defaultClient = clients[0] || {};

      const clientId = defaultClient.clientId || 'default';
      breeders[clientId] = {
        clientId,
        locationId: ghlConfig.locationId || process.env.GHL_LOCATION_ID,
        token: process.env.GHL_PRIVATE_TOKEN,
        ghlConfig,
        clientConfig: defaultClient,
      };
    } catch (err) {
      console.warn('[multi-tenant] No breeder configs found, using env defaults');
      breeders['default'] = {
        clientId: 'default',
        locationId: process.env.GHL_LOCATION_ID,
        token: process.env.GHL_PRIVATE_TOKEN,
        ghlConfig: {},
        clientConfig: {},
      };
    }
  }

  _breederCache = breeders;
  _cacheTime = now;
  return breeders;
}

/**
 * Get a specific breeder by clientId.
 */
function getBreeder(clientId) {
  const breeders = loadAllBreeders();
  return breeders[clientId] || null;
}

/**
 * Look up which breeder owns a given GHL locationId.
 * Used for routing incoming webhooks.
 */
function getBreederByLocationId(locationId) {
  const breeders = loadAllBreeders();
  for (const breeder of Object.values(breeders)) {
    if (breeder.locationId === locationId) return breeder;
  }
  return null;
}

/**
 * Get all registered breeders.
 */
function getAllBreeders() {
  return Object.values(loadAllBreeders());
}

// ─── Per-Breeder GHL API Client ──────────────────────────────────────────────

/**
 * Create a GHL API client bound to a specific breeder's token and locationId.
 */
function createClientForBreeder(clientId) {
  const breeder = getBreeder(clientId);
  if (!breeder) throw new Error(`Breeder not found: ${clientId}`);
  return _createClient(breeder.token, breeder.locationId, breeder.ghlConfig);
}

/**
 * Create a GHL API client from a breeder context object (as returned by getBreederByLocationId).
 */
function createClientFromContext(breederContext) {
  return _createClient(breederContext.token, breederContext.locationId, breederContext.ghlConfig);
}

function _createClient(token, locationId, ghlConfig = {}) {
  if (!token) throw new Error('GHL token is required');

  const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      Version: VERSION,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    timeout: 15000,
  });

  // Rate limit retry
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers['retry-after'] || '5', 10);
        console.warn(`[GHL] Rate limited. Retrying after ${retryAfter}s...`);
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        return instance.request(error.config);
      }
      throw error;
    }
  );

  // Helper functions bound to this breeder
  async function get(endpoint, params = {}) {
    const response = await instance.get(endpoint, { params });
    return response.data;
  }

  async function post(endpoint, data = {}) {
    const response = await instance.post(endpoint, data);
    return response.data;
  }

  async function put(endpoint, data = {}) {
    const response = await instance.put(endpoint, data);
    return response.data;
  }

  async function del(endpoint) {
    const response = await instance.delete(endpoint);
    return response.data;
  }

  // Resolve custom field ID from this breeder's config
  function getFieldId(key) {
    return ghlConfig?.customFields?.[key]?.id || null;
  }

  // Resolve pipeline/stage ID from this breeder's config
  function getPipelineId(pipelineKey) {
    return ghlConfig?.pipelines?.[pipelineKey]?.id || null;
  }

  function getStageId(pipelineKey, stageKey) {
    return ghlConfig?.pipelines?.[pipelineKey]?.stages?.[stageKey]?.id || null;
  }

  // Identify which pipeline key a given pipelineId belongs to
  function getPipelineKey(pipelineId) {
    const pipelines = ghlConfig?.pipelines || {};
    for (const [key, p] of Object.entries(pipelines)) {
      if (p.id === pipelineId) return key;
    }
    return null;
  }

  return {
    get, post, put, delete: del,
    locationId,
    ghlConfig,
    getFieldId,
    getPipelineId,
    getStageId,
    getPipelineKey,
  };
}

// ─── Cache Invalidation ──────────────────────────────────────────────────────

function invalidateCache() {
  _breederCache = null;
  _cacheTime = 0;
}

module.exports = {
  loadAllBreeders,
  getBreeder,
  getBreederByLocationId,
  getAllBreeders,
  createClientForBreeder,
  createClientFromContext,
  invalidateCache,
};
