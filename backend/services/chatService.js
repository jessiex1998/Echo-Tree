import Chat from '../models/chat.model.js';
import Message from '../models/message.model.js';

/**
 * Create a new chat
 * @param {String|null} userId - User ID (null for visitors)
 * @param {Object} initialMessage - Optional initial message data
 * @returns {Promise<Object>} Created chat
 */
export async function createChat(userId, initialMessage = null) {
  const chat = new Chat({
    user_id: userId || undefined,
    start_time: new Date(),
  });

  await chat.save();

  // If initial message provided, create it
  if (initialMessage) {
    const message = new Message({
      chat_id: chat._id,
      sender: 'user',
      content: initialMessage.content,
      mood: initialMessage.mood,
      energy: initialMessage.energy,
    });
    await message.save();
    await chat.incrementMessageCount();
  }

  return chat;
}

/**
 * Get user's chats with filtering, pagination, and sorting
 * @param {String} userId - User ID
 * @param {Object} filters - Filter options
 * @param {Object} pagination - Pagination options
 * @param {Object} sorting - Sorting options
 * @returns {Promise<Object>} { chats, total, limit, offset }
 */
export async function getUserChats(userId, filters = {}, pagination = {}, sorting = {}) {
  const {
    status, // 'open' or 'closed'
    date_from,
    date_to,
  } = filters;

  const {
    limit = 20,
    offset = 0,
  } = pagination;

  const {
    sort = 'start_time',
    order = 'desc',
  } = sorting;

  // Build query
  const query = {
    user_id: userId,
    deleted_at: null,
  };

  // Status filter
  if (status === 'open') {
    query.closed_at = null;
  } else if (status === 'closed') {
    query.closed_at = { $ne: null };
  }

  // Date range filter
  if (date_from || date_to) {
    query.start_time = {};
    if (date_from) {
      query.start_time.$gte = new Date(date_from);
    }
    if (date_to) {
      query.start_time.$lte = new Date(date_to);
    }
  }

  // Build sort
  const sortOrder = order === 'desc' ? -1 : 1;
  const sortObj = { [sort]: sortOrder };

  // Execute query
  const [chats, total] = await Promise.all([
    Chat.find(query)
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean(),
    Chat.countDocuments(query),
  ]);

  return {
    chats,
    total,
    limit: parseInt(limit),
    offset: parseInt(offset),
  };
}

/**
 * Get chat by ID and validate ownership
 * @param {String} chatId - Chat ID
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Chat object
 */
export async function getChatById(chatId, userId) {
  const chat = await Chat.findOne({
    _id: chatId,
    user_id: userId,
    deleted_at: null,
  }).lean();

  if (!chat) {
    throw new Error('Chat not found');
  }

  return chat;
}

/**
 * Update chat
 * @param {String} chatId - Chat ID
 * @param {String} userId - User ID
 * @param {Object} updates - Update data
 * @returns {Promise<Object>} Updated chat
 */
export async function updateChat(chatId, userId, updates) {
  const chat = await Chat.findOne({
    _id: chatId,
    user_id: userId,
    deleted_at: null,
  });

  if (!chat) {
    throw new Error('Chat not found');
  }

  // Handle closing chat
  if (updates.closed === true && !chat.closed_at) {
    await chat.closeChat();
  }

  // Update other fields
  Object.keys(updates).forEach((key) => {
    if (key !== 'closed' && chat.schema.paths[key]) {
      chat[key] = updates[key];
    }
  });

  await chat.save();
  return chat;
}

/**
 * Soft delete chat
 * @param {String} chatId - Chat ID
 * @param {String} userId - User ID
 * @returns {Promise<Boolean>} Success
 */
export async function deleteChat(chatId, userId) {
  const chat = await Chat.findOne({
    _id: chatId,
    user_id: userId,
    deleted_at: null,
  });

  if (!chat) {
    throw new Error('Chat not found');
  }

  chat.deleted_at = new Date();
  await chat.save();

  return true;
}

