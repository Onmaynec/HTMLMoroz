import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Recipient
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Получатель обязателен'],
    index: true
  },
  
  // Notification content
  title: {
    type: String,
    required: [true, 'Заголовок обязателен'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Сообщение обязательно'],
    trim: true
  },
  
  // Notification type
  type: {
    type: String,
    enum: [
      'application_submitted',
      'application_approved',
      'application_rejected',
      'application_review',
      'new_message',
      'status_change',
      'announcement',
      'system'
    ],
    required: true
  },
  
  // Related entity
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  relatedType: {
    type: String,
    enum: ['Application', 'Message', 'User', 'Announcement'],
    default: null
  },
  
  // Read status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  
  // Action link (optional)
  actionLink: {
    type: String,
    default: null
  },
  actionText: {
    type: String,
    default: null
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });

// Method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  return await this.save();
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ userId, isRead: false });
};

// Static method to get recent notifications
notificationSchema.statics.getRecent = async function(userId, limit = 20) {
  return await this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  await notification.save();
  return notification;
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
