import express from 'express';
import {
  getMessageById,
  updateMessage,
  deleteMessage,
} from '../services/messageService.js';
import { authenticateToken } from '../middleware/auth.js';
import { checkMessageOwnership } from '../middleware/ownership.js';

const router = express.Router();

// Get specific message
router.get('/:messageId', authenticateToken, checkMessageOwnership, async (req, res, next) => {
  try {
    const message = await getMessageById(req.params.messageId, req.user._id);
    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
});

// Update message
router.patch('/:messageId', authenticateToken, checkMessageOwnership, async (req, res, next) => {
  try {
    // Only allow updating mood, energy, and flagged_for_crisis
    const allowedUpdates = {};
    if (req.body.mood !== undefined) allowedUpdates.mood = req.body.mood;
    if (req.body.energy !== undefined) allowedUpdates.energy = req.body.energy;
    if (req.body.flagged_for_crisis !== undefined) allowedUpdates.flagged_for_crisis = req.body.flagged_for_crisis;

    const message = await updateMessage(req.params.messageId, req.user._id, allowedUpdates);
    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
});

// Delete message
router.delete('/:messageId', authenticateToken, checkMessageOwnership, async (req, res, next) => {
  try {
    await deleteMessage(req.params.messageId, req.user._id);
    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;

