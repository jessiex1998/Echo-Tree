import express from 'express';
import FeelingLabel from '../models/feelingLabel.model.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all feeling labels (admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const {
      limit = 50,
      offset = 0,
      sort = 'created_at',
      order = 'desc',
    } = req.query;

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    const [labels, total] = await Promise.all([
      FeelingLabel.find({ deleted_at: null })
        .sort(sortObj)
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .lean(),
      FeelingLabel.countDocuments({ deleted_at: null }),
    ]);

    res.json({
      success: true,
      data: labels,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get specific feeling label
router.get('/:labelId', authenticateToken, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const label = await FeelingLabel.findOne({
      _id: req.params.labelId,
      deleted_at: null,
    }).lean();

    if (!label) {
      return res.status(404).json({
        success: false,
        error: { message: 'Feeling label not found' },
      });
    }

    res.json({
      success: true,
      data: label,
    });
  } catch (error) {
    next(error);
  }
});

// Delete feeling label
router.delete('/:labelId', authenticateToken, async (req, res, next) => {
  try {
    const { deleteFeelingLabel } = await import('../services/feelingLabelService.js');
    await deleteFeelingLabel(req.params.labelId, req.user._id);
    res.json({
      success: true,
      message: 'Feeling label deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;

