import api from './api';

const bookingService = {
  createBooking: (data) => api.post('/bookings', data),

  getMyBookings: (params) => api.get('/bookings', { params }),

  getBookingById: (id) => api.get(`/bookings/${id}`),

  cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),

  getBookingHistory: () => api.get('/bookings/history'),
};

export default bookingService;
