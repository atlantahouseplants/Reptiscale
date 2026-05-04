/**
 * GHL Webhook payload parsers and validators.
 * Used by server.js to process inbound webhook events from GHL.
 */

function parsePipelineChangeEvent(body) {
  return {
    contactId: body.contact_id || body.contactId,
    opportunityId: body.id || body.opportunityId,
    pipelineId: body.pipeline_id || body.pipelineId,
    stageId: body.pipeline_stage_id || body.pipelineStageId,
    stageName: body.pipeline_stage_name || body.pipelineStageName,
    locationId: body.location_id || body.locationId,
    status: body.status,
    monetaryValue: body.monetary_value || body.monetaryValue,
  };
}

function parseNewContactEvent(body) {
  return {
    contactId: body.id || body.contact_id || body.contactId,
    firstName: body.first_name || body.firstName,
    lastName: body.last_name || body.lastName,
    email: body.email,
    phone: body.phone,
    locationId: body.location_id || body.locationId,
    tags: body.tags || [],
    customFields: body.customField || body.customFields || [],
  };
}

function parseFormSubmissionEvent(body) {
  return {
    contactId: body.contact_id || body.contactId,
    formId: body.form_id || body.formId,
    locationId: body.location_id || body.locationId,
    fields: body.formData || body.fields || body,
  };
}

function validateWebhookPayload(body, requiredFields = []) {
  const missing = requiredFields.filter((f) => !body[f]);
  if (missing.length > 0) {
    throw new Error(`Missing required webhook fields: ${missing.join(', ')}`);
  }
  return true;
}

module.exports = {
  parsePipelineChangeEvent,
  parseNewContactEvent,
  parseFormSubmissionEvent,
  validateWebhookPayload,
};
