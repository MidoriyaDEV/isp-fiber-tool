import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BACKEND_API || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;