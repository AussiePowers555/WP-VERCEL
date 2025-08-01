import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  changePassword: (data) => api.post('/auth/change-password', data),
  setPassword: (data) => api.post('/auth/set-password', data),
};

export const casesAPI = {
  getAll: () => api.get('/cases'),
  getById: (id) => api.get(`/cases/${id}`),
  getByCaseNumber: (caseNumber) => api.get(`/cases/by-number/${caseNumber}`),
  create: (data) => api.post('/cases', data),
  update: (id, data) => api.put(`/cases/${id}`, data),
  delete: (id) => api.delete(`/cases/${id}`),
  getInteractions: (id) => api.get(`/cases/${id}/interactions`),
  createInteraction: (id, data) => api.post(`/cases/${id}/interactions`, data),
  deleteAll: () => api.delete('/cases/delete-all'),
  createMock: () => api.post('/cases/create-mock'),
};

export const contactsAPI = {
  getAll: () => api.get('/contacts'),
  create: (data) => api.post('/contacts', data),
};

export const workspacesAPI = {
  getAll: () => api.get('/workspaces'),
  getById: (id) => api.get(`/workspaces/${id}`),
  create: (data) => api.post('/workspaces', data),
  update: (id, data) => api.put(`/workspaces/${id}`, data),
  delete: (id) => api.delete(`/workspaces/${id}`),
};

export const bikesAPI = {
  getAll: () => api.get('/bikes'),
  getById: (id) => api.get(`/bikes/${id}`),
  create: (data) => api.post('/bikes', data),
  update: (id, data) => api.put(`/bikes/${id}`, data),
  delete: (id) => api.delete(`/bikes/${id}`),
};

export const usersAPI = {
  getAll: () => api.get('/users'),
};

export const interactionsAPI = {
  getAll: () => api.get('/interactions'),
  create: (data) => api.post('/interactions', data),
};

export const signatureAPI = {
  submit: (data) => api.post('/signature/submit', data),
  validateToken: (data) => api.post('/signature/validate-token', data),
  createDocument: (data) => api.post('/signature/create-document', data),
  getRentalDetails: (caseId) => api.get(`/signature/rental-details/${caseId}`),
};

export const documentsAPI = {
  getForCase: (caseId) => api.get(`/documents/${caseId}`),
  getDocument: (caseId, documentId) => api.get(`/documents/${caseId}/${documentId}`),
  uploadSigned: (data) => api.post('/documents/upload-signed', data),
  sendForSignature: (data) => api.post('/documents/send-for-signature', data),
};

export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;