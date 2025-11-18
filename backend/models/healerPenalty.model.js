import mongoose from 'mongoose';

const healerPenaltySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    harmful_count: {
      type: Number,
      default: 0,
    },
    alert_sent: {
      type: Boolean,
      default: false,
    },
    healer_status_removed: {
      type: Boolean,
      default: false,
    },
    last_violation_at: {
      type: Date,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for penalty_id (using _id)
healerPenaltySchema.virtual('penalty_id').get(function () {
  return this._id;
});

// Ensure virtuals are included in JSON
healerPenaltySchema.set('toJSON', { virtuals: true });
healerPenaltySchema.set('toObject', { virtuals: true });

// Instance methods
healerPenaltySchema.methods.incrementViolation = async function () {
  this.harmful_count += 1;
  this.last_violation_at = new Date();
  this.updated_at = new Date();

  // Check thresholds
  if (this.harmful_count >= 5 && !this.alert_sent) {
    this.alert_sent = true;
    // TODO: Send alert notification
  }

  if (this.harmful_count >= 10 && !this.healer_status_removed) {
    this.healer_status_removed = true;
    // Remove healer role
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(this.user_id, { role: 'teller' });
  }

  return await this.save();
};

healerPenaltySchema.methods.checkThresholds = function () {
  return {
    alert_threshold: this.harmful_count >= 5,
    removal_threshold: this.harmful_count >= 10,
  };
};

healerPenaltySchema.methods.reset = async function () {
  this.harmful_count = 0;
  this.alert_sent = false;
  this.healer_status_removed = false;
  this.last_violation_at = null;
  this.updated_at = new Date();
  return await this.save();
};

const HealerPenalty = mongoose.model('HealerPenalty', healerPenaltySchema);

export default HealerPenalty;

