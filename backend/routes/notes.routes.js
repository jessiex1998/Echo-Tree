import express from 'express';
import {
  createNoteFromChat,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  addImageToNote,
  getNoteImages,
  addTopicTag,
  getNoteTopicTags,
} from '../services/noteService.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Create note from chat
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { chat_id, message_ids, visibility, tags } = req.body;

    if (!chat_id || !message_ids || !Array.isArray(message_ids)) {
      return res.status(400).json({
        success: false,
        error: { message: 'chat_id and message_ids are required' },
      });
    }

    const note = await createNoteFromChat(
      req.user._id,
      chat_id,
      message_ids,
      { visibility, tags }
    );

    res.status(201).json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
});

// Get notes (public for all, private for authenticated users)
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      limit = 20,
      offset = 0,
      sort = 'posted_at',
      order = 'desc',
      visibility = 'public',
      user_id,
      date_from,
      date_to,
      tags,
    } = req.query;

    // Visitors can only see first page
    if (!req.user && parseInt(offset) > 0) {
      return res.status(403).json({
        success: false,
        error: { message: 'Please register to see more notes' },
      });
    }

    const result = await getNotes(
      { visibility, user_id, date_from, date_to, tags: tags ? tags.split(',') : [] },
      { limit, offset },
      { sort, order }
    );

    res.json({
      success: true,
      data: result.notes,
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

// Get specific note
router.get('/:noteId', optionalAuth, async (req, res, next) => {
  try {
    const note = await getNoteById(req.params.noteId, req.user?._id);
    res.json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
});

// Update note
router.patch('/:noteId', authenticateToken, async (req, res, next) => {
  try {
    const note = await updateNote(req.params.noteId, req.user._id, req.body);
    res.json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
});

// Delete note
router.delete('/:noteId', authenticateToken, async (req, res, next) => {
  try {
    await deleteNote(req.params.noteId, req.user._id);
    res.json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Add image to note
router.post('/:noteId/images', authenticateToken, async (req, res, next) => {
  try {
    const { image_url, image_type, generated_prompt } = req.body;
    const image = await addImageToNote(req.params.noteId, req.user._id, {
      image_url,
      image_type,
      generated_prompt,
    });
    res.status(201).json({
      success: true,
      data: image,
    });
  } catch (error) {
    next(error);
  }
});

// Get images for note
router.get('/:noteId/images', async (req, res, next) => {
  try {
    const images = await getNoteImages(req.params.noteId);
    res.json({
      success: true,
      data: images,
    });
  } catch (error) {
    next(error);
  }
});

// Add topic tag to note
router.post('/:noteId/topics', authenticateToken, async (req, res, next) => {
  try {
    const { tag_text } = req.body;
    if (!tag_text) {
      return res.status(400).json({
        success: false,
        error: { message: 'tag_text is required' },
      });
    }
    const tag = await addTopicTag(req.params.noteId, req.user._id, tag_text);
    res.status(201).json({
      success: true,
      data: tag,
    });
  } catch (error) {
    next(error);
  }
});

// Get topic tags for note
router.get('/:noteId/topics', async (req, res, next) => {
  try {
    const tags = await getNoteTopicTags(req.params.noteId);
    res.json({
      success: true,
      data: tags,
    });
  } catch (error) {
    next(error);
  }
});

// Get replies for note
router.get('/:noteId/replies', async (req, res, next) => {
  try {
    const { getRepliesByNoteId } = await import('../services/replyService.js');
    const { limit = 20, offset = 0 } = req.query;
    const result = await getRepliesByNoteId(req.params.noteId, { limit, offset });
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

export default router;

