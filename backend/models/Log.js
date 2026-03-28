import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  // Action type
  action: {
    type: String,
    required: [true, 'Тип действия обязателен'],
    enum: [
      'user_login',
      'user_logout',
      'user_register',
      'user_update',
      'user_ban',
      'user_unban',
      'application_create',
      'application_update',
      'application_approve',
      'application_reject',
      'application_review',
      'role_change',
      'admin_action',
      'settings_change',
      'chat_message',
      'notification_send',
      'error'
    ]
  },
  
  // Actor (who performed the action)
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  actorRole: {
    type: String,
    enum: ['admin', 'member', 'system', 'guest'],
    default: 'guest'
  },
  actorIp: {
    type: String,
    default: null
  },
  
  // Target (what was affected)
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  targetType: {
    type: String,
    enum: ['User', 'Application', 'Message', 'Notification', 'System'],
    default: null
  },
  
  // Action details
  description: {
    type: String,
    required: [true, 'Описание обязательно']
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // For error logs
  error: {
    message: String,
    stack: String,
    code: String
  },
  
  // Metadata
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
logSchema.index({ action: 1, timestamp: -1 });
logSchema.index({ actorId: 1, timestamp: -1 });
logSchema.index({ targetId: 1, timestamp: -1 });
logSchema.index({ timestamp: -1 });

// Static method to log action
logSchema.statics.logAction = async function(data) {
  const log = new this({
    ...data,
    timestamp: new Date()
  });
  await log.save();
  return log;
};

// Static method to get recent logs
logSchema.statics.getRecent = async function(options = {}) {
  const { limit = 50, skip = 0, action = null } = options;
  
  const query = action ? { action } : {};
  
  return await this.find(query)
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit)
    .populate('actorId', 'username role')
    .lean();
};

// Static method to get action statistics
logSchema.statics.getStats = async function(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const stats = await this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
  
  return stats;
};

const Log = mongoose.model('Log', logSchema);

export default Log;
