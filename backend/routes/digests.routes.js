import express from 'express';
import {
  generateDigest,
  getUserDigests,
  getMoodTrends,
  getEngagementMetrics,
} from '../services/analyticsService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Generate digest
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { period_type, period_start, period_end } = req.body;

    if (!period_type || !period_start || !period_end) {
      return res.status(400).json({
        success: false,
        error: { message: 'period_type, period_start, and period_end are required' },
      });
    }

    const digest = await generateDigest(
      req.user._id,
      period_type,
      new Date(period_start),
      new Date(period_end)
    );

    res.status(201).json({
      success: true,
      data: digest,
    });
  } catch (error) {
    next(error);
  }
});

// Get user digests
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const result = await getUserDigests(req.user._id, { limit, offset });

    res.json({
      success: true,
      data: result.digests,
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

// Get specific digest
router.get('/:digestId', authenticateToken, async (req, res, next) => {
  try {
    const Digest = (await import('../models/digest.model.js')).default;
    const digest = await Digest.findOne({
      _id: req.params.digestId,
      user_id: req.user._id,
      deleted_at: null,
    }).lean();

    if (!digest) {
      return res.status(404).json({
        success: false,
        error: { message: 'Digest not found' },
      });
    }

    res.json({
      success: true,
      data: digest,
    });
  } catch (error) {
    next(error);
  }
});

// Get mood trends
router.get('/:digestId/trends', authenticateToken, async (req, res, next) => {
  try {
    const Digest = (await import('../models/digest.model.js')).default;
    const digest = await Digest.findOne({
      _id: req.params.digestId,
      user_id: req.user._id,
      deleted_at: null,
    });

    if (!digest) {
      return res.status(404).json({
        success: false,
        error: { message: 'Digest not found' },
      });
    }

    const trends = await getMoodTrends(
      req.user._id,
      digest.period_start,
      digest.period_end
    );

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    next(error);
  }
});

// Get engagement metrics
router.get('/:digestId/metrics', authenticateToken, async (req, res, next) => {
  try {
    const Digest = (await import('../models/digest.model.js')).default;
    const digest = await Digest.findOne({
      _id: req.params.digestId,
      user_id: req.user._id,
      deleted_at: null,
    });

    if (!digest) {
      return res.status(404).json({
        success: false,
        error: { message: 'Digest not found' },
      });
    }

    const metrics = await getEngagementMetrics(req.user._id);
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
});

// Get user mood trends
router.get('/users/:userId/trends', authenticateToken, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { start_date, end_date } = req.query;

    if (userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' },
      });
    }

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: { message: 'start_date and end_date are required' },
      });
    }

    const trends = await getMoodTrends(
      userId,
      new Date(start_date),
      new Date(end_date)
    );

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    next(error);
  }
});

// Get user engagement metrics
router.get('/users/:userId/metrics', authenticateToken, async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' },
      });
    }

    const metrics = await getEngagementMetrics(userId);
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

