import axios from 'axios';

// Create a configured Axios instance
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_NODE_API || 'http://localhost:4000',
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

// Response Interceptor: Global error handling (optional but good for debugging)
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto-logout if token is invalid
      localStorage.removeItem('token');
      // window.location.href = '/login'; // Optional: Redirect to login
    }
    return Promise.reject(error);
  }
);

export default httpClient;