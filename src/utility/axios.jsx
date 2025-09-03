import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BACKEND_API || 'http://45.225.251.14:5003/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;