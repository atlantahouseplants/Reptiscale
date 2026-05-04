/**
 * Lead Scoring Agent
 *
 * Scores contacts 1-10 based on engagement signals, source quality,
 * and profile completeness. Uses rule-based scoring with optional
 * Claude AI enhancement for conversation analysis.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const SYSTEM_PROMPT = fs.readFileSync(
  path.join(__dirname, 'prompts', 'system.md'),
  'utf8'
);

// ─── Rule-Based Scoring ──────────────────────────────────────────────────────

function ruleBasedScore(contact) {
  let score = 0;
  const reasons = [];

  // Contact completeness
  const hasEmail = !!contact.email;
  const hasPhone = !!contact.phone;
  if (hasEmail && hasPhone) {
    score += 2;
    reasons.push('Has both email and phone');
  } else if (hasEmail || hasPhone) {
    score += 1;
    reasons.push(`Has ${hasEmail ? 'email' : 'phone'} only`);
  }

  // Species interest
  const speciesInterest = _getCustomFieldValue(contact, 'species_interest') ||
    _getCustomFieldValue(contact, 'Species Interest');
  if (speciesInterest) {
    score += 1;
    reasons.push(`Species interest: ${speciesInterest}`);
  }

  // Price tier
  const priceTier = _getCustomFieldValue(contact, 'price_tier') ||
    _getCustomFieldValue(contact, 'Price Tier') || '';
  if (priceTier.includes('Premium') || priceTier.includes('Designer')) {
    score += 2;
    reasons.push(`High-value price tier: ${priceTier}`);
  } else if (priceTier.includes('Mid-Range')) {
    score += 1;
    reasons.push(`Mid-range price tier`);
  }

  // Source quality
  const tags = contact.tags || [];
  const isShowLead = tags.some(t => t.startsWith('show:') || t === 'source:show-qr');
  const isWebsite = tags.includes('source:website') || tags.includes('source:referral');

  if (isShowLead) {
    score += 2;
    reasons.push('Met at a show (high-quality lead)');
  } else if (isWebsite) {
    score += 1;
    reasons.push('Came from website or referral');
  }

  // Multiple shows
  const showTags = tags.filter(t => t.startsWith('show:'));
  if (showTags.length >= 2) {
    score += 2;
    reasons.push(`Visited ${showTags.length} shows`);
  } else if (showTags.length === 1) {
    score += 1;
  }

  // Recency
  const createdAt = contact.dateAdded || contact.createdAt || contact.created_at;
  if (createdAt) {
    const daysSinceCreated = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated <= 7) {
      score += 1;
      reasons.push('New lead (within 7 days)');
    }
  }

  // Cap at 10
  score = Math.min(score, 10);

  // Determine intent from score
  let intent = 'browsing';
  if (score >= 8) intent = 'ready_to_buy';
  else if (score >= 6) intent = 'serious';
  else if (score >= 4) intent = 'interested';

  // Next best action
  let nextBestAction = 'Send educational content to build trust';
  if (intent === 'ready_to_buy') {
    nextBestAction = 'Send payment link or schedule a call';
  } else if (intent === 'serious') {
    nextBestAction = 'Send detailed photos and pricing for animals matching their interest';
  } else if (intent === 'interested') {
    nextBestAction = 'Send care guide for their species of interest';
  }

  return {
    score,
    intent,
    reasoning: reasons.join('. '),
    nextBestAction,
    method: 'rule_based',
  };
}

function _getCustomFieldValue(contact, nameOrKey) {
  const fields = contact.customFields || contact.customField || [];
  if (Array.isArray(fields)) {
    const match = fields.find(f =>
      f.name === nameOrKey ||
      f.fieldKey === `contact.${nameOrKey}` ||
      f.id === nameOrKey
    );
    return match?.value || null;
  }
  return null;
}

// ─── Claude-Enhanced Scoring ─────────────────────────────────────────────────

async function claudeEnhancedScore(contact, conversationHistory) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey });

    const contactSummary = {
      name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
      email: contact.email || null,
      phone: contact.phone || null,
      tags: contact.tags || [],
      source: (contact.tags || []).find(t => t.startsWith('source:')) || 'unknown',
      speciesInterest: _getCustomFieldValue(contact, 'species_interest'),
      priceTier: _getCustomFieldValue(contact, 'price_tier'),
      createdAt: contact.dateAdded || contact.createdAt,
      lastMessageAt: contact.lastMessageDate || null,
    };

    const userMessage = `Score this contact and determine their buyer intent.

Contact Data:
${JSON.stringify(contactSummary, null, 2)}

${conversationHistory ? `Recent Messages:\n${conversationHistory}` : 'No conversation history available.'}

Return ONLY a JSON object with: score (1-10), intent (browsing/interested/serious/ready_to_buy), reasoning (1-2 sentences), nextBestAction (1 sentence).`;

    const response = await client.messages.create({
      model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const text = response.content[0].text.trim();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: Math.min(Math.max(Math.round(parsed.score), 1), 10),
        intent: parsed.intent || 'browsing',
        reasoning: parsed.reasoning || '',
        nextBestAction: parsed.nextBestAction || '',
        method: 'ai_enhanced',
      };
    }
  } catch (err) {
    console.warn(`[lead-scoring] Claude scoring failed, falling back to rules:`, err.message);
  }

  return null;
}

// ─── Main Scoring Function ───────────────────────────────────────────────────

/**
 * Score a contact and update their lead_score in GHL.
 *
 * @param {string} contactId - GHL contact ID
 * @param {object} breederCtx - Breeder context from multi-tenant.js
 * @returns {{ score, intent, reasoning, nextBestAction, method }}
 */
async function scoreContact(contactId, breederCtx) {
  const ghlClient = require('../../ghl/client');

  // Fetch contact data
  const contactData = await ghlClient.get(`/contacts/${contactId}`);
  const contact = contactData.contact || contactData;

  // Try Claude-enhanced scoring first
  const aiResult = await claudeEnhancedScore(contact, null);

  // Fall back to rule-based
  const result = aiResult || ruleBasedScore(contact);

  // Update the lead_score custom field in GHL
  const fieldId = breederCtx?.ghlConfig?.customFields?.lead_score?.id;
  if (fieldId) {
    try {
      const { updateContact } = require('../../ghl/contacts');
      await updateContact(contactId, {
        customFields: [{ id: fieldId, value: String(result.score) }],
      });
    } catch (err) {
      console.warn(`[lead-scoring] Failed to update GHL field for ${contactId}:`, err.message);
    }
  }

  return result;
}

module.exports = {
  scoreContact,
  ruleBasedScore,
};
