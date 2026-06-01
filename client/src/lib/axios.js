import axios from 'axios';
import { auth } from './firebase.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15_000,
});

api.interceptors.request.use(async (config) => {
  try {
    if (auth?.currentUser) {
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch { /* continue without token */ }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ?? err.message ?? 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;