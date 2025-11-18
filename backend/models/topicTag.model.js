import mongoose from 'mongoose';

const topicTagSchema = new mongoose.Schema(
  {
    note_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      required: true,
    },
    tag_text: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true,
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

// Virtual for tag_id (using _id)
topicTagSchema.virtual('tag_id').get(function () {
  return this._id;
});

// Ensure virtuals are included in JSON
topicTagSchema.set('toJSON', { virtuals: true });
topicTagSchema.set('toObject', { virtuals: true });

// Indexes
topicTagSchema.index({ note_id: 1 });
topicTagSchema.index({ tag_text: 1 });

const TopicTag = mongoose.model('TopicTag', topicTagSchema);

export default TopicTag;

