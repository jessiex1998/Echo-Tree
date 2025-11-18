import mongoose from 'mongoose';

const replySchema = new mongoose.Schema(
  {
    note_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      required: true,
    },
    healer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    edited_at: {
      type: Date,
    },
    is_harmful: {
      type: Boolean,
      default: false,
    },
    moderation_reason: {
      type: String,
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

// Virtual for reply_id (using _id)
replySchema.virtual('reply_id').get(function () {
  return this._id;
});

// Ensure virtuals are included in JSON
replySchema.set('toJSON', { virtuals: true });
replySchema.set('toObject', { virtuals: true });

// Indexes
replySchema.index({ note_id: 1, created_at: -1 });
replySchema.index({ healer_id: 1 });
replySchema.index({ is_harmful: 1 });

const Reply = mongoose.model('Reply', replySchema);

export default Reply;

