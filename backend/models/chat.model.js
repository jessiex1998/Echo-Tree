import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Allow null for visitor chats
    },
    start_time: {
      type: Date,
      required: true,
      default: Date.now,
    },
    closed_at: {
      type: Date,
      default: null,
    },
    message_count: {
      type: Number,
      default: 0,
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

// Instance methods
chatSchema.methods.closeChat = function () {
  this.closed_at = new Date();
  return this.save();
};

chatSchema.methods.incrementMessageCount = function () {
  this.message_count += 1;
  return this.save();
};

// Virtual for chat_id (using _id)
chatSchema.virtual('chat_id').get(function () {
  return this._id;
});

// Ensure virtuals are included in JSON
chatSchema.set('toJSON', { virtuals: true });
chatSchema.set('toObject', { virtuals: true });

// Indexes
chatSchema.index({ user_id: 1, start_time: -1 });
chatSchema.index({ closed_at: 1 });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;

