import api from './api';

const adminService = {
  login: (data) => api.post('/auth/login', data),
  getDashboardStats: () => api.get('/admin/dashboard'),

  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  suspendUser: (id) => api.put(`/admin/users/${id}/suspend`),
  activateUser: (id) => api.put(`/admin/users/${id}/activate`),

  getParking: (id) => api.get(`/parking/${id}`),
  getParkings: (params) => api.get('/admin/parkings', { params }),
  createParking: (data) => api.post('/parking', data),
  updateParking: (id, data) => api.put(`/parking/${id}`, data),
  deleteParking: (id) => api.delete(`/parking/${id}`),
  uploadImages: (id, formData) =>
    api.put(`/parking/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  createSlots: (parkingId, data) => api.post(`/slots/bulk/${parkingId}`, data),
  getSlotsByParking: (parkingId) => api.get(`/slots/parking/${parkingId}`),
  updateSlot: (id, data) => api.put(`/slots/${id}`, data),
  deleteSlot: (id) => api.delete(`/slots/${id}`),

  getAllBookings: (params) => api.get('/admin/bookings', { params }),
  cancelBooking: (id) => api.put(`/admin/bookings/${id}/cancel`),

  getAllPayments: (params) => api.get('/admin/payments', { params }),

  getAllReviews: (params) => api.get('/admin/reviews', { params }),
  approveReview: (id) => api.put(`/admin/reviews/${id}/approve`),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),

  getRevenueReport: (params) => api.get('/admin/revenue', { params }),
  getBookingTrends: (params) => api.get('/admin/trends', { params }),
  getRevenueByParking: () => api.get('/admin/revenue/by-parking'),
  getAnalytics: () => api.get('/admin/analytics'),

  getOwners: (params) => api.get('/admin/owners', { params }),
  approveOwner: (id) => api.put(`/admin/owners/${id}/approve`),
  rejectOwner: (id) => api.put(`/admin/owners/${id}/reject`),

  getCoupons: (params) => api.get('/admin/coupons', { params }),
  createCoupon: (data) => api.post('/admin/coupons', data),
  updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),

  getNotifications: (params) => api.get('/admin/notifications', { params }),
  createNotification: (data) => api.post('/admin/notifications', data),
  markNotificationRead: (id) => api.put(`/admin/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/admin/notifications/read-all'),

  getTickets: (params) => api.get('/admin/tickets', { params }),
  updateTicketStatus: (id, data) => api.put(`/admin/tickets/${id}/status`, data),
  assignTicket: (id, data) => api.put(`/admin/tickets/${id}/assign`, data),

  getReports: (params) => api.get('/admin/reports', { params }),

  getProfile: () => api.get('/admin/profile'),
  updateProfile: (data) => api.put('/admin/profile', data),
  changePassword: (data) => api.put('/admin/profile/password', data),
};

export default adminService;
