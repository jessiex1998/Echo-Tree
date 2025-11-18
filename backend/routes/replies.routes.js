import express from 'express';
import {
  createReply,
  getRepliesByNoteId,
  getReplyById,
  updateReply,
  deleteReply,
  addReaction,
  getReplyReactions,
} from '../services/replyService.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Create reply (healers only)
router.post('/', authenticateToken, authorizeRoles('healer'), async (req, res, next) => {
  try {
    const { note_id, content } = req.body;

    if (!note_id || !content) {
      return res.status(400).json({
        success: false,
        error: { message: 'note_id and content are required' },
      });
    }

    const reply = await createReply(note_id, req.user._id, content);
    res.status(201).json({
      success: true,
      data: reply,
    });
  } catch (error) {
    next(error);
  }
});

// Get replies for note
router.get('/', async (req, res, next) => {
  try {
    const { note_id, limit = 20, offset = 0 } = req.query;

    if (!note_id) {
      return res.status(400).json({
        success: false,
        error: { message: 'note_id is required' },
      });
    }

    const result = await getRepliesByNoteId(note_id, { limit, offset });
    res.json({
      success: true,
      data: result.replies,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get specific reply
router.get('/:replyId', async (req, res, next) => {
  try {
    const reply = await getReplyById(req.params.replyId);
    res.json({
      success: true,
      data: reply,
    });
  } catch (error) {
    next(error);
  }
});

// Update reply (5-minute window)
router.patch('/:replyId', authenticateToken, authorizeRoles('healer'), async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({
        success: false,
        error: { message: 'content is required' },
      });
    }

    const reply = await updateReply(req.params.replyId, req.user._id, content);
    res.json({
      success: true,
      data: reply,
    });
  } catch (error) {
    next(error);
  }
});

// Delete reply
router.delete('/:replyId', authenticateToken, authorizeRoles('healer'), async (req, res, next) => {
  try {
    await deleteReply(req.params.replyId, req.user._id);
    res.json({
      success: true,
      message: 'Reply deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Add reaction to reply
router.post('/:replyId/reactions', authenticateToken, async (req, res, next) => {
  try {
    const { reaction_type } = req.body;
    if (!reaction_type) {
      return res.status(400).json({
        success: false,
        error: { message: 'reaction_type is required' },
      });
    }

    const reaction = await addReaction(req.params.replyId, req.user._id, reaction_type);
    res.status(201).json({
      success: true,
      data: reaction,
    });
  } catch (error) {
    next(error);
  }
});

// Get reactions for reply
router.get('/:replyId/reactions', async (req, res, next) => {
  try {
    const reactions = await getReplyReactions(req.params.replyId);
    res.json({
      success: true,
      data: reactions,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

