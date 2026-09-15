const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getRecommendations,
  getMostRecommended,
  getRecommendationAnalytics,
  trackRecommendationClick,
  getBusinessInsights,
  getNearbyRecommendations,
} = require('../controllers/recommendationController');

router.get('/', getRecommendations);
router.get('/nearby', getNearbyRecommendations);
router.get('/most-recommended', getMostRecommended);
router.get('/analytics', protect, authorize('admin'), getRecommendationAnalytics);
router.get('/insights', protect, authorize('admin'), getBusinessInsights);
router.post('/track-click', trackRecommendationClick);

module.exports = router;
