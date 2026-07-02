import api from './api';

const vehicleService = {
  addVehicle: (data) => api.post('/vehicles', data),

  getMyVehicles: () => api.get('/vehicles'),

  updateVehicle: (id, data) => api.put(`/vehicles/${id}`, data),

  deleteVehicle: (id) => api.delete(`/vehicles/${id}`),

  setDefaultVehicle: (id) => api.put(`/vehicles/${id}/default`),
};

export default vehicleService;
