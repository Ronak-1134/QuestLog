import axios from 'axios';
import { auth } from './firebase.js';

/**
 * AXIOS INSTANCE
 * Using '/api' as the baseURL triggers the Vite proxy, 
 * resolving cross-origin issues automatically.
 */
const api = axios.create({
  baseURL: '/api', 
  timeout: 10_000,
});

/**
 * REQUEST INTERCEPTOR
 * Automatically attaches the Firebase ID Token to every outgoing request
 * if a user is currently signed in.
 */
api.interceptors.request.use(async (config) => {
  try {
    // Check if Firebase auth has a currently logged-in user
    if (auth?.currentUser) {
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    // If auth is not ready or fails, we continue without the token
    console.warn('Auth interceptor error:', error.message);
  }
  return config;
});

/**
 * RESPONSE INTERCEPTOR
 * Standardizes error messages across the application.
 */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ?? err.message ?? 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;