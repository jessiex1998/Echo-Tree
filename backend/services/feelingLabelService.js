import FeelingLabel from '../models/feelingLabel.model.js';
import Message from '../models/message.model.js';
import Chat from '../models/chat.model.js';

/**
 * Add feeling labels to a message
 * @param {String} messageId - Message ID
 * @param {String} userId - User ID
 * @param {Array<String>} labels - Array of label texts
 * @returns {Promise<Array<Object>>} Created feeling labels
 */
export async function addFeelingLabels(messageId, userId, labels) {
  // Validate message ownership through chat
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

  // Validate labels
  if (!Array.isArray(labels) || labels.length === 0) {
    throw new Error('Labels must be a non-empty array');
  }

  // Create feeling labels
  const createdLabels = [];
  for (const labelText of labels) {
    if (typeof labelText !== 'string' || labelText.trim().length === 0) {
      continue;
    }

    if (labelText.length > 50) {
      throw new Error('Label text exceeds maximum length');
    }

    const label = new FeelingLabel({
      message_id: messageId,
      label_text: labelText.trim(),
    });

    await label.save();
    createdLabels.push(label);
  }

  return createdLabels;
}

/**
 * Get feeling labels by message ID
 * @param {String} messageId - Message ID
 * @param {String} userId - User ID
 * @returns {Promise<Array<Object>>} Feeling labels
 */
export async function getFeelingLabelsByMessage(messageId, userId) {
  // Validate message ownership
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

  const labels = await FeelingLabel.find({
    message_id: messageId,
    deleted_at: null,
  }).lean();

  return labels;
}

/**
 * Delete feeling label
 * @param {String} labelId - Label ID
 * @param {String} userId - User ID
 * @returns {Promise<Boolean>} Success
 */
export async function deleteFeelingLabel(labelId, userId) {
  const label = await FeelingLabel.findOne({
    _id: labelId,
    deleted_at: null,
  });

  if (!label) {
    throw new Error('Feeling label not found');
  }

  // Check message ownership through chat
  const message = await Message.findOne({
    _id: label.message_id,
    deleted_at: null,
  });

  if (!message) {
    throw new Error('Message not found');
  }

  const chat = await Chat.findOne({
    _id: message.chat_id,
    user_id: userId,
    deleted_at: null,
  });

  if (!chat) {
    throw new Error('Access denied');
  }

  label.deleted_at = new Date();
  await label.save();

  return true;
}

