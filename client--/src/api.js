import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  timeout: 10000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const session = getSession();
    if (session && session.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearSession();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// LocalStorage helpers
export const saveSession = (data) => {
  localStorage.setItem('campusConnectSession', JSON.stringify(data));
};

export const getSession = () => {
  const data = localStorage.getItem('campusConnectSession');
  return data ? JSON.parse(data) : null;
};

export const clearSession = () => {
  localStorage.removeItem('campusConnectSession');
};

// Auth API endpoints
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }
};

// Classroom API endpoints
export const classroomAPI = {
  connect: () => {
    // Redirect to backend OAuth route
    window.location.href = `${baseURL}/classroom/connect`;
  },
  status: async () => {
    const response = await api.get('/classroom/status');
    return response.data;
  },
  sync: async () => {
    const response = await api.post('/classroom/sync');
    return response.data;
  }
};

export default api;
