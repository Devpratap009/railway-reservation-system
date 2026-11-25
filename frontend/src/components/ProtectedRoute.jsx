import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page auth-loading">
        <div className="loading-orbit" />
        <p className="subtitle">Checking your session...</p>
      </div>
    );
  }

  if (!user) {
    const portal = allowedRoles?.includes("admin") && !allowedRoles.includes("user")
      ? "admin"
      : "user";
    return <Navigate to={`/login/${portal}`} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;
  }

  return children;
}
