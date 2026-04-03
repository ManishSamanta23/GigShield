import axios from 'axios';

/**
 * API Service:
 * Base Axios instance configured for the Avaran backend. 
 * Includes an interceptor to append JWT credentials to outgoing requests.
 */
const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('avaran_worker');
  if (stored) {
    const { token } = JSON.parse(stored);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
