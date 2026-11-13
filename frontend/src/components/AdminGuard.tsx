import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64)) as { exp?: number };
    if (typeof payload.exp !== "number") return false;
    return Math.floor(Date.now() / 1000) >= payload.exp;
  } catch {
    return true;
  }
}

export default function AdminGuard() {
  const { token, user, logout } = useAuthStore();
  const location = useLocation();
  const isInvalid = !token || !user || isTokenExpired(token);

  useEffect(() => {
    if (isInvalid && (token || user)) {
      logout();
    }
  }, [isInvalid, token, user, logout]);

  if (isInvalid) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

