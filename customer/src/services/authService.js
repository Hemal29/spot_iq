import api from './api';

const authService = {
  register: (data) => api.post('/auth/register', data),

  login: (data) => api.post('/auth/login', data),

  forgotPassword: (data) => api.post('/auth/forgot-password', data),

  resetPassword: (token, data) => api.put(`/auth/reset-password/${token}`, data),

  getProfile: () => api.get('/users/profile'),

  updateProfile: (data) => api.put('/users/profile', data),

  changePassword: (data) => api.put('/users/change-password', data),
};

export default authService;
