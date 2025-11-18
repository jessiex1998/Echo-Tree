import mongoose from 'mongoose';
import crypto from 'crypto';

const userSessionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    expires_at: {
      type: Date,
      required: true,
    },
    ip_address: {
      type: String,
    },
    user_agent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for session_id (using _id)
userSessionSchema.virtual('session_id').get(function () {
  return this._id;
});

// Ensure virtuals are included in JSON
userSessionSchema.set('toJSON', { virtuals: true });
userSessionSchema.set('toObject', { virtuals: true });

// Indexes
userSessionSchema.index({ user_id: 1, expires_at: 1 });
userSessionSchema.index({ token: 1 }, { unique: true });

// Static method to create session
userSessionSchema.statics.createSession = async function (userId, token, expiresAt, ipAddress, userAgent) {
  return await this.create({
    user_id: userId,
    token,
    expires_at: expiresAt,
    ip_address: ipAddress,
    user_agent: userAgent,
  });
};

const UserSession = mongoose.model('UserSession', userSessionSchema);

export default UserSession;

