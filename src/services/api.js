import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getProfile: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/update-profile', data),
  logout: () => api.post('/api/auth/logout'),
  // phoneVerify: (data) => api.post('/api/auth/phone-verify', data),
};

// Flights API
export const flightsAPI = {
  search: (params) => api.get('/api/flights/search', { params }),
  getById: (id) => api.get(`/api/flights/${id}`),
  getStatus: (flightNumber) => api.get(`/api/flights/status/${flightNumber}`),
  getAll: (params) => api.get('/api/flights', { params }),
  create: (data) => api.post('/api/flights', data),
  update: (id, data) => api.put(`/api/flights/${id}`, data),
  delete: (id) => api.delete(`/api/flights/${id}`),
};

// Bookings API
export const bookingsAPI = {
  create: (data) => api.post('/api/bookings', data),
  getByUser: (userId, params) => api.get(`/api/bookings/user/${userId}`, { params }),
  getById: (id) => api.get(`/api/bookings/${id}`),
  cancel: (id, data) => api.put(`/api/bookings/${id}/cancel`, data),
  checkIn: (id) => api.put(`/api/bookings/${id}/checkin`),
  getAll: (params) => api.get('/api/bookings', { params }),
};

// Payments API
export const paymentsAPI = {
  createIntent: (data) => api.post('/api/payments/create-intent', data),
  confirm: (data) => api.post('/api/payments/confirm', data),
  refund: (data) => api.post('/api/payments/refund', data),
  getByBooking: (bookingId) => api.get(`/api/payments/${bookingId}`),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  getAnalytics: (params) => api.get('/api/admin/analytics', { params }),
  getUsers: (params) => api.get('/api/admin/users', { params }),
  updateUserRole: (id, data) => api.put(`/api/admin/users/${id}/role`, data),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  getReports: (params) => api.get('/api/admin/reports', { params }),
};

export default api;
