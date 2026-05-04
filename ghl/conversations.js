const ghl = require('./client');

const locationId = ghl.locationId;

async function getConversation(contactId) {
  const result = await ghl.get('/conversations/search', {
    locationId,
    contactId,
  });
  return (result.conversations || [])[0] || null;
}

async function sendSMS(contactId, message) {
  // Get or create conversation
  let conversation = await getConversation(contactId);

  if (!conversation) {
    const created = await ghl.post('/conversations/', {
      locationId,
      contactId,
    });
    conversation = created.conversation || created;
  }

  const result = await ghl.post(`/conversations/messages`, {
    type: 'SMS',
    contactId,
    locationId,
    message,
    conversationId: conversation.id,
    conversationProviderId: 'twilio_provider',
  });
  return result;
}

async function sendEmail(contactId, subject, htmlBody) {
  let conversation = await getConversation(contactId);

  if (!conversation) {
    const created = await ghl.post('/conversations/', {
      locationId,
      contactId,
    });
    conversation = created.conversation || created;
  }

  const result = await ghl.post(`/conversations/messages`, {
    type: 'Email',
    contactId,
    locationId,
    subject,
    html: htmlBody,
    conversationId: conversation.id,
  });
  return result;
}

async function getMessages(conversationId, limit = 20) {
  const result = await ghl.get(`/conversations/${conversationId}/messages`, {
    limit,
  });
  return result.messages || [];
}

module.exports = {
  getConversation,
  sendSMS,
  sendEmail,
  getMessages,
};
