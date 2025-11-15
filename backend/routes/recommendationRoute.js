import express from 'express';
import { 
  getRecommendations, 
  trainRecommendationModel,
  getRecommendationStats 
} from '../controllers/recommendationController.js';

const router = express.Router();

// Public route - get recommendations based on cart
router.post('/get', getRecommendations);

// Admin routes - train model and view stats
router.post('/train', trainRecommendationModel);
router.get('/stats', getRecommendationStats);

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Recommendations API is working!',
    timestamp: new Date().toISOString()
  });
});

export default router;

