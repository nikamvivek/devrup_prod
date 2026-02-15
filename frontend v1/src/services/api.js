// src/services/api.js
import axios from 'axios';

// Create axios instance with default config
// Using a hardcoded default instead of process.env to avoid reference errors
const instance = axios.create({
  // baseURL: 'http://localhost:8000/',
  baseURL: 'https://devrup.in/',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor to add auth token to requests
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Create a new instance without interceptors to avoid infinite loop
          const refreshResponse = await axios.post(
            `${instance.defaults.baseURL}/api/auth/token/refresh/`,
            { refresh: refreshToken }
          );
          
          const { access } = refreshResponse.data;
          
          // Update tokens
          localStorage.setItem('token', access);
          
          // Update Authorization header
          originalRequest.headers.Authorization = `Bearer ${access}`;
          
          // Retry the original request
          return instance(originalRequest);
        }
      } catch (refreshError) {
        // If refresh token is invalid, clear localStorage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default instance;