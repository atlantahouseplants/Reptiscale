require('dotenv').config();
const ghl = require('../ghl/client');

async function testConnection() {
  const locationId = process.env.GHL_LOCATION_ID;

  if (!locationId) {
    console.error('ERROR: GHL_LOCATION_ID is not set in .env');
    process.exit(1);
  }

  console.log('Testing GHL API connectivity...');
  console.log(`Location ID: ${locationId}`);
  console.log(`API Base: ${process.env.GHL_API_BASE}`);
  console.log('');

  try {
    const data = await ghl.get(`/locations/${locationId}`);
    const location = data.location || data;

    console.log('✅ GHL API connection successful!');
    console.log(`   Location Name: ${location.name}`);
    console.log(`   Location ID:   ${location.id}`);
    console.log(`   Email:         ${location.email || '(not set)'}`);
    console.log(`   Phone:         ${location.phone || '(not set)'}`);
    console.log(`   Address:       ${location.address || '(not set)'}`);
    console.log(`   Timezone:      ${location.timezone || '(not set)'}`);
  } catch (err) {
    console.error('❌ GHL API connection failed.');
    console.error(`   Status: ${err.response?.status}`);
    console.error(`   Message: ${err.response?.data?.message || err.message}`);
    process.exit(1);
  }
}

testConnection();
