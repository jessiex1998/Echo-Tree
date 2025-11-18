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
    throw new Error('Invalid credentials');
  }

  // Check if account is locked
  if (user.account_locked_until && user.account_locked_until > new Date()) {
    const minutesLeft = Math.ceil((user.account_locked_until - new Date()) / 60000);
    throw new Error(`Account is locked. Please try again in ${minutesLeft} minutes.`);
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    await user.incrementFailedAttempts();
    throw new Error('Invalid credentials');
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
 * @returns {Promise<Boolean>} Success
 */
export async function logout(sessionId) {
  await UserSession.findByIdAndDelete(sessionId);
  return true;
}

/**
 * Validate session
 * @param {String} sessionId - Session ID
 * @returns {Promise<Object>} Session object
 */
export async function validateSession(sessionId) {
  const session = await UserSession.findById(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  if (session.expires_at < new Date()) {
    await UserSession.findByIdAndDelete(sessionId);
    throw new Error('Session expired');
  }

  return session;
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

