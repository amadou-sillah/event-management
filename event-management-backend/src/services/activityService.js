const ActivityLog = require('../models/ActivityLog');

exports.logActivity = (userId, action, targetId = null, details = {}) => {
  // NON-BLOCKING: do NOT await
  setImmediate(async () => {
    try {
      const log = new ActivityLog({
        userId,
        action,
        targetId,
        details
      });

      await log.save();
    } catch (err) {
      console.error('Activity log failed:', err.message);
    }
  });
};

exports.getActivities = async ({ page = 1, limit = 10, userId }) => {
  const query = userId ? { userId } : {};
  const skip = (page - 1) * limit;

  const [activities, total] = await Promise.all([
    ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email'),

    ActivityLog.countDocuments(query)
  ]);

  return { activities, total };
};