const ghl = require('./client');
const fs = require('fs');
const path = require('path');

const locationId = ghl.locationId;

function loadConfig() {
  const configPath = path.join(__dirname, '..', 'data', 'ghl-config.json');
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

async function getAllPipelines() {
  const result = await ghl.get('/opportunities/pipelines', { locationId });
  return result.pipelines || [];
}

async function getPipeline(pipelineId) {
  const pipelines = await getAllPipelines();
  return pipelines.find((p) => p.id === pipelineId) || null;
}

async function createOpportunity(data) {
  const result = await ghl.post('/opportunities/', {
    locationId,
    ...data,
  });
  return result.opportunity || result;
}

async function updateOpportunity(opportunityId, data) {
  const result = await ghl.put(`/opportunities/${opportunityId}`, data);
  return result.opportunity || result;
}

async function moveStage(opportunityId, pipelineStageId) {
  return updateOpportunity(opportunityId, { pipelineStageId });
}

async function getOpportunitiesForContact(contactId) {
  const result = await ghl.get('/opportunities/search', {
    location_id: locationId,
    contact_id: contactId,
  });
  return result.opportunities || [];
}

// Shortcut: get a named pipeline's stage ID by stage name from config
function getStageId(pipelineKey, stageName) {
  const config = loadConfig();
  const pipeline = config.pipelines[pipelineKey];
  if (!pipeline) throw new Error(`Pipeline "${pipelineKey}" not found in ghl-config.json`);

  const slug = stageName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

  const stage = pipeline.stages[slug];
  if (!stage) throw new Error(`Stage "${stageName}" not found in pipeline "${pipelineKey}"`);
  return { pipelineId: pipeline.id, stageId: stage.id };
}

module.exports = {
  getAllPipelines,
  getPipeline,
  createOpportunity,
  updateOpportunity,
  moveStage,
  getOpportunitiesForContact,
  getStageId,
};
