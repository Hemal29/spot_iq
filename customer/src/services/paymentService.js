import api from './api';

const paymentService = {
  createOrder: (data) => api.post('/payments/create-order', data),

  verifyPayment: (data) => api.post('/payments/verify', data),
};

export default paymentService;
