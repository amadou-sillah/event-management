import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/auth-context";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}