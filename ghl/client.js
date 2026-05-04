require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.GHL_API_BASE || 'https://services.leadconnectorhq.com';
const TOKEN = process.env.GHL_PRIVATE_TOKEN;
const VERSION = process.env.GHL_API_VERSION || '2021-07-28';

if (!TOKEN) {
  throw new Error('GHL_PRIVATE_TOKEN is not set in .env');
}

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    Version: VERSION,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// Response interceptor for error handling + rate limit awareness
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    if (status === 429) {
      const retryAfter = parseInt(error.response.headers['retry-after'] || '5', 10);
      console.warn(`[GHL] Rate limited on ${url}. Retrying after ${retryAfter}s...`);
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      return client.request(error.config);
    }

    const message = error.response?.data?.message || error.message;
    console.error(`[GHL] API error ${status} on ${url}: ${message}`);
    throw error;
  }
);

async function get(endpoint, params = {}) {
  const response = await client.get(endpoint, { params });
  return response.data;
}

async function post(endpoint, data = {}) {
  const response = await client.post(endpoint, data);
  return response.data;
}

async function put(endpoint, data = {}) {
  const response = await client.put(endpoint, data);
  return response.data;
}

async function del(endpoint) {
  const response = await client.delete(endpoint);
  return response.data;
}

module.exports = {
  get,
  post,
  put,
  delete: del,
  locationId: process.env.GHL_LOCATION_ID,
};
