import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole?: "student" | "mentor";
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const token = localStorage.getItem("authToken");
  const userRole = localStorage.getItem("userRole");

  // 1. If not authenticated, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Role-based redirect if user tries to access wrong dashboard
  if (allowedRole && userRole && userRole !== allowedRole) {
    if (userRole === "mentor") {
      return <Navigate to="/mentor-dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("authToken");
  const userRole = localStorage.getItem("userRole");

  if (token) {
    if (userRole === "mentor") {
      return <Navigate to="/mentor-dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
