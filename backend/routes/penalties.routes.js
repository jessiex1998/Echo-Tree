import express from 'express';
import {
  getAllPenalties,
  getPenaltyByUserId,
} from '../services/penaltyService.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all penalties (admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const {
      limit = 20,
      offset = 0,
      sort = 'updated_at',
      order = 'desc',
      alert_sent,
      healer_status_removed,
    } = req.query;

    const filters = {};
    if (alert_sent !== undefined) filters.alert_sent = alert_sent === 'true';
    if (healer_status_removed !== undefined) filters.healer_status_removed = healer_status_removed === 'true';

    const result = await getAllPenalties(
      filters,
      { limit, offset },
      { sort, order }
    );

    res.json({
      success: true,
      data: result.penalties,
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

// Get specific penalty (admin only)
router.get('/:penaltyId', authenticateToken, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const HealerPenalty = (await import('../models/healerPenalty.model.js')).default;
    const penalty = await HealerPenalty.findById(req.params.penaltyId)
      .populate('user_id', 'username role')
      .lean();

    if (!penalty) {
      return res.status(404).json({
        success: false,
        error: { message: 'Penalty not found' },
      });
    }

    res.json({
      success: true,
      data: penalty,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

