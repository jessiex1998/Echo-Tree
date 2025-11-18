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

    res.json({
      success: true,
      data: {
        token: result.token,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Logout
router.delete('/sessions/:sessionId', authenticateToken, async (req, res, next) => {
  try {
    await logout(req.params.sessionId);

    // Clear cookie
    res.clearCookie('token');

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Validate session
router.get('/sessions/:sessionId', authenticateToken, async (req, res, next) => {
  try {
    const session = await validateSession(req.params.sessionId);
    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

