import axios from 'axios';
import { useUserStore } from '@/store/user.store';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const activeServiceId = useUserStore.getState().activeServiceId;
    if (activeServiceId) {
      config.headers['x-station-id'] = activeServiceId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Unwrap the unified backend envelope { success, message, data, meta }
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        useUserStore.getState().logout();
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
