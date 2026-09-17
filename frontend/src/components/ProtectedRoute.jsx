import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getSessionUser } from "../api";

export default function ProtectedRoute({ children, requireSuperAdmin = false }) {
  const token = localStorage.getItem("fmt_token");
  const user = getSessionUser();
  const location = useLocation();

  if (!token || !user) return <Navigate to="/login" replace />;

  if (requireSuperAdmin && user.role !== "super_admin") {
    return <Navigate to="/" replace />;
  }

  if (user.role === "super_admin" && !location.pathname.startsWith("/superadmin")) {
    return <Navigate to="/superadmin/approvals" replace />;
  }

  const isPending = user.status === "pending" || user.status === "pending_member";

  if (isPending && location.pathname !== "/pending") {
    return <Navigate to="/pending" replace />;
  }

  if (!isPending && location.pathname === "/pending") {
    return <Navigate to="/" replace />;
  }

  return children;
}
