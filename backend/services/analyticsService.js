import Digest from '../models/digest.model.js';
import Message from '../models/message.model.js';
import Chat from '../models/chat.model.js';
import FeelingLabel from '../models/feelingLabel.model.js';

/**
 * Generate digest for user
 * @param {String} userId - User ID
 * @param {String} periodType - 'weekly' or 'monthly'
 * @param {Date} periodStart - Period start date
 * @param {Date} periodEnd - Period end date
 * @returns {Promise<Object>} Created digest
 */
export async function generateDigest(userId, periodType, periodStart, periodEnd) {
  // Get messages in period
  const messages = await Message.find({
    chat_id: { $in: await Chat.find({ user_id: userId }).distinct('_id') },
    sender: 'user',
    created_at: { $gte: periodStart, $lte: periodEnd },
    deleted_at: null,
  }).lean();

  // Calculate mood and energy averages
  const moodValues = messages.filter((m) => m.mood).map((m) => m.mood);
  const energyValues = messages.filter((m) => m.energy).map((m) => m.energy);

  const avgMood = moodValues.length > 0
    ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length
    : null;
  const avgEnergy = energyValues.length > 0
    ? energyValues.reduce((a, b) => a + b, 0) / energyValues.length
    : null;

  // Get feeling labels
  const messageIds = messages.map((m) => m._id);
  const feelingLabels = await FeelingLabel.find({
    message_id: { $in: messageIds },
    deleted_at: null,
  }).lean();

  const feelingCounts = {};
  feelingLabels.forEach((fl) => {
    feelingCounts[fl.label_text] = (feelingCounts[fl.label_text] || 0) + 1;
  });

  const topFeelings = Object.entries(feelingCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([feeling]) => feeling);

  // Calculate trends (simplified)
  const moodTrend = calculateTrend(moodValues);
  const energyTrend = calculateTrend(energyValues);

  // Generate summary
  const summary = generateSummary({
    messageCount: messages.length,
    chatCount: await Chat.countDocuments({
      user_id: userId,
      start_time: { $gte: periodStart, $lte: periodEnd },
      deleted_at: null,
    }),
    avgMood,
    avgEnergy,
    topFeelings,
  });

  // Create digest
  const digest = new Digest({
    user_id: userId,
    period_type: periodType,
    period_start: periodStart,
    period_end: periodEnd,
    summary,
    mood_trend: {
      average: avgMood,
      trend: moodTrend,
    },
    energy_trend: {
      average: avgEnergy,
      trend: energyTrend,
    },
    top_feelings: topFeelings,
    message_count: messages.length,
    chat_count: await Chat.countDocuments({
      user_id: userId,
      start_time: { $gte: periodStart, $lte: periodEnd },
      deleted_at: null,
    }),
  });

  await digest.save();
  return digest;
}

/**
 * Calculate trend from values
 */
function calculateTrend(values) {
  if (values.length < 2) return 'stable';

  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const diff = secondAvg - firstAvg;
  if (diff > 0.3) return 'improving';
  if (diff < -0.3) return 'declining';
  return 'stable';
}

/**
 * Generate summary text
 */
function generateSummary({ messageCount, chatCount, avgMood, avgEnergy, topFeelings }) {
  let summary = `在过去的一段时间里，你进行了 ${chatCount} 次对话，发送了 ${messageCount} 条消息。`;

  if (avgMood) {
    summary += `你的平均心情评分为 ${avgMood.toFixed(1)}/5。`;
  }

  if (avgEnergy) {
    summary += `平均精力评分为 ${avgEnergy.toFixed(1)}/5。`;
  }

  if (topFeelings.length > 0) {
    summary += `你经常感受到的情绪包括：${topFeelings.join('、')}。`;
  }

  return summary;
}

/**
 * Get digests for user
 * @param {String} userId - User ID
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} { digests, total, limit, offset }
 */
export async function getUserDigests(userId, pagination = {}) {
  const { limit = 10, offset = 0 } = pagination;

  const [digests, total] = await Promise.all([
    Digest.find({
      user_id: userId,
      deleted_at: null,
    })
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean(),
    Digest.countDocuments({
      user_id: userId,
      deleted_at: null,
    }),
  ]);

  return {
    digests,
    total,
    limit: parseInt(limit),
    offset: parseInt(offset),
  };
}

/**
 * Get mood trends for user
 * @param {String} userId - User ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Trend data points
 */
export async function getMoodTrends(userId, startDate, endDate) {
  const chats = await Chat.find({
    user_id: userId,
    start_time: { $gte: startDate, $lte: endDate },
    deleted_at: null,
  }).distinct('_id');

  const messages = await Message.find({
    chat_id: { $in: chats },
    sender: 'user',
    mood: { $ne: null },
    created_at: { $gte: startDate, $lte: endDate },
    deleted_at: null,
  })
    .sort({ created_at: 1 })
    .select('mood created_at')
    .lean();

  return messages.map((m) => ({
    date: m.created_at,
    mood: m.mood,
  }));
}

/**
 * Get engagement metrics for user
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Metrics
 */
export async function getEngagementMetrics(userId) {
  const totalChats = await Chat.countDocuments({
    user_id: userId,
    deleted_at: null,
  });

  const totalMessages = await Message.countDocuments({
    chat_id: { $in: await Chat.find({ user_id: userId }).distinct('_id') },
    sender: 'user',
    deleted_at: null,
  });

  const activeChats = await Chat.countDocuments({
    user_id: userId,
    closed_at: null,
    deleted_at: null,
  });

  return {
    total_chats: totalChats,
    total_messages: totalMessages,
    active_chats: activeChats,
  };
}

