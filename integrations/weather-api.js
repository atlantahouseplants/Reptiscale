require('dotenv').config();
const axios = require('axios');
const speciesDb = require('../data/species-db.json');
const hubs = require('../data/carrier-hubs.json');

const API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const BASE = 'https://api.openweathermap.org';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSpecies(speciesId) {
  const s = speciesDb.species.find(
    (sp) => sp.id === speciesId || sp.name.toLowerCase() === speciesId.toLowerCase()
  );
  if (!s) throw new Error(`Unknown species: "${speciesId}". Check data/species-db.json for valid IDs.`);
  return s;
}

// Returns next Monday, Tuesday, or Wednesday on or after `fromDate`
function nextValidShipDay(fromDate = new Date()) {
  const d = new Date(fromDate);
  // 1=Mon, 2=Tue, 3=Wed
  while (![1, 2, 3].includes(d.getDay())) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

// ─── Geocoding ────────────────────────────────────────────────────────────────

async function zipToCoords(zip) {
  const url = `${BASE}/geo/1.0/zip`;
  const resp = await axios.get(url, {
    params: { zip: `${zip},US`, appid: API_KEY },
    timeout: 10000,
  });
  return { lat: resp.data.lat, lon: resp.data.lon, name: resp.data.name };
}

// ─── Core: getWeatherForecast ─────────────────────────────────────────────────

/**
 * Returns a 5-day forecast with daily high/low in °F.
 * OpenWeatherMap free tier provides 3-hour intervals; we aggregate to daily.
 */
async function getWeatherForecast(lat, lon) {
  const url = `${BASE}/data/2.5/forecast`;
  const resp = await axios.get(url, {
    params: { lat, lon, appid: API_KEY, units: 'imperial', cnt: 40 },
    timeout: 10000,
  });

  // Group 3-hour intervals by date → daily high/low
  const days = {};
  for (const item of resp.data.list) {
    const date = item.dt_txt.split(' ')[0];
    if (!days[date]) days[date] = { high: -999, low: 999, date };
    days[date].high = Math.max(days[date].high, item.main.temp_max);
    days[date].low = Math.min(days[date].low, item.main.temp_min);
  }

  return {
    city: resp.data.city?.name || 'Unknown',
    country: resp.data.city?.country || 'US',
    lat,
    lon,
    forecast: Object.values(days).map((d) => ({
      date: d.date,
      high: Math.round(d.high),
      low: Math.round(d.low),
    })),
  };
}

// ─── Core: getRouteWeather ────────────────────────────────────────────────────

/**
 * Gets weather for origin zip and destination zip.
 * Also checks the highest-risk carrier hubs along the route (Memphis for FedEx, Louisville for UPS).
 */
async function getRouteWeather(originZip, destZip) {
  const [originCoords, destCoords] = await Promise.all([
    zipToCoords(originZip),
    zipToCoords(destZip),
  ]);

  const [originWeather, destWeather] = await Promise.all([
    getWeatherForecast(originCoords.lat, originCoords.lon),
    getWeatherForecast(destCoords.lat, destCoords.lon),
  ]);

  // Always check both primary hubs (FedEx Memphis + UPS Louisville)
  const primaryHubs = hubs.hubs.filter((h) =>
    ['fedex_memphis', 'ups_louisville'].includes(h.id)
  );
  const hubWeathers = await Promise.all(
    primaryHubs.map(async (hub) => ({
      hub,
      weather: await getWeatherForecast(hub.lat, hub.lon),
    }))
  );

  return {
    origin: { zip: originZip, ...originCoords, weather: originWeather },
    destination: { zip: destZip, ...destCoords, weather: destWeather },
    hubs: hubWeathers,
  };
}

// ─── Core: checkShippingViability ─────────────────────────────────────────────

/**
 * Main shipping decision function.
 * Returns a structured decision object for a given route + species.
 */
async function checkShippingViability(originZip, destZip, speciesId) {
  const species = getSpecies(speciesId);
  const route = await getRouteWeather(originZip, destZip);

  const warnings = [];
  let canShip = true;
  let reason = 'Safe to ship.';
  let holdAtFacility = false;
  let recommendedShipDate = null;
  let heatPack = false;
  let coldPack = false;
  let insulationType = 'standard';

  // Find the best ship day (Mon–Wed) within the 5-day forecast
  const today = new Date();
  let bestDay = null;

  // Collect forecasts from origin, destination, and hubs for each candidate day
  const allLocations = [
    { label: `Origin (${route.origin.name || originZip})`, forecast: route.origin.weather.forecast },
    { label: `Destination (${route.destination.name || destZip})`, forecast: route.destination.weather.forecast },
    ...route.hubs.map(({ hub, weather }) => ({
      label: `${hub.carrier} Hub (${hub.city})`,
      forecast: weather.forecast,
    })),
  ];

  // Build a per-day worst-case temp map
  const dayMap = {}; // date → { worstHigh, worstLow, blockers[], packNeeds[] }
  for (const loc of allLocations) {
    for (const day of loc.forecast) {
      if (!dayMap[day.date]) {
        dayMap[day.date] = { worstHigh: day.high, worstLow: day.low, sources: [] };
      }
      dayMap[day.date].worstHigh = Math.max(dayMap[day.date].worstHigh, day.high);
      dayMap[day.date].worstLow = Math.min(dayMap[day.date].worstLow, day.low);
      dayMap[day.date].sources.push({ label: loc.label, high: day.high, low: day.low });
    }
  }

  // Evaluate each valid ship day (Mon/Tue/Wed in the next 5 days)
  for (let i = 0; i < 5; i++) {
    const candidate = new Date(today);
    candidate.setDate(today.getDate() + i + 1); // start from tomorrow
    const dow = candidate.getDay();
    if (![1, 2, 3].includes(dow)) continue; // only Mon/Tue/Wed

    const dateStr = formatDate(candidate);
    const temps = dayMap[dateStr];
    if (!temps) continue;

    const { worstHigh, worstLow } = temps;
    let dayOk = true;
    const dayIssues = [];

    // Check hard no-ship thresholds
    if (worstLow < species.no_ship_below) {
      dayIssues.push(`Low ${worstLow}°F below species no-ship minimum (${species.no_ship_below}°F)`);
      dayOk = false;
    }
    if (worstHigh > species.no_ship_above) {
      dayIssues.push(`High ${worstHigh}°F above species no-ship maximum (${species.no_ship_above}°F)`);
      dayOk = false;
    }

    if (dayOk) {
      bestDay = { date: dateStr, worstHigh, worstLow, sources: temps.sources };

      // Determine packing needs for this day
      if (worstLow < species.heat_pack_below) heatPack = true;
      if (worstHigh > species.cold_pack_above) coldPack = true;
      if (worstHigh > species.hold_at_facility_above) holdAtFacility = true;

      break;
    } else {
      warnings.push(`${dateStr}: Cannot ship — ${dayIssues.join('; ')}`);
    }
  }

  // Final decision
  if (!bestDay) {
    canShip = false;
    reason = `No safe ship days (Mon–Wed) found in the 5-day forecast for ${species.name}. ` +
      `Temperature extremes exceed species tolerances at one or more points on the route.`;
  } else {
    recommendedShipDate = bestDay.date;
    reason = `Safe to ship on ${bestDay.date}. Route temps: low ${bestDay.worstLow}°F / high ${bestDay.worstHigh}°F.`;

    if (holdAtFacility) {
      reason += ` Hold at facility required (temps above ${species.hold_at_facility_above}°F).`;
    }
    if (heatPack && coldPack) {
      warnings.push('Unusual: both heat AND cold pack indicated — verify forecast and consider holding.');
      insulationType = 'dual_pack';
    } else if (heatPack) {
      insulationType = bestDay.worstLow < 45 ? '72hr_heat_pack' : '40hr_heat_pack';
    } else if (coldPack) {
      insulationType = 'cold_pack';
    } else {
      insulationType = 'none_needed';
    }
  }

  return {
    canShip,
    reason,
    species: { id: species.id, name: species.name },
    recommendedShipDate,
    packingInstructions: {
      heatPack,
      coldPack,
      insulationType,
      preferredContainer: species.preferred_packing,
    },
    holdAtFacility,
    warnings,
    routeSummary: {
      origin: `${route.origin.name || originZip} (${originZip})`,
      destination: `${route.destination.name || destZip} (${destZip})`,
      worstRouteHigh: bestDay?.worstHigh ?? null,
      worstRouteLow: bestDay?.worstLow ?? null,
    },
  };
}

module.exports = {
  getWeatherForecast,
  getRouteWeather,
  checkShippingViability,
};
