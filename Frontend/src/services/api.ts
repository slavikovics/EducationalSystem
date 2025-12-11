// src/services/api.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
  resetPassword: (oldPassword: string, newPassword: string) =>
    api.post('/auth/reset-password', { oldPassword, newPassword }),
  blockUser: (userId: number, accessKey: string) =>
    api.post(`/auth/block-user/${userId}?accessKey=${accessKey}`),
};

// Materials API
export const materialsAPI = {
  getAll: () => api.get('/material'),
  getById: (id: number) => api.get(`/material/${id}`),
  create: (data: { text: string; mediaFiles?: string[]; category: string }) =>
    api.post('/material', data),
  update: (id: number, data: Record<string, any>) =>
    api.put(`/material/${id}/content`, data),
  delete: (id: number) => api.delete(`/material/${id}`),
  getUserMaterials: (userId: number) => api.get(`/material/user/${userId}`),
};

// Tests API
export const testsAPI = {
  getAll: () => api.get('/test'),
  getById: (id: number) => api.get(`/test/${id}`),
  getByMaterialId: (materialId: number) =>
    api.get(`/test/material/${materialId}`),
  create: (materialId: number, questions: any[]) =>
    api.post('/test', { materialId, questions }),
  update: (id: number, questions: any[]) =>
    api.put(`/test/${id}/questions`, questions),
  delete: (id: number) => api.delete(`/test/${id}`),
};

// Reviews API
export const reviewsAPI = {
  getAll: () => api.get('/review'),
  getById: (id: number) => api.get(`/review/${id}`),
  create: (data: { text: string; mediaFiles?: string[]; type: string }) =>
    api.post('/review', data),
  update: (id: number, data: Record<string, any>) =>
    api.put(`/review/${id}/content`, data),
  delete: (id: number, accessKey: string) =>
    api.delete(`/review/${id}?accessKey=${accessKey}`),
};

export default api;