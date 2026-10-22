import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

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
  connect: async () => {
    const response = await api.get('/classroom/connect-url');
    if (response.data && response.data.url) {
      window.location.href = response.data.url;
      return { redirected: true };
    }
    return response.data;
  },
  connectDemo: async () => {
    const response = await api.post('/classroom/connect-demo');
    return response.data;
  },
  disconnect: async () => {
    const response = await api.post('/classroom/disconnect');
    return response.data;
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

// Faculty API endpoints (Mini Google Classroom)
export const facultyAPI = {
  getCourses: async () => {
    const response = await api.get('/faculty/courses');
    return response.data;
  },
  getAssignments: async () => {
    const response = await api.get('/faculty/assignments');
    return response.data;
  },
  createAssignment: async (data) => {
    const response = await api.post('/faculty/assignments', data);
    return response.data;
  },
  deleteAssignment: async (id) => {
    const response = await api.delete(`/faculty/assignments/${id}`);
    return response.data;
  },
  postAnnouncement: async (data) => {
    const response = await api.post('/faculty/announcements', data);
    return response.data;
  },
  getStudents: async () => {
    const response = await api.get('/faculty/students');
    return response.data;
  },
  saveAttendance: async (data) => {
    const response = await api.post('/faculty/attendance', data);
    return response.data;
  },
  getAttendanceHistory: async () => {
    const response = await api.get('/faculty/attendance');
    return response.data;
  }
};

// Admin API endpoints (Campus System Controls)
export const adminAPI = {
  getMetrics: async () => {
    const response = await api.get('/admin/metrics');
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
  broadcastNotice: async (data) => {
    const response = await api.post('/admin/broadcast', data);
    return response.data;
  },
  getSystemAudit: async () => {
    const response = await api.get('/admin/system');
    return response.data;
  }
};

export default api;
