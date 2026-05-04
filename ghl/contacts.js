const ghl = require('./client');

const locationId = ghl.locationId;

async function createContact(data) {
  const result = await ghl.post('/contacts/', { ...data, locationId });
  return result.contact || result;
}

async function updateContact(id, data) {
  const result = await ghl.put(`/contacts/${id}`, data);
  return result.contact || result;
}

async function getContact(id) {
  const result = await ghl.get(`/contacts/${id}`);
  return result.contact || result;
}

async function searchContacts(query) {
  const result = await ghl.get('/contacts/', {
    locationId,
    query,
  });
  return result.contacts || [];
}

async function getContactsByTag(tag) {
  const result = await ghl.get('/contacts/', {
    locationId,
    tags: tag,
  });
  return result.contacts || [];
}

async function addTag(contactId, tags) {
  const tagsArray = Array.isArray(tags) ? tags : [tags];
  const result = await ghl.post(`/contacts/${contactId}/tags`, { tags: tagsArray });
  return result;
}

async function removeTag(contactId, tags) {
  const tagsArray = Array.isArray(tags) ? tags : [tags];
  const result = await ghl.delete(`/contacts/${contactId}/tags`);
  return result;
}

async function addContactToWorkflow(contactId, workflowId) {
  const result = await ghl.post(`/contacts/${contactId}/workflow/${workflowId}`, {});
  return result;
}

async function moveContactPipelineStage(contactId, pipelineId, stageId) {
  // First find the opportunity for this contact in this pipeline, or create one
  const opps = await ghl.get('/opportunities/search', {
    location_id: locationId,
    contact_id: contactId,
    pipeline_id: pipelineId,
  });
  const existing = (opps.opportunities || [])[0];

  if (existing) {
    const result = await ghl.put(`/opportunities/${existing.id}`, {
      pipelineStageId: stageId,
    });
    return result.opportunity || result;
  } else {
    const result = await ghl.post('/opportunities/', {
      locationId,
      contactId,
      pipelineId,
      pipelineStageId: stageId,
      name: `Opportunity for ${contactId}`,
    });
    return result.opportunity || result;
  }
}

module.exports = {
  createContact,
  updateContact,
  getContact,
  searchContacts,
  getContactsByTag,
  addTag,
  removeTag,
  addContactToWorkflow,
  moveContactPipelineStage,
};
