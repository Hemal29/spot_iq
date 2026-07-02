import api from './api';

const reviewService = {
  createReview: (data) => api.post('/reviews', data),

  getParkingReviews: (parkingId) => api.get(`/reviews/parking/${parkingId}`),

  updateReview: (id, data) => api.put(`/reviews/${id}`, data),

  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

export default reviewService;
