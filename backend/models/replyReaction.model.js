import mongoose from 'mongoose';

const replyReactionSchema = new mongoose.Schema(
  {
    reply_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reply',
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reaction_type: {
      type: String,
      enum: ['like', 'support', 'helpful'],
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for reaction_id (using _id)
replyReactionSchema.virtual('reaction_id').get(function () {
  return this._id;
});

// Ensure virtuals are included in JSON
replyReactionSchema.set('toJSON', { virtuals: true });
replyReactionSchema.set('toObject', { virtuals: true });

// Unique index: one user can only have one reaction per reply
replyReactionSchema.index({ reply_id: 1, user_id: 1 }, { unique: true });

const ReplyReaction = mongoose.model('ReplyReaction', replyReactionSchema);

export default ReplyReaction;

