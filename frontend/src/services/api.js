import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("msac_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 — token expired → clear session and redirect
const AUTH_PAGES = ["/login", "/register"];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isOnAuthPage = AUTH_PAGES.some((p) => currentPath.startsWith(p));

      if (!isOnAuthPage) {
        localStorage.removeItem("msac_token");
        localStorage.removeItem("msac_user");
        // Preserve where the user was trying to go so we can redirect after login
        const returnTo = encodeURIComponent(currentPath + window.location.search);
        window.location.href = `/login?returnTo=${returnTo}`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
