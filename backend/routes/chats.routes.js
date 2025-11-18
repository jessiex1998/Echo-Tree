import express from 'express';
import {
  createChat,
  getUserChats,
  getChatById,
  updateChat,
  deleteChat,
} from '../services/chatService.js';
import {
  createMessage,
  generateTreeResponseMessage,
  getMessagesByChatId,
} from '../services/messageService.js';
import {
  addFeelingLabels,
  getFeelingLabelsByMessage,
} from '../services/feelingLabelService.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { checkChatOwnership } from '../middleware/ownership.js';
import { visitorChatLimiter, visitorMessageLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Create new chat
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?._id;

    // Visitors: apply rate limiting
    if (!userId) {
      await new Promise((resolve, reject) => {
        visitorChatLimiter(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    const initialMessage = req.body.initial_message || null;
    const chat = await createChat(userId || null, initialMessage);

    res.status(201).json({
      success: true,
      data: chat,
    });
  } catch (error) {
    next(error);
  }
});

// Get all chats (with pagination, sorting, filtering)
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      limit = 20,
      offset = 0,
      sort = 'start_time',
      order = 'desc',
      status,
      date_from,
      date_to,
    } = req.query;

    const result = await getUserChats(
      userId,
      { status, date_from, date_to },
      { limit, offset },
      { sort, order }
    );

    res.json({
      success: true,
      data: result.chats,
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

// Get specific chat
router.get('/:chatId', authenticateToken, checkChatOwnership, async (req, res, next) => {
  try {
    const chat = await getChatById(req.params.chatId, req.user._id);
    res.json({
      success: true,
      data: chat,
    });
  } catch (error) {
    next(error);
  }
});

// Update chat
router.patch('/:chatId', authenticateToken, checkChatOwnership, async (req, res, next) => {
  try {
    const chat = await updateChat(req.params.chatId, req.user._id, req.body);
    res.json({
      success: true,
      data: chat,
    });
  } catch (error) {
    next(error);
  }
});

// Delete chat
router.delete('/:chatId', authenticateToken, checkChatOwnership, async (req, res, next) => {
  try {
    await deleteChat(req.params.chatId, req.user._id);
    res.json({
      success: true,
      message: 'Chat deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Send message to Tree
router.post('/:chatId/messages', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { chatId } = req.params;
    const { content, mood, energy, feeling_labels } = req.body;

    // Visitors: apply rate limiting
    if (!userId) {
      await new Promise((resolve, reject) => {
        visitorMessageLimiter(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Validate input
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Message content is required' },
      });
    }

    // Create user message
    const userMessage = await createMessage(chatId, userId, {
      content,
      mood,
      energy,
    });

    // Generate Tree response
    let treeMessage = null;
    try {
      treeMessage = await generateTreeResponseMessage(chatId, {
        content,
        mood,
        energy,
      });
    } catch (aiError) {
      console.error('AI response generation failed:', aiError);
      // Continue even if AI fails
    }

    // Add feeling labels if provided
    let feelingLabels = [];
    if (feeling_labels && Array.isArray(feeling_labels) && feeling_labels.length > 0 && userId) {
      try {
        feelingLabels = await addFeelingLabels(userMessage._id, userId, feeling_labels);
      } catch (labelError) {
        console.error('Failed to add feeling labels:', labelError);
      }
    }

    res.status(201).json({
      success: true,
      data: {
        user_message: userMessage,
        tree_message: treeMessage,
        feeling_labels: feelingLabels,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get all messages in chat
router.get('/:chatId/messages', authenticateToken, checkChatOwnership, async (req, res, next) => {
  try {
    const {
      limit = 50,
      offset = 0,
      sort = 'created_at',
      order = 'asc',
    } = req.query;

    const result = await getMessagesByChatId(
      req.params.chatId,
      req.user._id,
      { limit, offset },
      { sort, order }
    );

    res.json({
      success: true,
      data: result.messages,
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

// Add feeling labels to message
router.post('/:chatId/messages/:messageId/feelings', authenticateToken, checkChatOwnership, async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { labels } = req.body;

    if (!labels || !Array.isArray(labels)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Labels must be an array' },
      });
    }

    const feelingLabels = await addFeelingLabels(messageId, req.user._id, labels);

    res.status(201).json({
      success: true,
      data: feelingLabels,
    });
  } catch (error) {
    next(error);
  }
});

// Get feeling labels for message
router.get('/:chatId/messages/:messageId/feelings', authenticateToken, checkChatOwnership, async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const feelingLabels = await getFeelingLabelsByMessage(messageId, req.user._id);

    res.json({
      success: true,
      data: feelingLabels,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

