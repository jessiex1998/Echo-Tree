import Chat from '../models/chat.model.js';
import Message from '../models/message.model.js';

/**
 * Check chat ownership
 */
export const checkChatOwnership = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      user_id: userId,
      deleted_at: null,
    });

    if (!chat) {
      return res.status(403).json({
        success: false,
        error: { message: 'Chat not found or access denied' },
      });
    }

    req.chat = chat;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { message: 'Server error' },
    });
  }
};

/**
 * Check message ownership through chat
 */
export const checkMessageOwnership = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const message = await Message.findOne({
      _id: messageId,
      deleted_at: null,
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        error: { message: 'Message not found' },
      });
    }

    const chat = await Chat.findOne({
      _id: message.chat_id,
      user_id: userId,
      deleted_at: null,
    });

    if (!chat) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' },
      });
    }

    req.message = message;
    req.chat = chat;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { message: 'Server error' },
    });
  }
};

