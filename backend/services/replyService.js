import Reply from '../models/reply.model.js';
import ReplyReaction from '../models/replyReaction.model.js';
import Note from '../models/note.model.js';
import User from '../models/user.model.js';
import { moderateContent } from '../utils/aiService.js';
import { createOrIncrementPenalty } from './penaltyService.js';

/**
 * Create a reply to a note
 * @param {String} noteId - Note ID
 * @param {String} healerId - Healer user ID
 * @param {String} content - Reply content
 * @returns {Promise<Object>} Created reply
 */
export async function createReply(noteId, healerId, content) {
  // Verify healer role
  const healer = await User.findById(healerId);
  if (!healer || healer.role !== 'healer') {
    throw new Error('Only healers can reply to notes');
  }

  // Verify note exists and is public
  const note = await Note.findOne({
    _id: noteId,
    visibility: 'public',
    deleted_at: null,
  });

  if (!note) {
    throw new Error('Note not found or not accessible');
  }

  // Validate content
  if (!content || content.trim().length === 0) {
    throw new Error('Reply content is required');
  }

  if (content.length > 2000) {
    throw new Error('Reply content exceeds maximum length');
  }

  // Moderate content
  const moderation = await moderateContent(content, 'reply');
  if (moderation.is_harmful) {
    // Increment penalty
    await createOrIncrementPenalty(healerId, {
      reason: moderation.reason,
      content: content,
    });

    throw new Error('Reply contains harmful content and cannot be posted');
  }

  // Create reply
  const reply = new Reply({
    note_id: noteId,
    healer_id: healerId,
    content: content.trim(),
    is_harmful: false,
  });

  await reply.save();

  // Update note reply count
  await Note.findByIdAndUpdate(noteId, { $inc: { reply_count: 1 } });

  return reply;
}

/**
 * Get replies for a note
 * @param {String} noteId - Note ID
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} { replies, total, limit, offset }
 */
export async function getRepliesByNoteId(noteId, pagination = {}) {
  const {
    limit = 20,
    offset = 0,
  } = pagination;

  const [replies, total] = await Promise.all([
    Reply.find({
      note_id: noteId,
      deleted_at: null,
      is_harmful: false,
    })
      .populate('healer_id', 'username role')
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean(),
    Reply.countDocuments({
      note_id: noteId,
      deleted_at: null,
      is_harmful: false,
    }),
  ]);

  return {
    replies,
    total,
    limit: parseInt(limit),
    offset: parseInt(offset),
  };
}

/**
 * Get reply by ID
 * @param {String} replyId - Reply ID
 * @returns {Promise<Object>} Reply object
 */
export async function getReplyById(replyId) {
  const reply = await Reply.findOne({
    _id: replyId,
    deleted_at: null,
  })
    .populate('healer_id', 'username role')
    .lean();

  if (!reply) {
    throw new Error('Reply not found');
  }

  return reply;
}

/**
 * Update reply (within 5-minute window)
 * @param {String} replyId - Reply ID
 * @param {String} healerId - Healer user ID
 * @param {String} content - New content
 * @returns {Promise<Object>} Updated reply
 */
export async function updateReply(replyId, healerId, content) {
  const reply = await Reply.findOne({
    _id: replyId,
    healer_id: healerId,
    deleted_at: null,
  });

  if (!reply) {
    throw new Error('Reply not found or access denied');
  }

  // Check 5-minute edit window
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  if (reply.created_at < fiveMinutesAgo) {
    throw new Error('Reply can only be edited within 5 minutes of creation');
  }

  // Moderate new content
  const moderation = await moderateContent(content, 'reply');
  if (moderation.is_harmful) {
    await createOrIncrementPenalty(healerId, {
      reason: moderation.reason,
      content: content,
    });
    throw new Error('Reply contains harmful content');
  }

  reply.content = content.trim();
  reply.edited_at = new Date();
  await reply.save();

  return reply;
}

/**
 * Delete reply
 * @param {String} replyId - Reply ID
 * @param {String} healerId - Healer user ID
 * @returns {Promise<Boolean>} Success
 */
export async function deleteReply(replyId, healerId) {
  const reply = await Reply.findOne({
    _id: replyId,
    healer_id: healerId,
    deleted_at: null,
  });

  if (!reply) {
    throw new Error('Reply not found or access denied');
  }

  reply.deleted_at = new Date();
  await reply.save();

  // Update note reply count
  await Note.findByIdAndUpdate(reply.note_id, { $inc: { reply_count: -1 } });

  return true;
}

/**
 * Add reaction to reply
 * @param {String} replyId - Reply ID
 * @param {String} userId - User ID
 * @param {String} reactionType - Reaction type
 * @returns {Promise<Object>} Created reaction
 */
export async function addReaction(replyId, userId, reactionType) {
  if (!['like', 'support', 'helpful'].includes(reactionType)) {
    throw new Error('Invalid reaction type');
  }

  // Check if reaction already exists
  const existing = await ReplyReaction.findOne({
    reply_id: replyId,
    user_id: userId,
  });

  if (existing) {
    // Update existing reaction
    existing.reaction_type = reactionType;
    await existing.save();
    return existing;
  }

  // Create new reaction
  const reaction = new ReplyReaction({
    reply_id: replyId,
    user_id: userId,
    reaction_type: reactionType,
  });

  await reaction.save();
  return reaction;
}

/**
 * Get reactions for reply
 * @param {String} replyId - Reply ID
 * @returns {Promise<Object>} Reaction counts
 */
export async function getReplyReactions(replyId) {
  const reactions = await ReplyReaction.find({
    reply_id: replyId,
  }).lean();

  const counts = {
    like: 0,
    support: 0,
    helpful: 0,
    total: reactions.length,
  };

  reactions.forEach((reaction) => {
    counts[reaction.reaction_type] += 1;
  });

  return counts;
}

