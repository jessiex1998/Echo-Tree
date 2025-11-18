import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    answers: [{
      question_id: Number,
      answer: String,
      correct: Boolean,
    }],
    taken_at: {
      type: Date,
      default: Date.now,
    },
    can_retake_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for quiz_id (using _id)
quizSchema.virtual('quiz_id').get(function () {
  return this._id;
});

// Ensure virtuals are included in JSON
quizSchema.set('toJSON', { virtuals: true });
quizSchema.set('toObject', { virtuals: true });

// Indexes
quizSchema.index({ user_id: 1 }, { unique: true });
quizSchema.index({ taken_at: -1 });

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;

