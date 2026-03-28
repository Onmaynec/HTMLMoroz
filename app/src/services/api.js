import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Request interceptor - add auth token
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

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  checkApplication: (applicationId) => api.get(`/auth/check-application/${applicationId}`)
};

// Application API
export const applicationAPI = {
  create: (data) => api.post('/applications', data),
  getAll: (params) => api.get('/applications', { params }),
  getById: (id) => api.get(`/applications/${id}`),
  updateStatus: (id, data) => api.patch(`/applications/${id}/status`, data),
  getStats: () => api.get('/applications/stats'),
  checkMyApplication: (discordUsername) => api.get(`/applications/check/${discordUsername}`)
};

// User API
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  getMe: () => api.get('/users/me'),
  updateProfile: (data) => api.patch('/users/me', data),
  uploadAvatar: (formData) => api.post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  changeRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  toggleBan: (id, reason) => api.patch(`/users/${id}/ban`, { reason }),
  getOnlineUsers: () => api.get('/users/online'),
  getStats: () => api.get('/users/stats')
};

// Chat API
export const chatAPI = {
  getHistory: (applicationId, params) => api.get(`/chat/${applicationId}/messages`, { params }),
  sendMessage: (applicationId, content) => api.post(`/chat/${applicationId}/messages`, { content }),
  getUnreadCount: (applicationId) => api.get(`/chat/${applicationId}/unread`),
  markAsRead: (applicationId) => api.post(`/chat/${applicationId}/read`),
  getChatsWithUnread: () => api.get('/chat/admin/unread-chats')
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getSystemStatus: () => api.get('/admin/system-status'),
  getLogs: (params) => api.get('/admin/logs', { params }),
  sendAnnouncement: (data) => api.post('/admin/announcements', data),
  cleanupOldData: (data) => api.post('/admin/cleanup', data)
};

// Notification API
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`)
};

// Log API
export const logAPI = {
  getAll: (params) => api.get('/logs', { params }),
  getStats: (params) => api.get('/logs/stats', { params }),
  getRecentActivity: () => api.get('/logs/recent')
};

export default api;
