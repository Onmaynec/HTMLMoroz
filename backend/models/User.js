import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Basic info
  username: {
    type: String,
    required: [true, 'Имя пользователя обязательно'],
    unique: true,
    trim: true,
    minlength: [3, 'Минимум 3 символа'],
    maxlength: [30, 'Максимум 30 символов']
  },
  email: {
    type: String,
    required: [true, 'Email обязателен'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Пароль обязателен'],
    minlength: [6, 'Минимум 6 символов'],
    select: false
  },
  
  // Profile info
  avatar: {
    type: String,
    default: null
  },
  discordUsername: {
    type: String,
    required: [true, 'Discord обязателен'],
    trim: true
  },
  gameNickname: {
    type: String,
    required: [true, 'Игровой ник обязателен'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Возраст обязателен'],
    min: [16, 'Минимальный возраст 16 лет'],
    max: [99, 'Максимальный возраст 99 лет']
  },
  
  // Role and status
  role: {
    type: String,
    enum: ['admin', 'member', 'pending'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned', 'pending'],
    default: 'pending'
  },
  
  // Application reference
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    default: null
  },
  
  // Online status
  isOnline: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  
  // RP Experience
  rpExperience: {
    type: String,
    default: ''
  },
  previousFamilies: {
    type: String,
    default: ''
  },
  
  // Metadata
  joinedAt: {
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
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ isOnline: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last active
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save({ validateBeforeSave: false });
};

// Set online status
userSchema.methods.setOnlineStatus = function(status) {
  this.isOnline = status;
  if (status) {
    this.lastActive = new Date();
  }
  return this.save({ validateBeforeSave: false });
};

// Virtual for member duration
userSchema.virtual('memberDuration').get(function() {
  if (!this.joinedAt) return null;
  const now = new Date();
  const diff = now - this.joinedAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return days;
});

const User = mongoose.model('User', userSchema);

export default User;
