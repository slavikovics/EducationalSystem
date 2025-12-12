// src/services/api.ts
import axios from 'axios';
import type { 
  ApiResponse, 
  LoginFormData,
  RegisterUserFormData,
  RegisterAdminFormData,
  RegisterTutorFormData,
  ChangePasswordFormData,
  CreateMaterialFormData,
  CreateReviewFormData,
  CreateTestFormData,
  SubmitTestFormData,
  Question
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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
  (response) => {
    // For successful responses (2xx), return the data
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      console.log('API Error Response:', {
        status,
        data,
        url: error.config?.url,
        method: error.config?.method
      });
      
      if (status === 401) {
        // Unauthorized - clear storage and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      // IMPORTANT: Reject with the actual error response data
      // so it can be caught and handled properly
      return Promise.reject({
        response: {
          data: data,  // Pass through the actual error data
          status: status
        },
        message: error.message,
        config: error.config
      });
    } else if (error.request) {
      // No response received
      console.error('Network Error - No response:', error.request);
      return Promise.reject({
        response: {
          data: { 
            Error: 'Network Error',
            Message: 'Unable to connect to server. Please check your internet connection.'
          },
          status: 0
        }
      });
    }
    
    // Other errors
    console.error('Request Error:', error.message);
    return Promise.reject({
      response: {
        data: { 
          Error: 'Request Error',
          Message: error.message
        }
      }
    });
  }
);

const normalizeResponse = <T>(response: any): ApiResponse<T> => {
  // Check if response already has the structure we expect
  if (response.Token || response.User || response.Message) {
    // This is a success response from backend
    return {
      success: true,
      data: response,
      message: response.Message || response.message,
      ...response
    };
  }
  
  // Check if it's an error response
  if (response.error || response.Error) {
    return {
      success: false,
      error: response.Error || response.error,
      message: response.Message || response.message,
      ...response
    };
  }
  
  // Default response
  return {
    success: !response.error,
    data: response,
    message: response.message,
    error: response.error,
    ...response
  };
};

// Auth API
export const authAPI = {
  login: async (data: LoginFormData): Promise<ApiResponse> => {
    try {
      const response = await api.post('/auth/login', data);
      return normalizeResponse(response);
    } catch (error: any) {
      return Promise.reject(normalizeResponse(error));
    }
  },
  
  registerUser: async (data: RegisterUserFormData): Promise<ApiResponse> => {
    try {
      const response = await api.post('/auth/register/user', data);
      return normalizeResponse(response);
    } catch (error: any) {
      return Promise.reject(normalizeResponse(error));
    }
  },
  
  registerAdmin: async (data: RegisterAdminFormData): Promise<ApiResponse> => {
    try {
      const response = await api.post('/auth/register/admin', data);
      return normalizeResponse(response);
    } catch (error: any) {
      return Promise.reject(normalizeResponse(error));
    }
  },
  
  registerTutor: async (data: RegisterTutorFormData): Promise<ApiResponse> => {
    try {
      const response = await api.post('/auth/register/tutor', data);
      return normalizeResponse(response);
    } catch (error: any) {
      return Promise.reject(normalizeResponse(error));
    }
  },
  
  changePassword: async (data: ChangePasswordFormData): Promise<ApiResponse> => {
    try {
      const response = await api.post('/auth/change-password', data);
      return normalizeResponse(response);
    } catch (error: any) {
      return Promise.reject(normalizeResponse(error));
    }
  },
  
  getCurrentUser: async (): Promise<ApiResponse> => {
    try {
      const response = await api.get('/auth/me');
      return normalizeResponse(response);
    } catch (error: any) {
      return Promise.reject(normalizeResponse(error));
    }
  },
  
  blockUser: async (userId: number): Promise<ApiResponse> => {
    try {
      const response = await api.post(`/auth/block-user/${userId}`, {});
      return normalizeResponse(response);
    } catch (error: any) {
      return Promise.reject(normalizeResponse(error));
    }
  },
};

// Materials API
export const materialsAPI = {
  // Get all materials
  getAllMaterials: () => api.get('/material'),
  
  // Get single material
  getMaterialById: (id: number) => api.get(`/material/${id}`),
  
  // Get materials by user ID
  getUserMaterials: (userId: number) => api.get(`/material/user/${userId}`),
  
  // Get create form configuration
  getCreateMaterialForm: () => api.get('/material/create-form'),
  
  // Create new material
  createMaterial: (data: {
    text: string;
    category: string;
    mediaFiles: string[];
  }) => api.post('/material/create-material', data),
  
  // Delete material
  deleteMaterial: (id: number) => api.delete(`/material/${id}`),
  
  // Update material content
  updateContent: (id: number, data: any) => 
    api.put(`/material/${id}/content`, data),
  
  // Get edit form
  getEditContentForm: (id: number) => api.get(`/material/${id}/edit-form`),
};

// Tests API
export const testsAPI = {
  getAll: async (): Promise<ApiResponse> => {
    try {
      const response = await api.get('/tests');
      return normalizeResponse(response);
    } catch (error: any) {
      return Promise.reject(normalizeResponse(error));
    }
  },
  
  getById: async (id: number): Promise<ApiResponse> => {
    try {
      const response = await api.get(`/tests/${id}`);
      return normalizeResponse(response);
    } catch (error: any) {
      return Promise.reject(normalizeResponse(error));
    }
  },
  
  getByMaterialId: async (materialId: number): Promise<ApiResponse> => {
    try {
      const response = await api.get(`/tests/material/${materialId}`);
      return normalizeResponse(response);
    } catch (error: any) {
      return Promise.reject(normalizeResponse(error));
    }
  },
  
  create: async (data: CreateTestFormData): Promise<ApiResponse> => {
    try {
      const response = await api.post('/tests', data);
      return normalizeResponse(response);
    } catch (error: any) {
      return Promise.reject(normalizeResponse(error));
    }
  },
  
  update: async (id: number, questions: Question[]): Promise<ApiResponse> => {
    try {
      const response = await api.put(`/tests/${id}/questions`, questions);
      return normalizeResponse(response);
    } catch (error: any) {
      return Promise.reject(normalizeResponse(error));
    }
  },
  
  delete: async (id: number): Promise<ApiResponse> => {
    try {
      const response = await api.delete(`/tests/${id}`);
      return normalizeResponse(response);
    } catch (error: any) {
      return Promise.reject(normalizeResponse(error));
    }
  },
  
  submitAnswers: async (testId: number, data: SubmitTestFormData): Promise<ApiResponse> => {
    try {
      const response = await api.post(`/tests/${testId}/submit`, data);
      return normalizeResponse(response);
    } catch (error: any) {
      return Promise.reject(normalizeResponse(error));
    }
  },
  
  getCreateForm: async (): Promise<ApiResponse> => {
    try {
      const response = await api.get('/tests/create-form');
      return normalizeResponse(response);
    } catch (error: any) {
      return Promise.reject(normalizeResponse(error));
    }
  },
  
  getEditForm: async (id: number): Promise<ApiResponse> => {
    try {
      const response = await api.get(`/tests/${id}/edit-form`);
      return normalizeResponse(response);
    } catch (error: any) {
      return Promise.reject(normalizeResponse(error));
    }
  },
};

// Reviews API
export const reviewsAPI = {
  getAll: async (): Promise<ApiResponse> => {
    try {
      const response = await api.get('/reviews');
      return normalizeResponse(response);
    } catch (error: any) {
      return Promise.reject(normalizeResponse(error));
    }
  },
  
  getById: async (id: number): Promise<ApiResponse> => {
    try {
      const response = await api.get(`/reviews/${id}`);
      return normalizeResponse(response);
    } catch (error: any) {
      return Promise.reject(normalizeResponse(error));
    }
  },
  
  create: async (data: CreateReviewFormData): Promise<ApiResponse> => {
    try {
      const response = await api.post('/reviews', data);
      return normalizeResponse(response);
    } catch (error: any) {
      return Promise.reject(normalizeResponse(error));
    }
  },
  
  update: async (id: number, newData: Record<string, any>): Promise<ApiResponse> => {
    try {
      const response = await api.put(`/reviews/${id}/content`, newData);
      return normalizeResponse(response);
    } catch (error: any) {
      return Promise.reject(normalizeResponse(error));
    }
  },
  
  delete: async (id: number): Promise<ApiResponse> => {
    try {
      const response = await api.delete(`/reviews/${id}`);
      return normalizeResponse(response);
    } catch (error: any) {
      return Promise.reject(normalizeResponse(error));
    }
  },
  
  getCreateForm: async (): Promise<ApiResponse> => {
    try {
      const response = await api.get('/reviews/create-form');
      return normalizeResponse(response);
    } catch (error: any) {
      return Promise.reject(normalizeResponse(error));
    }
  },
  
  getEditForm: async (id: number): Promise<ApiResponse> => {
    try {
      const response = await api.get(`/reviews/${id}/edit-form`);
      return normalizeResponse(response);
    } catch (error: any) {
      return Promise.reject(normalizeResponse(error));
    }
  },
};

// Users API (Note: These endpoints might not exist in backend)
export const usersAPI = {
  getAll: async (): Promise<ApiResponse> => {
    try {
      const response = await api.get('/users');
      return normalizeResponse(response);
    } catch (error: any) {
      return {
        success: false,
        error: 'Endpoint not available',
        data: []
      };
    }
  },
  
  getById: async (id: number): Promise<ApiResponse> => {
    try {
      const response = await api.get(`/users/${id}`);
      return normalizeResponse(response);
    } catch (error: any) {
      return {
        success: false,
        error: 'Endpoint not available',
        data: null
      };
    }
  },
};

export default api;