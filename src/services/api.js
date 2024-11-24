import axios from 'axios';
import { API_ROUTES } from '../config/endpoints';

// Configure axios defaults
const api = axios.create({
  baseURL: '',  // Empty baseURL since we're using relative paths
  timeout: 30000  // Increased timeout for video processing
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.url}`, config);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      error: error.message
    });
    return Promise.reject(error);
  }
);

export const apiService = {
  async getFeatures() {
    return api.get(API_ROUTES.features);
  },

  async getStatus() {
    return api.get(API_ROUTES.status);
  },

  async getModelStatus() {
    return api.get(API_ROUTES.modelStatus);
  },

  async loadModel() {
    return api.get(API_ROUTES.modelLoad);
  },

  async post(url, data) {
    return api.post(url, data);
  }
};