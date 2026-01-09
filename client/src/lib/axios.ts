import axios from 'axios';

// Set base URL for API calls
// Vite injects env via import.meta; cast to any to satisfy TS in non-Vite contexts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const API_URL = (import.meta as any)?.env?.VITE_API_URL || '';
if (API_URL) {
  axios.defaults.baseURL = API_URL;
}

// Derive allowed origin for absolute URLs
let apiOrigin: string | null = null;
try {
  apiOrigin = API_URL ? new URL(API_URL).origin : window.location.origin;
} catch {
  apiOrigin = null;
}

// Add a request interceptor to automatically include the auth token
axios.interceptors.request.use(
  (config) => {
    // Only add auth token for internal API calls (not external APIs)
    const url = config.url || '';
    const isAbsolute = /^https?:\/\//i.test(url);
    const isSameOrigin =
      isAbsolute && apiOrigin ? new URL(url).origin === apiOrigin : false;
    const isInternalAPI = (!isAbsolute && url.startsWith('/api')) || isSameOrigin;

    if (isInternalAPI) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401 errors from internal API calls
    const url = error.config?.url || '';
    const isAbsolute = /^https?:\/\//i.test(url);
    const isSameOrigin =
      isAbsolute && apiOrigin ? new URL(url).origin === apiOrigin : false;
    const isInternalAPI = (!isAbsolute && url.startsWith('/api')) || isSameOrigin;

    if (error.response?.status === 401 && isInternalAPI) {
      // Token is invalid or expired
      localStorage.removeItem('token');
      // Only redirect to login if not already on login/register pages
      if (!window.location.pathname.match(/^\/(login|register)/)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
