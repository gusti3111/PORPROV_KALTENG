import axios from "axios";

type APIErrorPayload = string | { code?: number | string; message?: string };

type APIResponse<T> = {
  success: boolean;
  data?: T;
  error?: APIErrorPayload;
};

function extractAPIErrorText(err: unknown): string | undefined {
  if (typeof err === "string") {
    return err.trim() || undefined;
  }
  if (err && typeof err === "object") {
    const maybeMessage = (err as { message?: unknown }).message;
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return maybeMessage.trim();
    }
    try {
      return JSON.stringify(err);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "/api/v1"
).replace(/\/$/, "");

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  try {
    const token = sessionStorage.getItem("porprov_admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Ignore storage errors
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url || "";
      if (!url.includes("/auth/login") && !url.includes("/auth/register")) {
        try {
          sessionStorage.removeItem("porprov_admin_token");
          sessionStorage.removeItem("porprov_admin_user");
        } catch {
          // Ignore storage errors
        }
        if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
          window.location.replace("/admin/login");
        }
      }
    }
    return Promise.reject(error);
  },
);

export function getAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...(extra ?? {}) };
  try {
    const token = sessionStorage.getItem("porprov_admin_token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Ignore storage errors
  }
  return headers;
}

export async function getAPIData<T>(path: string): Promise<T> {
  const response = await apiClient.get<APIResponse<T>>(path);
  if (!response.data.success || response.data.data === undefined) {
    throw new Error(
      extractAPIErrorText(response.data.error) || "API mengembalikan respons yang tidak valid.",
    );
  }
  return response.data.data;
}

export function getAPIErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ error?: APIErrorPayload; message?: string }>(error)) {
    return (
      extractAPIErrorText(error.response?.data?.error) ||
      extractAPIErrorText(error.response?.data?.message) ||
      error.message ||
      "Tidak dapat menghubungi server."
    );
  }
  return error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui.";
}
