import axios from 'axios';

const BASE = (import.meta as any).env?.VITE_API_URL || '';

export const api = axios.create({
  baseURL: `${BASE}/api`,
  withCredentials: true,
});

// Inject access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE}/api/auth/refresh`, { refreshToken });
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          error.config.headers.Authorization = `Bearer ${data.access}`;
          return api(error.config);
        } catch {
          // fallback to auto-login
        }
      }
      try {
        const { data } = await axios.post(`${BASE}/api/auth/login`, {
          email: 'alex@demo.local',
          password: 'Demo1234!',
        });
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        error.config.headers.Authorization = `Bearer ${data.access}`;
        return api(error.config);
      } catch {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
