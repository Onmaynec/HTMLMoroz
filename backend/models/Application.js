import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  // Applicant info
  gameNickname: {
    type: String,
    required: [true, 'Игровой ник обязателен'],
    trim: true
  },
  discordUsername: {
    type: String,
    required: [true, 'Discord обязателен'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Возраст обязателен'],
    min: [16, 'Минимальный возраст 16 лет'],
    max: [99, 'Максимальный возраст 99 лет']
  },
  
  // RP Experience
  rpExperience: {
    type: String,
    required: [true, 'Опыт в GTA RP обязателен'],
    trim: true
  },
  previousFamilies: {
    type: String,
    default: '',
    trim: true
  },
  motivation: {
    type: String,
    required: [true, 'Мотивация обязательна'],
    minlength: [50, 'Минимум 50 символов'],
    maxlength: [2000, 'Максимум 2000 символов'],
    trim: true
  },
  
  // Application status
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Review info
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  reviewNotes: {
    type: String,
    default: '',
    trim: true
  },
  rejectionReason: {
    type: String,
    default: '',
    trim: true
  },
  
  // Linked user (if approved)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Chat messages count (for unread indicator)
  unreadMessages: {
    type: Number,
    default: 0
  },
  lastMessageAt: {
    type: Date,
    default: null
  },
  
  // IP address for spam prevention
  ipAddress: {
    type: String,
    default: null
  },
  
  // Metadata
  submittedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
applicationSchema.index({ status: 1 });
applicationSchema.index({ submittedAt: -1 });
applicationSchema.index({ discordUsername: 1 });
applicationSchema.index({ gameNickname: 1 });

// Virtual for application age
applicationSchema.virtual('applicationAge').get(function() {
  const now = new Date();
  const diff = now - this.submittedAt;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  return hours;
});

// Virtual for formatted status
applicationSchema.virtual('statusLabel').get(function() {
  const labels = {
    pending: 'Ожидает рассмотрения',
    under_review: 'На рассмотрении',
    approved: 'Одобрена',
    rejected: 'Отклонена'
  };
  return labels[this.status] || this.status;
});

// Method to update status
applicationSchema.methods.updateStatus = async function(newStatus, adminId, notes = '') {
  this.status = newStatus;
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  
  if (newStatus === 'rejected') {
    this.rejectionReason = notes;
  } else {
    this.reviewNotes = notes;
  }
  
  return await this.save();
};

// Static method to get statistics
applicationSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    pending: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
    total: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });
  
  return result;
};

const Application = mongoose.model('Application', applicationSchema);

export default Application;
