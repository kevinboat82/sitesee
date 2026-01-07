// src/api.js
import axios from 'axios';

// Automatically chooses the right server
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
});

export default api;