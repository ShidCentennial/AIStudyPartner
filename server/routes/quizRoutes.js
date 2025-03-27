 import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  createQuiz, 
  getQuizzes, 
  getQuizById, 
  submitQuizAttempt,
  handleExplanationRequest
} from '../controllers/quizController.js';

const router = express.Router();

// All quiz routes require authentication
router.use(protect);

// Quiz routes
router.post('/create', createQuiz);
router.get('/', getQuizzes);
router.get('/:id', getQuizById);
router.post('/submit', submitQuizAttempt);
router.post('/ai-explanation', handleExplanationRequest);

export default router;