import express from 'express';
import { login, logout, validateSession } from '../services/authService.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Login
router.post('/sessions', loginLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Username and password are required' },
      });
    }

    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await login(username, password, ipAddress, userAgent);

    // Set token in cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      data: {
        token: result.token,
        user: result.user,
        session: {
          sessionId: result.session._id,
          createdAt: result.session.created_at,
          expiresAt: result.session.expires_at,
        },
      },
    });
  } catch (error) {
    // Handle specific error status codes (401, 423)
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        error: { message: error.message },
      });
    }
    next(error);
  }
});

// Logout
router.delete('/sessions/:sessionId', authenticateToken, async (req, res, next) => {
  try {
    // Verify session ownership
    await logout(req.params.sessionId, req.user._id);

    // Clear cookie
    res.clearCookie('token');

    res.status(204).send();
  } catch (error) {
    // Handle specific error status codes (404, 403)
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        error: { message: error.message },
      });
    }
    next(error);
  }
});

// Validate session
router.get('/sessions/:sessionId', authenticateToken, async (req, res, next) => {
  try {
    // Verify session ownership
    const session = await validateSession(req.params.sessionId, req.user._id);
    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    // Handle specific error status codes (401, 403)
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        error: { message: error.message },
      });
    }
    next(error);
  }
});

export default router;

