import api from './api';

const parkingService = {
  getAllParking: (params) => api.get('/parking', { params }),

  getParkingById: (id) => api.get(`/parking/${id}`),

  getNearbyParking: (params) => api.get('/parking/nearby', { params }),

  searchParking: (query) => api.get('/parking/search', { params: { q: query } }),
};

export default parkingService;
