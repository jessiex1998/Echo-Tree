import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import UserSession from '../models/userSession.model.js';

/**
 * Login user
 * @param {String} username - Username
 * @param {String} password - Password
 * @param {String} ipAddress - IP address
 * @param {String} userAgent - User agent
 * @returns {Promise<Object>} { token, user, session }
 */
export async function login(username, password, ipAddress = null, userAgent = null) {
  // Find user
  const user = await User.findOne({ username });
  if (!user) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  // Check if account is locked
  if (user.account_locked_until && user.account_locked_until > new Date()) {
    const minutesLeft = Math.ceil((user.account_locked_until - new Date()) / 60000);
    const error = new Error(`Account is locked. Please try again in ${minutesLeft} minutes.`);
    error.status = 423;
    throw error;
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    await user.incrementFailedAttempts();
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  // Reset failed attempts on successful login
  await user.resetFailedAttempts();

  // Update last login
  user.last_login = new Date();
  await user.save();

  // Generate JWT token
  const token = jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  // Create session
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  const session = await UserSession.createSession(
    user._id,
    token,
    expiresAt,
    ipAddress,
    userAgent
  );

  return {
    token,
    user: {
      user_id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    session,
  };
}

/**
 * Logout user
 * @param {String} sessionId - Session ID
 * @param {String} userId - User ID (for ownership verification)
 * @returns {Promise<Boolean>} Success
 */
export async function logout(sessionId, userId = null) {
  const session = await UserSession.findById(sessionId);

  if (!session) {
    const error = new Error('Session not found');
    error.status = 404;
    throw error;
  }

  // Verify ownership if userId provided
  if (userId && session.user_id.toString() !== userId.toString()) {
    const error = new Error('Unauthorized to delete this session');
    error.status = 403;
    throw error;
  }

  await UserSession.findByIdAndDelete(sessionId);
  return true;
}

/**
 * Validate session
 * @param {String} sessionId - Session ID
 * @param {String} userId - User ID (optional, for ownership check)
 * @returns {Promise<Object>} Session object with user info
 */
export async function validateSession(sessionId, userId = null) {
  const session = await UserSession.findById(sessionId).populate('user_id', '-password_hash -password_salt');
  if (!session) {
    const error = new Error('Session not found');
    error.status = 401;
    throw error;
  }

  if (session.expires_at < new Date()) {
    await UserSession.findByIdAndDelete(sessionId);
    const error = new Error('Session expired');
    error.status = 401;
    throw error;
  }

  // Check ownership if userId provided
  if (userId && session.user_id._id.toString() !== userId.toString()) {
    const error = new Error('Unauthorized to access this session');
    error.status = 403;
    throw error;
  }

  return {
    sessionId: session._id,
    userId: session.user_id._id,
    username: session.user_id.username,
    role: session.user_id.role,
    createdAt: session.created_at,
    expiresAt: session.expires_at,
    ipAddress: session.ip_address,
    userAgent: session.user_agent,
    valid: true,
  };
}

/**
 * Get all user sessions
 * @param {String} userId - User ID
 * @param {Object} filters - Filter options
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} { sessions, total, limit, offset }
 */
export async function getAllUserSessions(userId, filters = {}, pagination = {}) {
  const { limit = 20, offset = 0 } = pagination;

  const query = { user_id: userId };

  const [sessions, total] = await Promise.all([
    UserSession.find(query)
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean(),
    UserSession.countDocuments(query),
  ]);

  return {
    sessions,
    total,
    limit: parseInt(limit),
    offset: parseInt(offset),
  };
}

/**
 * Delete session
 * @param {String} sessionId - Session ID
 * @param {String} userId - User ID
 * @returns {Promise<Boolean>} Success
 */
export async function deleteSession(sessionId, userId) {
  const session = await UserSession.findOne({
    _id: sessionId,
    user_id: userId,
  });

  if (!session) {
    throw new Error('Session not found');
  }

  await UserSession.findByIdAndDelete(sessionId);
  return true;
}

