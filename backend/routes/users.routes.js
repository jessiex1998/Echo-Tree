import express from 'express';
import {
  createUser,
  getUserById,
  updateUserProfile,
  deleteUser,
  changeUserRole,
} from '../services/userService.js';
import { getAllUserSessions, deleteSession } from '../services/authService.js';
import {
  createOrIncrementPenalty,
  getPenaltyByUserId,
  resetPenalty,
} from '../services/penaltyService.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/', async (req, res, next) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Username and password are required' },
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: { message: 'Password must be at least 6 characters' },
      });
    }

    const user = await createUser(username, password, email);

    // Generate token for immediate login
    const jwt = (await import('jsonwebtoken')).default;
    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          user_id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get user profile
router.get('/:userId', authenticateToken, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id.toString();

    // Users can only view their own profile unless admin
    if (userId !== currentUserId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' },
      });
    }

    const user = await getUserById(userId);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.patch('/:userId', authenticateToken, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id.toString();

    // Users can only update their own profile unless admin
    if (userId !== currentUserId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' },
      });
    }

    const user = await updateUserProfile(userId, req.body);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// Delete user account
router.delete('/:userId', authenticateToken, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id.toString();

    // Users can only delete their own account unless admin
    if (userId !== currentUserId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' },
      });
    }

    await deleteUser(userId);
    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Get all user sessions
router.get('/:userId/sessions', authenticateToken, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id.toString();

    if (userId !== currentUserId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' },
      });
    }

    const { limit = 20, offset = 0 } = req.query;
    const result = await getAllUserSessions(userId, {}, { limit, offset });

    res.json({
      success: true,
      data: result.sessions,
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

// Delete specific session
router.delete('/:userId/sessions/:sessionId', authenticateToken, async (req, res, next) => {
  try {
    const { userId, sessionId } = req.params;
    const currentUserId = req.user._id.toString();

    if (userId !== currentUserId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' },
      });
    }

    await deleteSession(sessionId, userId);
    res.json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Create/increment penalty (system only)
router.post('/:userId/penalties', authenticateToken, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const penalty = await createOrIncrementPenalty(userId, req.body);

    res.status(201).json({
      success: true,
      data: penalty,
    });
  } catch (error) {
    next(error);
  }
});

// Get user's penalties
router.get('/:userId/penalties', authenticateToken, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id.toString();

    if (userId !== currentUserId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' },
      });
    }

    const penalty = await getPenaltyByUserId(userId);
    res.json({
      success: true,
      data: penalty,
    });
  } catch (error) {
    next(error);
  }
});

// Reset penalty
router.patch('/:userId/penalties', authenticateToken, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const penalty = await resetPenalty(userId);

    res.json({
      success: true,
      data: penalty,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

