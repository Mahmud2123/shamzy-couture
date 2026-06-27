// // src/services/api.ts
// import axios from 'axios';

// // VITE_API_URL already has /api at the end (from Vercel env)
// // Or use localhost for development
// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
//   headers: { 
//     'Content-Type': 'application/json' 
//   },
//   withCredentials: true,
// });

// // Request interceptor - add auth token
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('shamzy_token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Response interceptor - handle 401 errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('shamzy_token');
//       localStorage.removeItem('shamzy_user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;


// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: { 
    'Content-Type': 'application/json' 
  },
  // Temporarily remove withCredentials
  // withCredentials: true,
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shamzy_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('shamzy_token');
      localStorage.removeItem('shamzy_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;