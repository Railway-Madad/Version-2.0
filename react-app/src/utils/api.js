import axios from 'axios';

// Create axios instance with default config for cookie-based auth
const api = axios.create({
  baseURL: 'https://version-2-0-ed6g.onrender.com',
  withCredentials: true, // Always send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
