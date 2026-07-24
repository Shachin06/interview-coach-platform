import axios from 'axios';

const api = axios.create({
  baseURL: '', // Proxied through Vite
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to append authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/api/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('userRole', response.data.role || 'user');
      localStorage.setItem('isAdmin', response.data.isAdmin === true ? 'true' : 'false');
    }
    return response.data;
  },
  register: async (username, password, email, role = 'user') => {
    const response = await api.post('/api/auth/register', { username, password, email, role });
    return response.data;
  },
  me: async () => {
    const response = await api.get('/api/auth/me');
    if (response.data) {
      localStorage.setItem('userRole', response.data.role || 'user');
      localStorage.setItem('isAdmin', response.data.isAdmin === true ? 'true' : 'false');
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAdmin');
  },
};

export const interviewAPI = {
  getQuestions: async (category, difficulty) => {
    const response = await api.get('/api/interviews/questions', {
      params: { category, difficulty },
    });
    return response.data;
  },
  startSession: async (category, difficulty) => {
    const response = await api.post('/api/interviews/start', { category, difficulty });
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get('/api/interviews/history');
    return response.data;
  },
  getSession: async (sessionId) => {
    const response = await api.get(`/api/interviews/session/${sessionId}`);
    return response.data;
  },
  submitInterview: async (sessionId, answers) => {
    const response = await api.post(`/api/interviews/submit/${sessionId}`, { answers });
    return response.data;
  },
  uploadRecording: async (sessionId, videoBlob) => {
    const formData = new FormData();
    formData.append('video', videoBlob, 'recording.webm');
    const response = await api.post(`/api/interviews/upload/${sessionId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api;
