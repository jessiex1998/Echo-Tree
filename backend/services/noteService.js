import Note from '../models/note.model.js';
import Image from '../models/image.model.js';
import TopicTag from '../models/topicTag.model.js';
import Message from '../models/message.model.js';
import Chat from '../models/chat.model.js';
import { anonymizeNote } from '../utils/aiService.js';

/**
 * Create a note from chat messages
 * @param {String} userId - User ID
 * @param {String} chatId - Chat ID
 * @param {Array} messageIds - Message IDs to include
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Created note
 */
export async function createNoteFromChat(userId, chatId, messageIds, options = {}) {
  // Validate chat ownership
  const chat = await Chat.findOne({
    _id: chatId,
    user_id: userId,
    deleted_at: null,
  });

  if (!chat) {
    throw new Error('Chat not found or access denied');
  }

  // Get messages
  const messages = await Message.find({
    _id: { $in: messageIds },
    chat_id: chatId,
    deleted_at: null,
  });

  if (messages.length === 0) {
    throw new Error('No valid messages found');
  }

  // Combine message content
  const originalText = messages
    .filter((m) => m.sender === 'user')
    .map((m) => m.content)
    .join('\n\n');

  // Anonymize content
  const anonymized = await anonymizeNote(originalText, messageIds);

  // Create note
  const note = new Note({
    user_id: userId,
    content: originalText,
    anonymized_content: anonymized.rewritten_text,
    visibility: options.visibility || 'public',
    source_chat_id: chatId,
    source_message_ids: messageIds,
  });

  await note.save();

  // Add topic tags if provided
  if (options.tags && Array.isArray(options.tags)) {
    for (const tagText of options.tags) {
      if (tagText.trim()) {
        const tag = new TopicTag({
          note_id: note._id,
          tag_text: tagText.trim(),
        });
        await tag.save();
      }
    }
  }

  return note;
}

/**
 * Get notes with filtering, pagination, and sorting
 * @param {Object} filters - Filter options
 * @param {Object} pagination - Pagination options
 * @param {Object} sorting - Sorting options
 * @returns {Promise<Object>} { notes, total, limit, offset }
 */
export async function getNotes(filters = {}, pagination = {}, sorting = {}) {
  const {
    visibility = 'public',
    user_id,
    date_from,
    date_to,
    tags,
  } = filters;

  const {
    limit = 20,
    offset = 0,
  } = pagination;

  const {
    sort = 'posted_at',
    order = 'desc',
  } = sorting;

  // Build query
  const query = {
    deleted_at: null,
  };

  if (visibility) {
    query.visibility = visibility;
  }

  if (user_id) {
    query.user_id = user_id;
  }

  if (date_from || date_to) {
    query.posted_at = {};
    if (date_from) query.posted_at.$gte = new Date(date_from);
    if (date_to) query.posted_at.$lte = new Date(date_to);
  }

  // Tag filter
  if (tags && tags.length > 0) {
    const tagNotes = await TopicTag.find({
      tag_text: { $in: tags },
      deleted_at: null,
    }).distinct('note_id');
    query._id = { $in: tagNotes };
  }

  const sortOrder = order === 'desc' ? -1 : 1;
  const sortObj = { [sort]: sortOrder };

  const [notes, total] = await Promise.all([
    Note.find(query)
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean(),
    Note.countDocuments(query),
  ]);

  return {
    notes,
    total,
    limit: parseInt(limit),
    offset: parseInt(offset),
  };
}

/**
 * Get note by ID
 * @param {String} noteId - Note ID
 * @param {String} userId - Optional user ID for ownership check
 * @returns {Promise<Object>} Note object
 */
export async function getNoteById(noteId, userId = null) {
  const query = {
    _id: noteId,
    deleted_at: null,
  };

  // If user provided, check ownership for private notes
  if (userId) {
    const note = await Note.findOne(query).lean();
    if (note && note.visibility === 'private' && note.user_id?.toString() !== userId) {
      throw new Error('Access denied');
    }
    return note;
  }

  // Public notes only for unauthenticated users
  query.visibility = 'public';

  const note = await Note.findOne(query).lean();
  if (!note) {
    throw new Error('Note not found');
  }

  // Increment view count
  await Note.findByIdAndUpdate(noteId, { $inc: { view_count: 1 } });

  return note;
}

/**
 * Update note
 * @param {String} noteId - Note ID
 * @param {String} userId - User ID
 * @param {Object} updates - Update data
 * @returns {Promise<Object>} Updated note
 */
export async function updateNote(noteId, userId, updates) {
  const note = await Note.findOne({
    _id: noteId,
    user_id: userId,
    deleted_at: null,
  });

  if (!note) {
    throw new Error('Note not found or access denied');
  }

  if (updates.visibility !== undefined) {
    note.visibility = updates.visibility;
  }

  await note.save();
  return note;
}

/**
 * Delete note
 * @param {String} noteId - Note ID
 * @param {String} userId - User ID
 * @returns {Promise<Boolean>} Success
 */
export async function deleteNote(noteId, userId) {
  const note = await Note.findOne({
    _id: noteId,
    user_id: userId,
    deleted_at: null,
  });

  if (!note) {
    throw new Error('Note not found or access denied');
  }

  note.deleted_at = new Date();
  await note.save();

  return true;
}

/**
 * Add image to note
 * @param {String} noteId - Note ID
 * @param {String} userId - User ID
 * @param {Object} imageData - Image data
 * @returns {Promise<Object>} Created image
 */
export async function addImageToNote(noteId, userId, imageData) {
  const note = await Note.findOne({
    _id: noteId,
    user_id: userId,
    deleted_at: null,
  });

  if (!note) {
    throw new Error('Note not found or access denied');
  }

  const image = new Image({
    note_id: noteId,
    image_url: imageData.image_url,
    image_type: imageData.image_type || 'generated',
    generated_prompt: imageData.generated_prompt,
  });

  await image.save();
  return image;
}

/**
 * Get images for note
 * @param {String} noteId - Note ID
 * @returns {Promise<Array>} Images
 */
export async function getNoteImages(noteId) {
  const images = await Image.find({
    note_id: noteId,
    deleted_at: null,
  }).lean();

  return images;
}

/**
 * Add topic tag to note
 * @param {String} noteId - Note ID
 * @param {String} userId - User ID
 * @param {String} tagText - Tag text
 * @returns {Promise<Object>} Created tag
 */
export async function addTopicTag(noteId, userId, tagText) {
  const note = await Note.findOne({
    _id: noteId,
    user_id: userId,
    deleted_at: null,
  });

  if (!note) {
    throw new Error('Note not found or access denied');
  }

  const tag = new TopicTag({
    note_id: noteId,
    tag_text: tagText.trim(),
  });

  await tag.save();
  return tag;
}

/**
 * Get topic tags for note
 * @param {String} noteId - Note ID
 * @returns {Promise<Array>} Topic tags
 */
export async function getNoteTopicTags(noteId) {
  const tags = await TopicTag.find({
    note_id: noteId,
    deleted_at: null,
  }).lean();

  return tags;
}

