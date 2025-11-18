import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    chat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    sender: {
      type: String,
      enum: ['user', 'tree'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    mood: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    energy: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    flagged_for_crisis: {
      type: Boolean,
      default: false,
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

// Virtual for message_id (using _id)
messageSchema.virtual('message_id').get(function () {
  return this._id;
});

// Ensure virtuals are included in JSON
messageSchema.set('toJSON', { virtuals: true });
messageSchema.set('toObject', { virtuals: true });

// Indexes
messageSchema.index({ chat_id: 1, created_at: -1 });
messageSchema.index({ flagged_for_crisis: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;

