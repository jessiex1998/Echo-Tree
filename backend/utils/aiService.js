import OpenAI from 'openai';

// Initialize OpenAI client only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-key') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log('✅ OpenAI client initialized');
} else {
  console.warn('⚠️  OpenAI API key not configured. AI features will use fallback responses.');
}

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

  // Build conversation history with system message
  const messages = [
    {
      role: 'system',
      content: systemPrompt,
    },
  ];

  // Add conversation history
  history.forEach((msg) => {
    messages.push({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content,
    });
  });

  // Add current message
  messages.push({
    role: 'user',
    content: buildUserMessage(currentMessage, mood, energy, feelingLabels),
  });

  // If OpenAI is not configured, return a fallback response
  if (!openai) {
    return getFallbackResponse(currentMessage, mood, energy);
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // You can also use 'gpt-4o', 'gpt-4-turbo', or 'gpt-3.5-turbo'
      max_tokens: 500,
      temperature: 0.7,
      messages: messages,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('AI Service Error:', error);
    // Return fallback on error
    return getFallbackResponse(currentMessage, mood, energy);
  }
}

/**
 * Get fallback response when OpenAI is not available
 */
function getFallbackResponse(message, mood, energy) {
  const responses = [
    "Thank you for sharing that with me. I'm here to listen. How are you feeling right now?",
    "I hear you. It takes courage to express what you're going through. Would you like to tell me more?",
    "I appreciate you opening up. What's on your mind today?",
    "Thank you for trusting me with your thoughts. How can I support you right now?",
  ];

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];

  if (mood && mood <= 2) {
    return "I notice you're feeling quite low right now. I'm here with you. Would you like to share what's weighing on you?";
  }

  return randomResponse;
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

