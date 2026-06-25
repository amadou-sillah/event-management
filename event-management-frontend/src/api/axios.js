import axios from "axios";

// --- Configuration ---
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// --- Create client ---
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // withCredentials: false, // Do NOT set true unless you use cookies/sessions (we use JWT)
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

    // (Optional) Log outgoing requests for debugging
    if (process.env.NODE_ENV === "development") {
      console.log(`🌐 ${config.method.toUpperCase()} ${config.url}`, config.data || "");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================
// 📦 RESPONSE INTERCEPTOR – Handle errors & token expiry
// ============================================================
apiClient.interceptors.response.use(
  (response) => {
    // (Optional) Log successful responses
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} – ${response.status}`);
    }
    return response;
  },
  async (error) => {
    // --- Network or timeout error ---
    if (!error.response) {
      // This covers network down, CORS, timeout, etc.
      console.error("❌ Network error or no response from server:", error.message);
      // Customize the error object so the UI can show a friendly message
      error.userMessage = "Unable to reach the server. Please check your internet connection.";
      return Promise.reject(error);
    }

    // --- HTTP error responses ---
    const { status, data } = error.response;

    // 401 Unauthorized → clear token and redirect to login
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Avoid redirect loop: only redirect if not already on login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // 403 Forbidden → user lacks permissions
    if (status === 403) {
      error.userMessage = "You do not have permission to perform this action.";
    }

    // 404 Not Found
    if (status === 404) {
      error.userMessage = "The requested resource was not found.";
    }

    // 422 Validation error – keep the server message
    if (status === 422 && data?.message) {
      error.userMessage = data.message;
    }

    // 500 Internal Server Error
    if (status >= 500) {
      error.userMessage = "A server error occurred. Please try again later.";
    }

    // If no specific userMessage was set, use the server message or fallback
    if (!error.userMessage) {
      error.userMessage = data?.message || "An unexpected error occurred.";
    }

    // Log the error for debugging
    console.error(`❌ API Error ${status}:`, error.userMessage, error.response?.data);

    return Promise.reject(error);
  }
);

// ============================================================
// 🔁 (Optional) Simple retry utility – can be imported separately
// ============================================================
export const retryRequest = async (requestFn, retries = 2, delay = 1000) => {
  try {
    return await requestFn();
  } catch (error) {
    if (retries === 0) throw error;
    // Only retry on network errors (no response) or 5xx
    if (!error.response || error.response.status >= 500) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryRequest(requestFn, retries - 1, delay * 2);
    }
    throw error;
  }
};

// ============================================================
// 🔄 Token refresh helper (stub – implement if you use refresh tokens)
// ============================================================
export const refreshAuthToken = async () => {
  // Example: call your refresh endpoint
  // const refreshToken = localStorage.getItem("refreshToken");
  // if (!refreshToken) throw new Error("No refresh token");
  // const response = await apiClient.post("/auth/refresh", { refreshToken });
  // localStorage.setItem("token", response.data.token);
  // return response.data.token;
  throw new Error("Token refresh not implemented");
};

export default apiClient;