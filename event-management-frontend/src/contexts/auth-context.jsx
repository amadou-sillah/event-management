import React, { createContext, useState, useEffect, useContext } from "react";
import { getCurrentUser, logout as logoutService } from "../api/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const logout = () => {
    logoutService();
    setUser(null);
  };

  const value = {
    user,
    setUser,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};