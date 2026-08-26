import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Spring Boot backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally (e.g., redirect on 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Do not redirect if the failure was a login attempt
      if (error.config.url !== '/auth/login') {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.href = '/'; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;
