import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  getUserAnalytics,
  getQuizAnalytics,
  getTimeAnalytics,
  getEngagementAnalytics,
  getRecommendations
} from '../controllers/analyticsController.js';

const router = express.Router();

// All analytics routes require authentication
router.use(protect);

// Analytics routes
router.get('/user', getUserAnalytics);
router.get('/quiz/:quizId', getQuizAnalytics);
router.get('/time', getTimeAnalytics);
router.get('/engagement', getEngagementAnalytics);
router.get('/recommendations', getRecommendations);

export default router;