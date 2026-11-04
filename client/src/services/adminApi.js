import axios from 'axios';

// Get base URL from environment or use relative path for production
const BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/admin` 
  : '/api/admin';

// Create axios instance for admin API calls
const adminApi = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add JWT token
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

// Admin API methods
export const adminApiService = {
  // Authentication
  login: async (email, password) => {
    const response = await adminApi.post('/login', { email, password });
    return response.data;
  },

  // Analytics
  getOverviewStats: async () => {
    const response = await adminApi.get('/stats/overview');
    return response.data;
  },

  getBoxStats: async () => {
    const response = await adminApi.get('/stats/boxes');
    return response.data;
  },

  getLanguageTrends: async () => {
    const response = await adminApi.get('/stats/language-trend');
    return response.data;
  },

  // Sessions
  getSessions: async (page = 1, limit = 50, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await adminApi.get('/sessions', { params });
    return response.data;
  },

  deleteSession: async (id) => {
    const response = await adminApi.delete(`/sessions/${id}`);
    return response.data;
  },

  // Boxes CRUD
  getBoxes: async () => {
    const response = await adminApi.get('/boxes');
    return response.data;
  },

  createBox: async (boxData) => {
    const response = await adminApi.post('/boxes', boxData);
    return response.data;
  },

  updateBox: async (id, boxData) => {
    const response = await adminApi.put(`/boxes/${id}`, boxData);
    return response.data;
  },

  deleteBox: async (id) => {
    const response = await adminApi.delete(`/boxes/${id}`);
    return response.data;
  },

  // Languages Management
  getLanguages: async () => {
    const response = await adminApi.get('/languages');
    return response.data;
  },

  addLanguage: async (languageData) => {
    const response = await adminApi.post('/languages', languageData);
    return response.data;
  },

  updateLanguage: async (code, updates) => {
    const response = await adminApi.put(`/languages/${code}`, updates);
    return response.data;
  },

  getLanguageByCode: async (code) => {
    const response = await adminApi.get(`/languages/${code}`);
    return response.data;
  },

  updateLanguageQuickGuide: async (code, quickGuideData) => {
    const response = await adminApi.put(`/languages/${code}/quick-guide`, quickGuideData);
    return response.data;
  },

  // Box Translations
  getBoxTranslations: async (boxId) => {
    const response = await adminApi.get(`/languages/box/${boxId}`);
    return response.data;
  },

  saveBoxTranslation: async (boxId, translationData) => {
    const response = await adminApi.post(`/languages/box/${boxId}/translation`, translationData);
    return response.data;
  },

  deleteBoxTranslation: async (boxId, languageCode) => {
    const response = await adminApi.delete(`/languages/box/${boxId}/translation/${languageCode}`);
    return response.data;
  },

  // Export
  exportCSV: async () => {
    const response = await adminApi.get('/export/csv', {
      responseType: 'blob'
    });
    return response.data;
  },

  // File Uploads
  uploadBoxFiles: async (formData) => {
    const response = await adminApi.post('/boxes/upload-files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  uploadTranslationAudio: async (boxId, formData) => {
    const response = await adminApi.post(`/boxes/${boxId}/upload-translation-audio`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  deleteFile: async (filePath) => {
    const response = await adminApi.delete('/boxes/files', {
      data: { filePath }
    });
    return response.data;
  }
};


export default adminApi;
