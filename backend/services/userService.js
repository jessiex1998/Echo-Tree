import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

/**
 * Create a new user
 * @param {String} username - Username
 * @param {String} password - Plain password
 * @param {String} email - Optional email
 * @returns {Promise<Object>} Created user
 */
export async function createUser(username, password, email = null) {
  // Check if user exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new Error('Username already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);
  const password_salt = salt;

  // Create user as 'teller' by default
  const user = new User({
    username,
    password_hash,
    password_salt,
    email: email || undefined,
    role: 'teller',
    status: 'active',
  });

  await user.save();
  return user;
}

/**
 * Get user by ID
 * @param {String} userId - User ID
 * @returns {Promise<Object>} User object
 */
export async function getUserById(userId) {
  const user = await User.findById(userId).select('-password_hash -password_salt');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

/**
 * Update user profile
 * @param {String} userId - User ID
 * @param {Object} updates - Update data
 * @returns {Promise<Object>} Updated user
 */
export async function updateUserProfile(userId, updates) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Handle password update
  if (updates.password) {
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(updates.password, salt);
    user.password_salt = salt;
    delete updates.password;
  }

  // Update other fields
  if (updates.email !== undefined) user.email = updates.email;

  await user.save();
  return user;
}

/**
 * Soft delete user
 * @param {String} userId - User ID
 * @returns {Promise<Boolean>} Success
 */
export async function deleteUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  user.status = 'deleted';
  await user.save();

  return true;
}

/**
 * Change user role
 * @param {String} userId - User ID
 * @param {String} newRole - New role
 * @returns {Promise<Object>} Updated user
 */
export async function changeUserRole(userId, newRole) {
  const validRoles = ['visitor', 'teller', 'healer', 'admin'];
  if (!validRoles.includes(newRole)) {
    throw new Error('Invalid role');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  user.role = newRole;
  await user.save();

  return user;
}

