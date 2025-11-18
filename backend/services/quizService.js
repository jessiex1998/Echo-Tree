import Quiz from '../models/quiz.model.js';
import User from '../models/user.model.js';

// Quiz questions
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: '当有人分享困难经历时，最好的回应是？',
    options: [
      '立即给出建议和解决方案',
      '先倾听，表达理解和共情',
      '分享自己的类似经历',
      '告诉他们要坚强',
    ],
    correct: 1,
  },
  {
    id: 2,
    question: '作为 Healer，你的主要角色是？',
    options: [
      '诊断和治疗心理问题',
      '提供专业医疗建议',
      '提供支持、理解和共情',
      '批评和纠正错误想法',
    ],
    correct: 2,
  },
  {
    id: 3,
    question: '如果遇到可能涉及自我伤害的内容，你应该？',
    options: [
      '忽略它，让用户自己处理',
      '提供专业诊断',
      '表达关心，建议寻求专业帮助',
      '直接告诉用户要停止',
    ],
    correct: 2,
  },
  {
    id: 4,
    question: '共情意味着？',
    options: [
      '完全同意对方的观点',
      '理解并感受对方的情绪',
      '提供解决方案',
      '改变对方的想法',
    ],
    correct: 1,
  },
  {
    id: 5,
    question: '作为 Healer，回复应该？',
    options: [
      '尽可能长和详细',
      '简短、支持性、不带偏见',
      '包含大量建议',
      '批评性的',
    ],
    correct: 1,
  },
];

/**
 * Take the healer quiz
 * @param {String} userId - User ID
 * @param {Array} answers - Array of { question_id, answer }
 * @returns {Promise<Object>} Quiz result
 */
export async function takeQuiz(userId, answers) {
  // Check if user already passed
  const existingQuiz = await Quiz.findOne({ user_id: userId });
  if (existingQuiz && existingQuiz.passed) {
    throw new Error('You have already passed the quiz');
  }

  // Check if user can retake
  if (existingQuiz && existingQuiz.can_retake_at && existingQuiz.can_retake_at > new Date()) {
    const hoursLeft = Math.ceil((existingQuiz.can_retake_at - new Date()) / (1000 * 60 * 60));
    throw new Error(`You can retake the quiz in ${hoursLeft} hours`);
  }

  // Grade quiz
  let score = 0;
  const gradedAnswers = answers.map((answer) => {
    const question = QUIZ_QUESTIONS.find((q) => q.id === answer.question_id);
    if (!question) {
      return { ...answer, correct: false };
    }

    const isCorrect = question.correct === parseInt(answer.answer);
    if (isCorrect) score += 20; // 5 questions, 20 points each

    return {
      question_id: answer.question_id,
      answer: answer.answer,
      correct: isCorrect,
    };
  });

  const passed = score >= 80; // 80% passing score

  // Update or create quiz record
  const quizData = {
    user_id: userId,
    score,
    passed,
    answers: gradedAnswers,
    taken_at: new Date(),
  };

  if (!passed) {
    // Can retake after 24 hours
    quizData.can_retake_at = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  let quiz;
  if (existingQuiz) {
    Object.assign(existingQuiz, quizData);
    await existingQuiz.save();
    quiz = existingQuiz;
  } else {
    quiz = new Quiz(quizData);
    await quiz.save();
  }

  // If passed, upgrade user to healer
  if (passed) {
    await User.findByIdAndUpdate(userId, { role: 'healer' });
  }

  return quiz;
}

/**
 * Get quiz status for user
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Quiz status
 */
export async function getQuizStatus(userId) {
  const quiz = await Quiz.findOne({ user_id: userId }).lean();

  if (!quiz) {
    return {
      taken: false,
      can_take: true,
      questions: QUIZ_QUESTIONS,
    };
  }

  return {
    taken: true,
    passed: quiz.passed,
    score: quiz.score,
    can_retake: !quiz.can_retake_at || quiz.can_retake_at <= new Date(),
    can_retake_at: quiz.can_retake_at,
    questions: QUIZ_QUESTIONS,
  };
}

/**
 * Get quiz questions
 * @returns {Array} Quiz questions
 */
export function getQuizQuestions() {
  return QUIZ_QUESTIONS.map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options,
  }));
}

