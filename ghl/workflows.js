const ghl = require('./client');

const locationId = ghl.locationId;

async function getAllWorkflows() {
  const result = await ghl.get('/workflows/', { locationId });
  return result.workflows || [];
}

async function addContactToWorkflow(contactId, workflowId) {
  const result = await ghl.post(`/contacts/${contactId}/workflow/${workflowId}`, {});
  return result;
}

async function removeContactFromWorkflow(contactId, workflowId) {
  const result = await ghl.delete(`/contacts/${contactId}/workflow/${workflowId}`);
  return result;
}

module.exports = {
  getAllWorkflows,
  addContactToWorkflow,
  removeContactFromWorkflow,
};
