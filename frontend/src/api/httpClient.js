import axios from 'axios';

// ----------------------------------------------------------------------
// DYNAMIC BASE URL CONFIGURATION
// ----------------------------------------------------------------------
// 1. Checks for VITE_API_URL (if using Vite)
// 2. Checks for REACT_APP_API_URL (if using Create React App)
// 3. Fallback to '/' (relative path) for Nginx or same-domain proxies
// ----------------------------------------------------------------------
const getBaseUrl = () => {
  // Uses http://localhost:4000 locally
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return '/'; // Fallback for Production/Nginx
};



// Create a configured Axios instance
const httpClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Auto-attach JWT token
httpClient.interceptors.request.use(
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

// Response Interceptor: Global error handling
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto-logout if token is invalid
      localStorage.removeItem('token');
      // Optional: Redirect to login
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default httpClient;