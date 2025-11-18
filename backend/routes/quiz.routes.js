import express from 'express';
import {
  takeQuiz,
  getQuizStatus,
  getQuizQuestions,
} from '../services/quizService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get quiz questions
router.get('/questions', async (req, res, next) => {
  try {
    const questions = getQuizQuestions();
    res.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
});

// Take quiz
router.post('/take', authenticateToken, async (req, res, next) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: { message: 'answers array is required' },
      });
    }

    const result = await takeQuiz(req.user._id, answers);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Get quiz status
router.get('/:userId/status', authenticateToken, async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' },
      });
    }

    const status = await getQuizStatus(userId);
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

