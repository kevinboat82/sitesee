// src/api.js
import axios from 'axios';

// 1. Point to your Render Backend
const api = axios.create({
  baseURL: 'https://sitesee-api.onrender.com/api',
});

// 2. Automatically add the Token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;