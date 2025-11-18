import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate Tree's response to user message
 * @param {Object} conversationContext - Conversation context
 * @param {Array} conversationContext.history - Previous messages (last 10)
 * @param {Object} conversationContext.currentMessage - Current user message
 * @param {Number} conversationContext.mood - Mood score (1-5)
 * @param {Number} conversationContext.energy - Energy score (1-5)
 * @param {Array} conversationContext.feelingLabels - Feeling labels
 * @returns {Promise<String>} Tree's response
 */
export async function generateTreeResponse(conversationContext) {
  const { history, currentMessage, mood, energy, feelingLabels } = conversationContext;

  const systemPrompt = `You are the Echo Tree, a wise and gentle AI companion.

Your role:
- Listen without judgment
- Provide calm, empathetic reflections
- Never diagnose or provide medical advice
- Never handle emergencies
- Ask gentle questions to help users explore their feelings
- Validate their emotions
- Offer supportive perspectives

Style:
- Use warm, gentle language
- Keep responses concise (2-3 paragraphs)
- Acknowledge their mood and energy levels
- Reference feeling labels they've shared
- End with an open-ended question or gentle prompt

Important:
- DO NOT provide crisis intervention
- DO NOT diagnose mental health conditions
- DO say "I notice you're feeling..." not "You have..."
- If user mentions self-harm, respond with empathy and provide crisis resources`;

  // Build conversation history
  const messages = history.map((msg) => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }));

  // Add current message
  messages.push({
    role: 'user',
    content: buildUserMessage(currentMessage, mood, energy, feelingLabels),
  });

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      system: systemPrompt,
      messages: messages,
    });

    return response.content[0].text;
  } catch (error) {
    console.error('AI Service Error:', error);
    throw new Error('Failed to generate Tree response');
  }
}

/**
 * Build user message with context
 */
function buildUserMessage(message, mood, energy, feelingLabels) {
  let context = message;

  if (mood || energy || feelingLabels?.length > 0) {
    const contextParts = [];
    if (mood) contextParts.push(`Mood: ${mood}/5`);
    if (energy) contextParts.push(`Energy: ${energy}/5`);
    if (feelingLabels?.length > 0) {
      contextParts.push(`Feelings: ${feelingLabels.join(', ')}`);
    }
    context = `${message}\n\n[Context: ${contextParts.join(', ')}]`;
  }

  return context;
}

/**
 * Detect crisis indicators in message
 * @param {String} messageText - Message to analyze
 * @returns {Promise<Object>} { is_crisis: boolean, confidence: number }
 */
export async function detectCrisis(messageText) {
  const crisisKeywords = [
    'suicide',
    'kill myself',
    'end my life',
    'want to die',
    'self-harm',
    'cutting',
    'overdose',
  ];

  const lowerText = messageText.toLowerCase();
  const hasKeywords = crisisKeywords.some((keyword) => lowerText.includes(keyword));

  if (hasKeywords) {
    return {
      is_crisis: true,
      confidence: 0.8,
    };
  }

  // Could enhance with AI detection in the future
  return {
    is_crisis: false,
    confidence: 0.1,
  };
}

/**
 * Moderate content for harmful or inappropriate content
 * @param {String} text - Content to moderate
 * @param {String} contentType - Type: 'message', 'note', 'reply'
 * @returns {Promise<Object>} { is_harmful: boolean, reason: string }
 */
export async function moderateContent(text, contentType = 'message') {
  const harmfulKeywords = [
    'hate',
    'kill you',
    'violence',
    'abuse',
    'threat',
  ];

  const lowerText = text.toLowerCase();
  const hasHarmful = harmfulKeywords.some((keyword) => lowerText.includes(keyword));

  if (hasHarmful) {
    return {
      is_harmful: true,
      reason: 'Contains potentially harmful content',
    };
  }

  return {
    is_harmful: false,
    reason: null,
  };
}

/**
 * Anonymize note by removing personal identifiers
 * @param {String} originalText - Original text
 * @param {Array} messageIds - Related message IDs
 * @returns {Promise<Object>} { rewritten_text, identified_elements, privacy_score }
 */
export async function anonymizeNote(originalText, messageIds = []) {
  // Simple anonymization - could be enhanced with AI
  let rewritten = originalText;

  // Remove common identifiers (basic implementation)
  rewritten = rewritten.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');
  rewritten = rewritten.replace(/\b\d{10}\b/g, '[PHONE]');
  rewritten = rewritten.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');

  return {
    rewritten_text: rewritten,
    identified_elements: [],
    privacy_score: 0.7,
  };
}

