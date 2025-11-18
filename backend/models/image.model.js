import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    note_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      required: true,
    },
    image_url: {
      type: String,
      required: true,
    },
    image_type: {
      type: String,
      enum: ['generated', 'uploaded'],
      default: 'generated',
    },
    generated_prompt: {
      type: String,
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

// Virtual for image_id (using _id)
imageSchema.virtual('image_id').get(function () {
  return this._id;
});

// Ensure virtuals are included in JSON
imageSchema.set('toJSON', { virtuals: true });
imageSchema.set('toObject', { virtuals: true });

// Indexes
imageSchema.index({ note_id: 1 });

const Image = mongoose.model('Image', imageSchema);

export default Image;

