import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Anonymous notes may not have user_id
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    anonymized_content: {
      type: String,
      required: true,
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    posted_at: {
      type: Date,
      default: Date.now,
    },
    view_count: {
      type: Number,
      default: 0,
    },
    reply_count: {
      type: Number,
      default: 0,
    },
    source_chat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
    },
    source_message_ids: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    }],
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for note_id (using _id)
noteSchema.virtual('note_id').get(function () {
  return this._id;
});

// Ensure virtuals are included in JSON
noteSchema.set('toJSON', { virtuals: true });
noteSchema.set('toObject', { virtuals: true });

// Indexes
noteSchema.index({ visibility: 1, posted_at: -1 });
noteSchema.index({ user_id: 1, posted_at: -1 });
noteSchema.index({ view_count: -1 });

const Note = mongoose.model('Note', noteSchema);

export default Note;

