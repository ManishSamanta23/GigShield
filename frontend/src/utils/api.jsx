import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('gigshield_worker');
  if (stored) {
    const { token } = JSON.parse(stored);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
