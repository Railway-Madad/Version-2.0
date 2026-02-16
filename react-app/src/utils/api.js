import axios from 'axios';

// Create axios instance with default config for cookie-based auth
const api = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true, // Always send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
