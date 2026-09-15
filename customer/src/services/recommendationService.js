import api from './api';

const recommendationService = {
  getRecommendations: (params) => api.get('/recommendations', { params }),
  getNearbyRecommendations: (params) => api.get('/recommendations/nearby', { params }),
  trackClick: (data) => api.post('/recommendations/track-click', data),
};

export default recommendationService;
