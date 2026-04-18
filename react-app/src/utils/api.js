import axios from 'axios';
import { API_BASE } from './env';

// Create axios instance with default config for cookie-based auth
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Always send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
