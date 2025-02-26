// src/utils/api.js
import axios from 'axios';

// client/src/utils/api.js
const api = axios.create({
    baseURL: '/api', // Requests go to http://localhost:5000/api via Vite proxy
  });
  
// Add JWT to requests (same as before)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;