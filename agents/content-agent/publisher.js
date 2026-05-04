// agents/content-agent/publisher.js
// Handles publishing, queuing, and approval flow for generated content

const fs = require('fs');
const path = require('path');

const CONTENT_LOG_DIR = path.join(__dirname, '../../data/content-log');

// Lazy-load meta-graph to avoid hard dependency when not publishing
let metaGraph;
function getMetaGraph() {
  if (!metaGraph) metaGraph = require('../../integrations/meta-graph');
  return metaGraph;
}

// Lazy-load GHL conversations for SMS
let ghlConversations;
function getGHLConversations() {
  if (!ghlConversations) ghlConversations = require('../../ghl/conversations');
  return ghlConversations;
}

// ─── Directory Init ───────────────────────────────────────────────────────────

function ensureLogDir() {
  if (!fs.existsSync(CONTENT_LOG_DIR)) {
    fs.mkdirSync(CONTENT_LOG_DIR, { recursive: true });
  }
}

// ─── Log I/O ──────────────────────────────────────────────────────────────────

/**
 * Read the full content log for a client.
 * @param {string} clientId
 * @returns {Array} Array of log entries
 */
function getLog(clientId) {
  ensureLogDir();
  const filePath = path.join(CONTENT_LOG_DIR, `${clientId}.json`);
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[Publisher] Could not read log for ${clientId}: ${err.message}`);
    return [];
  }
}

/**
 * Save the content log for a client.
 * @param {string} clientId
 * @param {Array}  log
 */
function saveLog(clientId, log) {
  ensureLogDir();
  const filePath = path.join(CONTENT_LOG_DIR, `${clientId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(log, null, 2), 'utf8');
}

/**
 * Find a log entry by postId.
 * @param {string} clientId
 * @param {string} postId
 * @returns {object|null}
 */
function findLogEntry(clientId, postId) {
  const log = getLog(clientId);
  return log.find((entry) => entry.postId === postId) || null;
}

/**
 * Update a specific log entry by postId.
 * @param {string} clientId
 * @param {string} postId
 * @param {object} updates - Fields to merge into the entry
 */
function updateLogEntry(clientId, postId, updates) {
  const log = getLog(clientId);
  const idx = log.findIndex((entry) => entry.postId === postId);
  if (idx !== -1) {
    log[idx] = { ...log[idx], ...updates };
    saveLog(clientId, log);
    return log[idx];
  }
  return null;
}

// ─── Queue ────────────────────────────────────────────────────────────────────

/**
 * Add a post to the content log with status 'queued'.
 * @param {string} clientId
 * @param {object} post - Post object from generatePost()
 * @returns {object} The created log entry
 */
function queuePost(clientId, post) {
  ensureLogDir();
  const log = getLog(clientId);

  const entry = {
    postId: post.id,
    clientId,
    date: post.scheduledFor,
    category: post.category,
    caption: post.caption,
    hashtags: post.hashtags || [],
    photoDirection: post.photoDirection || '',
    status: 'queued',
    imageUrl: null,
    publishedAt: null,
    approvedAt: null,
    metaPostId: null,
    createdAt: post.generatedAt || new Date().toISOString(),
  };

  log.push(entry);
  saveLog(clientId, log);
  console.log(`[Publisher] Post queued: ${post.id} (${post.category}) for ${post.scheduledFor}`);
  return entry;
}

// ─── Publish ──────────────────────────────────────────────────────────────────

/**
 * Publish a post to Instagram via Meta Graph API.
 * @param {string} clientId
 * @param {object} post     - Post object (must have caption, hashtags, id)
 * @param {string} imageUrl - Public URL of the image to post
 * @param {object} clientConfig - Client config containing instagramPageId
 * @returns {Promise<object>} Updated log entry
 */
async function publishPost(clientId, post, imageUrl, clientConfig) {
  const mg = getMetaGraph();
  const pageId = (clientConfig && clientConfig.instagramPageId) || null;

  if (!pageId) {
    console.warn(`[Publisher] No instagramPageId set for ${clientId} — using mock publish`);
  }

  // Combine caption + hashtags for the full post text
  const fullCaption =
    post.caption + '\n\n' + (post.hashtags || []).join(' ');

  let publishResult;
  try {
    publishResult = await mg.publishToInstagram(pageId || 'mock-page-id', fullCaption, imageUrl);
  } catch (err) {
    console.error(`[Publisher] Meta Graph publish failed: ${err.message}`);
    throw err;
  }

  const updatedEntry = updateLogEntry(clientId, post.id, {
    status: 'published',
    imageUrl,
    publishedAt: new Date().toISOString(),
    metaPostId: publishResult.postId || null,
  });

  console.log(`[Publisher] Post published: ${post.id} → Meta ID: ${publishResult.postId}`);
  return updatedEntry;
}

// ─── SMS Approval ─────────────────────────────────────────────────────────────

/**
 * Send an SMS to the breeder for post approval.
 * Uses GHL conversations to send the message.
 *
 * @param {string} clientId
 * @param {object} post        - Post object
 * @param {string} phoneNumber - Breeder's phone number
 * @param {string} contactId   - GHL contact ID (required for GHL SMS)
 */
async function sendApprovalSMS(clientId, post, phoneNumber, contactId) {
  const preview = post.caption.slice(0, 150) + (post.caption.length > 150 ? '...' : '');

  const message =
    `New post ready for review:\n\n${preview}\n\nReply 1 to approve, 2 to skip, or send edits as text.`;

  // Update log to reflect approval is pending
  updateLogEntry(clientId, post.id, {
    status: 'pending_approval',
    approvalSentAt: new Date().toISOString(),
    approvalPhone: phoneNumber,
  });

  try {
    const ghl = getGHLConversations();
    // GHL sendSMS takes a contactId and message
    if (contactId) {
      await ghl.sendSMS(contactId, message);
      console.log(`[Publisher] Approval SMS sent to ${phoneNumber} (contactId: ${contactId}) for post ${post.id}`);
    } else {
      // If no GHL contact ID, log the message instead of sending
      console.log(`[Publisher] Approval SMS (no GHL contact — would send to ${phoneNumber}):\n${message}`);
    }
  } catch (err) {
    console.warn(`[Publisher] Approval SMS failed (non-fatal): ${err.message}`);
  }
}

// ─── Approval Reply Handler ───────────────────────────────────────────────────

/**
 * Process an SMS reply from the breeder regarding a queued post.
 *
 * @param {string} clientId
 * @param {string} postId
 * @param {string} reply     - Raw reply text from SMS
 * @param {object} clientConfig - Client configuration (for publishing)
 * @returns {Promise<object>} Result object describing what happened
 */
async function handleApprovalReply(clientId, postId, reply, clientConfig) {
  const replyTrimmed = reply.trim();
  const entry = findLogEntry(clientId, postId);

  if (!entry) {
    return { success: false, reason: 'Post not found', postId };
  }

  // "1" → approve and publish
  if (replyTrimmed === '1') {
    updateLogEntry(clientId, postId, {
      status: 'approved',
      approvedAt: new Date().toISOString(),
    });
    console.log(`[Publisher] Post ${postId} approved via SMS`);

    // If there's an imageUrl already, attempt to publish
    if (entry.imageUrl && clientConfig) {
      try {
        const mg = getMetaGraph();
        const pageId = clientConfig.instagramPageId || null;
        const fullCaption = entry.caption + '\n\n' + (entry.hashtags || []).join(' ');
        const result = await mg.publishToInstagram(
          pageId || 'mock-page-id',
          fullCaption,
          entry.imageUrl
        );
        updateLogEntry(clientId, postId, {
          status: 'published',
          publishedAt: new Date().toISOString(),
          metaPostId: result.postId || null,
        });
        return { success: true, action: 'published', postId, metaPostId: result.postId };
      } catch (err) {
        return { success: false, action: 'approve_failed', postId, error: err.message };
      }
    }

    return { success: true, action: 'approved_pending_image', postId };
  }

  // "2" → skip
  if (replyTrimmed === '2') {
    updateLogEntry(clientId, postId, {
      status: 'skipped',
      skippedAt: new Date().toISOString(),
    });
    console.log(`[Publisher] Post ${postId} skipped via SMS`);
    return { success: true, action: 'skipped', postId };
  }

  // Anything else → treat as an edit request
  // Apply the edit to the caption and re-queue for another approval round
  const editedCaption = replyTrimmed;
  updateLogEntry(clientId, postId, {
    status: 'edited',
    caption: editedCaption,
    editedAt: new Date().toISOString(),
    editedContent: editedCaption,
    originalCaption: entry.caption,
  });
  console.log(`[Publisher] Post ${postId} edited via SMS reply`);

  // Re-queue with edited content
  updateLogEntry(clientId, postId, { status: 'queued' });

  return {
    success: true,
    action: 'edited_and_requeued',
    postId,
    editedCaption,
  };
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

/**
 * Process a generated post through the appropriate flow.
 *
 * @param {string} clientId
 * @param {object} post          - Post object from generatePost()
 * @param {object} options
 * @param {boolean} options.autoPublish - If true and imageUrl provided, publish immediately
 * @param {string}  options.imageUrl    - Image URL (required for autoPublish)
 * @param {string}  options.phone       - Breeder phone for approval SMS
 * @param {string}  options.contactId   - GHL contact ID for SMS
 * @param {object}  options.clientConfig - Full client config
 * @returns {Promise<object>} Result describing what happened
 */
async function processPost(clientId, post, options = {}) {
  const { autoPublish, imageUrl, phone, contactId, clientConfig } = options;

  // Queue the post first (always)
  const entry = queuePost(clientId, post);

  // Auto-publish path
  if (autoPublish && imageUrl) {
    try {
      const published = await publishPost(clientId, post, imageUrl, clientConfig);
      return { success: true, action: 'published', entry: published };
    } catch (err) {
      console.error(`[Publisher] Auto-publish failed for ${post.id}: ${err.message}`);
      return { success: false, action: 'publish_failed', entry, error: err.message };
    }
  }

  // Approval SMS path
  if (phone) {
    await sendApprovalSMS(clientId, post, phone, contactId || null);
    return { success: true, action: 'queued_pending_approval', entry };
  }

  // Plain queue (no SMS, no auto-publish)
  return { success: true, action: 'queued', entry };
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  queuePost,
  publishPost,
  sendApprovalSMS,
  handleApprovalReply,
  getLog,
  processPost,
};
