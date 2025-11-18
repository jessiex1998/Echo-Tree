import mongoose from 'mongoose';

const digestSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    period_type: {
      type: String,
      enum: ['weekly', 'monthly'],
      required: true,
    },
    period_start: {
      type: Date,
      required: true,
    },
    period_end: {
      type: Date,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    mood_trend: {
      average: Number,
      trend: String, // 'improving', 'stable', 'declining'
    },
    energy_trend: {
      average: Number,
      trend: String,
    },
    top_feelings: [String],
    message_count: {
      type: Number,
      default: 0,
    },
    chat_count: {
      type: Number,
      default: 0,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for digest_id (using _id)
digestSchema.virtual('digest_id').get(function () {
  return this._id;
});

// Ensure virtuals are included in JSON
digestSchema.set('toJSON', { virtuals: true });
digestSchema.set('toObject', { virtuals: true });

// Indexes
digestSchema.index({ user_id: 1, created_at: -1 });
digestSchema.index({ period_type: 1, period_start: -1 });

const Digest = mongoose.model('Digest', digestSchema);

export default Digest;

