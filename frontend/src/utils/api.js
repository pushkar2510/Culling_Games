import axios from 'axios';
import { auth } from '../firebase';

// Create the axios instance pointing at the backend
const api = axios.create({
  baseURL: 'https://culling-games-backend.onrender.com/api',
});

// Automatically attach the Firebase ID token before every request.
// auth.currentUser.getIdToken() auto-refreshes the token when it's close to expiring.
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
