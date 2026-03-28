import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  // Reference to application
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: [true, 'ID заявки обязателен'],
    index: true
  },
  
  // Sender info
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Отправитель обязателен']
  },
  senderRole: {
    type: String,
    enum: ['admin', 'member', 'applicant', 'system'],
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  
  // Message content
  content: {
    type: String,
    required: [true, 'Сообщение не может быть пустым'],
    maxlength: [2000, 'Максимум 2000 символов'],
    trim: true
  },
  
  // Message type
  type: {
    type: String,
    enum: ['text', 'system', 'status_update'],
    default: 'text'
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
  readBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // For file attachments (future feature)
  attachments: [{
    filename: String,
    url: String,
    type: String
  }],
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
messageSchema.index({ applicationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ isRead: 1 });

// Method to mark as read
messageSchema.methods.markAsRead = async function(userId) {
  this.isRead = true;
  this.readAt = new Date();
  this.readBy = userId;
  return await this.save();
};

// Static method to get unread count for application
messageSchema.statics.getUnreadCount = async function(applicationId, excludeUserId) {
  return await this.countDocuments({
    applicationId,
    senderId: { $ne: excludeUserId },
    isRead: false
  });
};

// Static method to get chat history
messageSchema.statics.getChatHistory = async function(applicationId, options = {}) {
  const { limit = 50, skip = 0 } = options;
  
  return await this.find({ applicationId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('senderId', 'username avatar')
    .lean();
};

const Message = mongoose.model('Message', messageSchema);

export default Message;
