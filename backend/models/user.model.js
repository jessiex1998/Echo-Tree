import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    password_hash: {
      type: String,
      required: true,
    },
    password_salt: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ['visitor', 'teller', 'healer', 'admin'],
      default: 'teller',
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'banned', 'deleted'],
      default: 'active',
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    last_login: {
      type: Date,
    },
    failed_login_attempts: {
      type: Number,
      default: 0,
    },
    account_locked_until: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for user_id (using _id)
userSchema.virtual('user_id').get(function () {
  return this._id;
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Instance methods
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password_hash);
};

userSchema.methods.incrementFailedAttempts = async function () {
  this.failed_login_attempts += 1;
  if (this.failed_login_attempts >= 5) {
    this.account_locked_until = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  }
  return await this.save();
};

userSchema.methods.resetFailedAttempts = async function () {
  this.failed_login_attempts = 0;
  this.account_locked_until = null;
  return await this.save();
};

userSchema.methods.lockAccount = async function (durationMinutes = 15) {
  this.account_locked_until = new Date(Date.now() + durationMinutes * 60 * 1000);
  return await this.save();
};

// Indexes
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { sparse: true });
userSchema.index({ status: 1 });

const User = mongoose.model('User', userSchema);

export default User;

