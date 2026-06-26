import axios from "axios";

// --- Configuration ---
// In production, fallback to your Render backend URL if env var is missing
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://event-management-0qtg.onrender.com/api"
    : "http://localhost:5000/api");

// --- Log the base URL (helps debugging) ---
console.log("🔗 API Base URL:", API_BASE_URL);

// --- Create client ---
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ============================================================
// 🚀 REQUEST INTERCEPTOR – Add token & log
// ============================================================
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`🌐 ${config.method.toUpperCase()} ${config.url}`, config.data || "");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// 📦 RESPONSE INTERCEPTOR – Handle errors & token expiry
// ============================================================
apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} – ${response.status}`);
    }
    return response;
  },
  async (error) => {
    if (!error.response) {
      console.error("❌ Network error or no response from server:", error.message);
      error.userMessage = "Unable to reach the server. Please check your internet connection.";
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    if (status === 403) {
      error.userMessage = "You do not have permission to perform this action.";
    } else if (status === 404) {
      error.userMessage = "The requested resource was not found.";
    } else if (status === 422 && data?.message) {
      error.userMessage = data.message;
    } else if (status >= 500) {
      error.userMessage = "A server error occurred. Please try again later.";
    }

    if (!error.userMessage) {
      error.userMessage = data?.message || "An unexpected error occurred.";
    }

    console.error(`❌ API Error ${status}:`, error.userMessage, error.response?.data);
    return Promise.reject(error);
  }
);

// ============================================================
// 🔁 Retry utility
// ============================================================
export const retryRequest = async (requestFn, retries = 2, delay = 1000) => {
  try {
    return await requestFn();
  } catch (error) {
    if (retries === 0) throw error;
    if (!error.response || error.response.status >= 500) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryRequest(requestFn, retries - 1, delay * 2);
    }
    throw error;
  }
};

// ============================================================
// 🔄 Token refresh helper (stub)
// ============================================================
export const refreshAuthToken = async () => {
  throw new Error("Token refresh not implemented");
};

export default apiClient;