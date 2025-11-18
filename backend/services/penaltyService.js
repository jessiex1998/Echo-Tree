import HealerPenalty from '../models/healerPenalty.model.js';
import User from '../models/user.model.js';

/**
 * Create or increment penalty
 * @param {String} userId - User ID
 * @param {Object} violationDetails - Violation details
 * @returns {Promise<Object>} Penalty object
 */
export async function createOrIncrementPenalty(userId, violationDetails = {}) {
  let penalty = await HealerPenalty.findOne({ user_id: userId });

  if (!penalty) {
    penalty = new HealerPenalty({
      user_id: userId,
      harmful_count: 1,
      last_violation_at: new Date(),
    });
  } else {
    await penalty.incrementViolation();
  }

  await penalty.save();
  return penalty;
}

/**
 * Get penalty by user ID
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Penalty object
 */
export async function getPenaltyByUserId(userId) {
  const penalty = await HealerPenalty.findOne({ user_id: userId }).lean();
  return penalty || null;
}

/**
 * Reset penalty
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Reset penalty
 */
export async function resetPenalty(userId) {
  let penalty = await HealerPenalty.findOne({ user_id: userId });

  if (!penalty) {
    throw new Error('Penalty not found');
  }

  await penalty.reset();
  return penalty;
}

/**
 * Get all penalties with filtering, pagination, and sorting
 * @param {Object} filters - Filter options
 * @param {Object} pagination - Pagination options
 * @param {Object} sorting - Sorting options
 * @returns {Promise<Object>} { penalties, total, limit, offset }
 */
export async function getAllPenalties(filters = {}, pagination = {}, sorting = {}) {
  const { limit = 20, offset = 0 } = pagination;
  const { sort = 'updated_at', order = 'desc' } = sorting;

  const query = {};

  // Apply filters
  if (filters.alert_sent !== undefined) {
    query.alert_sent = filters.alert_sent;
  }
  if (filters.healer_status_removed !== undefined) {
    query.healer_status_removed = filters.healer_status_removed;
  }

  const sortOrder = order === 'desc' ? -1 : 1;
  const sortObj = { [sort]: sortOrder };

  const [penalties, total] = await Promise.all([
    HealerPenalty.find(query)
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .populate('user_id', 'username role')
      .lean(),
    HealerPenalty.countDocuments(query),
  ]);

  return {
    penalties,
    total,
    limit: parseInt(limit),
    offset: parseInt(offset),
  };
}

