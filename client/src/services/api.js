import axios from 'axios';

// Get base URL from environment or use relative path for production
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add sessionKey if available
api.interceptors.request.use((config) => {
  const sessionKey = localStorage.getItem('sessionKey');
  if (sessionKey && config.method === 'get') {
    config.params = { ...config.params, sessionKey };
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expired or invalid
      localStorage.removeItem('sessionKey');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;
