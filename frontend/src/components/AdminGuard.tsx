import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    const rawPayload =
      parts.length === 2 ? parts[0] : parts.length === 3 ? parts[1] : null;
    if (!rawPayload) return true;
    const normalized = rawPayload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    const payload = JSON.parse(atob(padded)) as { exp?: number };
    if (typeof payload.exp !== "number") return false;
    return Math.floor(Date.now() / 1000) >= payload.exp;
  } catch {
    return true;
  }
}

export default function AdminGuard() {
  const { token, user, logout, checkSession } = useAuthStore();
  const location = useLocation();
  const isInvalid = !token || !user || isTokenExpired(token);

  useEffect(() => {
    if (isInvalid) {
      if (token || user) {
        logout();
      }
      return;
    }
    void checkSession();
  }, [isInvalid, token, user, logout, checkSession]);

  if (isInvalid) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
