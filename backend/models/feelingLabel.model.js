import mongoose from 'mongoose';

const feelingLabelSchema = new mongoose.Schema(
  {
    message_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      required: true,
    },
    label_text: {
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

// Virtual for label_id (using _id)
feelingLabelSchema.virtual('label_id').get(function () {
  return this._id;
});

// Ensure virtuals are included in JSON
feelingLabelSchema.set('toJSON', { virtuals: true });
feelingLabelSchema.set('toObject', { virtuals: true });

// Indexes
feelingLabelSchema.index({ message_id: 1 });
feelingLabelSchema.index({ label_text: 1 });

const FeelingLabel = mongoose.model('FeelingLabel', feelingLabelSchema);

export default FeelingLabel;

