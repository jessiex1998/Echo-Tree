import Message from '../models/message.model.js';
import Chat from '../models/chat.model.js';
import { generateTreeResponse, detectCrisis, moderateContent } from '../utils/aiService.js';

/**
 * Create a user message
 * @param {String} chatId - Chat ID
 * @param {String} userId - User ID
 * @param {Object} messageData - Message data
 * @returns {Promise<Object>} Created message
 */
export async function createMessage(chatId, userId, messageData) {
  // Validate chat ownership (userId can be null for visitors)
  const chatQuery = {
    _id: chatId,
    deleted_at: null,
  };
  
  if (userId) {
    chatQuery.user_id = userId;
  }

  const chat = await Chat.findOne(chatQuery);

  if (!chat) {
    throw new Error('Chat not found or access denied');
  }

  if (chat.closed_at) {
    throw new Error('Cannot add message to closed chat');
  }

  // Validate content
  if (!messageData.content || messageData.content.trim().length === 0) {
    throw new Error('Message content is required');
  }

  if (messageData.content.length > 5000) {
    throw new Error('Message content exceeds maximum length');
  }

  // Check for crisis indicators
  const crisisCheck = await detectCrisis(messageData.content);
  if (crisisCheck.is_crisis) {
    // Still create message but flag it
    messageData.flagged_for_crisis = true;
  }

  // Create user message
  const message = new Message({
    chat_id: chatId,
    sender: 'user',
    content: messageData.content.trim(),
    mood: messageData.mood,
    energy: messageData.energy,
    flagged_for_crisis: messageData.flagged_for_crisis || false,
  });

  await message.save();
  await chat.incrementMessageCount();

  return message;
}

/**
 * Generate Tree's response to a message
 * @param {String} chatId - Chat ID
 * @param {Object} messageData - User message data
 * @returns {Promise<Object>} Tree's message
 */
export async function generateTreeResponseMessage(chatId, messageData) {
  // Get conversation history (last 10 messages)
  const messages = await Message.find({
    chat_id: chatId,
    deleted_at: null,
  })
    .sort({ created_at: -1 })
    .limit(10)
    .lean();

  // Reverse to get chronological order
  messages.reverse();

  // Get current message (last user message)
  const currentMessage = messages[messages.length - 1] || {
    content: messageData.content,
    mood: messageData.mood,
    energy: messageData.energy,
  };

  // Get feeling labels for current message
  const FeelingLabel = (await import('../models/feelingLabel.model.js')).default;
  const feelingLabels = await FeelingLabel.find({
    message_id: currentMessage._id || currentMessage.message_id,
    deleted_at: null,
  }).lean();

  // Generate Tree response
  const treeResponseContent = await generateTreeResponse({
    history: messages.filter((m) => m.sender === 'user' || m.sender === 'tree'),
    currentMessage: currentMessage.content,
    mood: currentMessage.mood || messageData.mood,
    energy: currentMessage.energy || messageData.energy,
    feelingLabels: feelingLabels.map((fl) => fl.label_text),
  });

  // Create Tree message
  const treeMessage = new Message({
    chat_id: chatId,
    sender: 'tree',
    content: treeResponseContent,
  });

  await treeMessage.save();

  // Update chat message count
  const chat = await Chat.findById(chatId);
  await chat.incrementMessageCount();

  return treeMessage;
}

/**
 * Get messages by chat ID
 * @param {String} chatId - Chat ID
 * @param {String} userId - User ID
 * @param {Object} pagination - Pagination options
 * @param {Object} sorting - Sorting options
 * @returns {Promise<Object>} { messages, total, limit, offset }
 */
export async function getMessagesByChatId(chatId, userId, pagination = {}, sorting = {}) {
  // Validate chat ownership
  const chat = await Chat.findOne({
    _id: chatId,
    user_id: userId,
    deleted_at: null,
  });

  if (!chat) {
    throw new Error('Chat not found or access denied');
  }

  const {
    limit = 50,
    offset = 0,
  } = pagination;

  const {
    sort = 'created_at',
    order = 'asc',
  } = sorting;

  const sortOrder = order === 'desc' ? -1 : 1;
  const sortObj = { [sort]: sortOrder };

  const [messages, total] = await Promise.all([
    Message.find({
      chat_id: chatId,
      deleted_at: null,
    })
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean(),
    Message.countDocuments({
      chat_id: chatId,
      deleted_at: null,
    }),
  ]);

  return {
    messages,
    total,
    limit: parseInt(limit),
    offset: parseInt(offset),
  };
}

/**
 * Update message
 * @param {String} messageId - Message ID
 * @param {String} userId - User ID
 * @param {Object} updates - Update data
 * @returns {Promise<Object>} Updated message
 */
export async function updateMessage(messageId, userId, updates) {
  // Get message and validate ownership through chat
  const message = await Message.findOne({
    _id: messageId,
    deleted_at: null,
  });

  if (!message) {
    throw new Error('Message not found');
  }

  // Check chat ownership
  const chat = await Chat.findOne({
    _id: message.chat_id,
    user_id: userId,
    deleted_at: null,
  });

  if (!chat) {
    throw new Error('Access denied');
  }

  // Only allow updating mood, energy, and crisis flag
  const allowedFields = ['mood', 'energy', 'flagged_for_crisis'];
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      message[field] = updates[field];
    }
  });

  await message.save();
  return message;
}

/**
 * Soft delete message
 * @param {String} messageId - Message ID
 * @param {String} userId - User ID
 * @returns {Promise<Boolean>} Success
 */
export async function deleteMessage(messageId, userId) {
  const message = await Message.findOne({
    _id: messageId,
    deleted_at: null,
  });

  if (!message) {
    throw new Error('Message not found');
  }

  // Check chat ownership
  const chat = await Chat.findOne({
    _id: message.chat_id,
    user_id: userId,
    deleted_at: null,
  });

  if (!chat) {
    throw new Error('Access denied');
  }

  message.deleted_at = new Date();
  await message.save();

  return true;
}

/**
 * Get message by ID
 * @param {String} messageId - Message ID
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Message object
 */
export async function getMessageById(messageId, userId) {
  const message = await Message.findOne({
    _id: messageId,
    deleted_at: null,
  }).lean();

  if (!message) {
    throw new Error('Message not found');
  }

  // Check chat ownership
  const chat = await Chat.findOne({
    _id: message.chat_id,
    user_id: userId,
    deleted_at: null,
  });

  if (!chat) {
    throw new Error('Access denied');
  }

  return message;
}

