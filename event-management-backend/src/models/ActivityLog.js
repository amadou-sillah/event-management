const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  action: { type: String, required: true },

  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },

  details: { type: mongoose.Schema.Types.Mixed },

  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);