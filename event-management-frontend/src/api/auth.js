import apiClient from "./axios";

// ---- Auth functions ----
export const login = async (email, password) => {
  const response = await apiClient.post("/auth/login", { email, password });
  const payload = response.data?.data || {};
  if (payload.token) {
    localStorage.setItem("token", payload.token);
    localStorage.setItem("user", JSON.stringify(payload.user));
    return payload;
  }
  throw new Error(response.data?.message || "Authentication failed");
};

export const register = async (userData) => {
  const response = await apiClient.post("/auth/register", userData);
  return response.data?.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    localStorage.removeItem("user");
    return null;
  }

  try {
    const response = await apiClient.get("/auth/me");
    if (response.data?.success) {
      localStorage.setItem("user", JSON.stringify(response.data.data));
      return response.data.data;
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }
};

// ---- Profile management ----

/**
 * Update user profile (name and/or email)
 * @param {string} name - New full name
 * @param {string} email - New email address
 * @returns {Promise<Object>} Updated user object
 */
export const updateProfile = async (name, email) => {
  const response = await apiClient.put("/auth/profile", { name, email });
  if (response.data?.success) {
    const updatedUser = response.data.data;
    // Update stored user in localStorage
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const mergedUser = { ...storedUser, ...updatedUser };
    localStorage.setItem("user", JSON.stringify(mergedUser));
    return mergedUser;
  }
  throw new Error(response.data?.message || "Failed to update profile");
};

/**
 * Change password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password (min 6 chars)
 * @returns {Promise<Object>} Success message
 */
export const changePassword = async (currentPassword, newPassword) => {
  const response = await apiClient.put("/auth/password", { currentPassword, newPassword });
  if (response.data?.success) {
    return response.data;
  }
  throw new Error(response.data?.message || "Failed to change password");
};