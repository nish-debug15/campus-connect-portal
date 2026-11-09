import axios from 'axios';
import {
  MOCK_NOTICES,
  MOCK_COURSES,
  MOCK_ASSIGNMENTS,
  MOCK_ATTENDANCE,
  MOCK_ADMIN_METRICS,
  MOCK_USERS_LIST,
  MOCK_SYSTEM_AUDIT
} from './mockData';

export const getBaseURL = () => {
  // 1. Check custom configured backend URL in localStorage
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('campus_connect_api_url');
    if (custom) return custom.replace(/\/+$/, '');
  }

  // 2. Check environment variable VITE_API_URL
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }

  // 3. In production, default to relative '/api' (works automatically when hosted on Render)
  if (import.meta.env.PROD) {
    return '/api';
  }

  // 4. In local development, default to local Express port
  return 'http://127.0.0.1:5000/api';
};

export const setCustomBaseURL = (url) => {
  if (!url) {
    localStorage.removeItem('campus_connect_api_url');
  } else {
    let clean = url.trim().replace(/\/+$/, '');
    if (!clean.endsWith('/api') && !clean.includes('/api/')) {
      clean = `${clean}/api`;
    }
    localStorage.setItem('campus_connect_api_url', clean);
  }
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000, // 60 seconds to accommodate cloud server cold starts
});

// Request interceptor to attach JWT token and ensure dynamic baseURL
api.interceptors.request.use(
  (config) => {
    config.baseURL = getBaseURL();
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
  (response) => {
    // If the response is HTML (e.g. Vercel SPA rewrite fallback returning index.html for missing /api endpoints)
    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE')) {
      const err = new Error('API endpoint returned HTML (backend not connected)');
      err.isHtmlResponse = true;
      return Promise.reject(err);
    }
    return response;
  },
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

export const isDemoSession = () => {
  const session = getSession();
  return session?.token === 'mock-jwt-token-demo' || localStorage.getItem('campus_connect_demo_mode') === 'true';
};

// Auth API endpoints
export const authAPI = {
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (err) {
      // If offline or HTML response, provide instant fallback user
      if (err.isHtmlResponse || err.message?.includes('Network Error') || err.code === 'ERR_NETWORK') {
        const fallbackUser = {
          id: `demo-${Date.now()}`,
          _id: `demo-${Date.now()}`,
          name: userData.name,
          email: userData.email,
          role: userData.role || 'student',
          usn: userData.usn || '1RV22CS999',
          branch: userData.branch || 'SoCSE',
          year: userData.year || '1',
          empId: userData.empId || 'RVU-DEV-01',
          department: userData.department || 'SoCSE',
          createdAt: new Date().toISOString()
        };
        return { token: 'mock-jwt-token-demo', user: fallbackUser, isDemo: true };
      }
      throw err;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (err) {
      // If the backend returned HTML or is unreachable, check if credentials match preloaded RVU users
      if (err.isHtmlResponse || err.message?.includes('Network Error') || err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
        const found = MOCK_USERS_LIST.find((u) => u.email.toLowerCase() === credentials.email?.toLowerCase());
        if (found) {
          return {
            token: 'mock-jwt-token-demo',
            user: found,
            isDemo: true,
            demoNotice: 'Logged in using Instant Offline Demo Mode.'
          };
        }
      }
      throw err;
    }
  },

  loginDemo: (role = 'student') => {
    let user;
    if (role === 'admin') {
      user = MOCK_USERS_LIST.find((u) => u.role === 'admin');
    } else if (role === 'faculty') {
      user = MOCK_USERS_LIST.find((u) => u.role === 'faculty');
    } else {
      user = MOCK_USERS_LIST.find((u) => u.role === 'student');
    }
    const sessionData = {
      token: 'mock-jwt-token-demo',
      user,
      role: user.role,
      isDemo: true
    };
    saveSession(sessionData);
    localStorage.setItem('campus_connect_demo_mode', 'true');
    return sessionData;
  },

  checkHealth: async (customUrl = null) => {
    let target = customUrl || getBaseURL();
    target = target.replace(/\/+$/, '');
    const healthUrl = target.endsWith('/api') ? `${target}/health` : `${target}/api/health`;
    const response = await axios.get(healthUrl, { timeout: 15000 });
    return response.data;
  }
};

// Classroom API endpoints
export const classroomAPI = {
  connect: async () => {
    try {
      const response = await api.get('/classroom/connect-url');
      if (response.data && response.data.url) {
        window.location.href = response.data.url;
        return { redirected: true };
      }
      return response.data;
    } catch (e) {
      return { connected: true, isDemo: true };
    }
  },
  connectDemo: async () => {
    try {
      const response = await api.post('/classroom/connect-demo');
      return response.data;
    } catch (e) {
      return { connected: true, isDemo: true };
    }
  },
  disconnect: async () => {
    try {
      const response = await api.post('/classroom/disconnect');
      return response.data;
    } catch (e) {
      return { connected: false };
    }
  },
  status: async () => {
    try {
      const response = await api.get('/classroom/status');
      return response.data;
    } catch (e) {
      return { connected: true, isDemo: true };
    }
  },
  sync: async () => {
    try {
      const response = await api.post('/classroom/sync');
      return response.data;
    } catch (e) {
      return {
        courses: MOCK_COURSES,
        assignments: MOCK_ASSIGNMENTS,
        notices: MOCK_NOTICES,
        isDemo: true
      };
    }
  },
  submitAssignment: async (id, data) => {
    try {
      const response = await api.post(`/classroom/assignments/${id}/submit`, data);
      return response.data;
    } catch (e) {
      return {
        success: true,
        submission: {
          submissionText: data.submissionText,
          submissionLink: data.submissionLink,
          submittedAt: new Date().toISOString()
        }
      };
    }
  },
  getSubmission: async (id) => {
    try {
      const response = await api.get(`/classroom/assignments/${id}/submission`);
      return response.data;
    } catch (e) {
      return { submission: null };
    }
  },
  getAttendance: async () => {
    try {
      const response = await api.get('/classroom/attendance');
      return response.data;
    } catch (e) {
      return MOCK_ATTENDANCE;
    }
  }
};

// Faculty API endpoints (Mini Google Classroom)
export const facultyAPI = {
  getCourses: async () => {
    try {
      const response = await api.get('/faculty/courses');
      return response.data;
    } catch (e) {
      return { courses: MOCK_COURSES.slice(0, 3) };
    }
  },
  getAssignments: async () => {
    try {
      const response = await api.get('/faculty/assignments');
      return response.data;
    } catch (e) {
      return { assignments: MOCK_ASSIGNMENTS };
    }
  },
  createAssignment: async (data) => {
    try {
      const response = await api.post('/faculty/assignments', data);
      return response.data;
    } catch (e) {
      return {
        assignment: {
          id: `assn-${Date.now()}`,
          _id: `assn-${Date.now()}`,
          ...data,
          status: 'Assigned'
        }
      };
    }
  },
  deleteAssignment: async (id) => {
    try {
      const response = await api.delete(`/faculty/assignments/${id}`);
      return response.data;
    } catch (e) {
      return { success: true };
    }
  },
  getAssignmentSubmissions: async (id) => {
    try {
      const response = await api.get(`/faculty/assignments/${id}/submissions`);
      return response.data;
    } catch (e) {
      return { submissions: [] };
    }
  },
  gradeSubmission: async (id, data) => {
    try {
      const response = await api.post(`/faculty/submissions/${id}/grade`, data);
      return response.data;
    } catch (e) {
      return { success: true };
    }
  },
  postAnnouncement: async (data) => {
    try {
      const response = await api.post('/faculty/announcements', data);
      return response.data;
    } catch (e) {
      return {
        announcement: {
          id: `notice-${Date.now()}`,
          _id: `notice-${Date.now()}`,
          ...data,
          date: 'Just now'
        }
      };
    }
  },
  getStudents: async () => {
    try {
      const response = await api.get('/faculty/students');
      return response.data;
    } catch (e) {
      return { students: MOCK_USERS_LIST.filter((u) => u.role === 'student') };
    }
  },
  saveAttendance: async (data) => {
    try {
      const response = await api.post('/faculty/attendance', data);
      return response.data;
    } catch (e) {
      return { success: true };
    }
  },
  getAttendanceHistory: async () => {
    try {
      const response = await api.get('/faculty/attendance');
      return response.data;
    } catch (e) {
      return { attendance: [] };
    }
  }
};

// Admin API endpoints (Campus System Controls)
export const adminAPI = {
  getMetrics: async () => {
    try {
      const response = await api.get('/admin/metrics');
      return response.data;
    } catch (e) {
      return { metrics: MOCK_ADMIN_METRICS };
    }
  },
  getUsers: async () => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (e) {
      return { users: MOCK_USERS_LIST };
    }
  },
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      return response.data;
    } catch (e) {
      return { success: true };
    }
  },
  broadcastNotice: async (data) => {
    try {
      const response = await api.post('/admin/broadcast', data);
      return response.data;
    } catch (e) {
      return {
        notice: {
          id: `notice-${Date.now()}`,
          _id: `notice-${Date.now()}`,
          ...data,
          date: 'Just now'
        }
      };
    }
  },
  getSystemAudit: async () => {
    try {
      const response = await api.get('/admin/system');
      return response.data;
    } catch (e) {
      return { system: MOCK_SYSTEM_AUDIT };
    }
  }
};

export default api;
