import { create } from "zustand";
import axios from "axios";
import { apiClient, getAPIErrorMessage } from "@/api/client";

export interface AdminUser {
  id: number;
  username?: string;
  name?: string;
  email: string;
  role: string;
  created_at?: string;
}

interface AuthResponsePayload {
  token: string;
  user: AdminUser;
}

interface ForgotPasswordResponse {
  message?: string;
  reset_token?: string;
}

interface ResetPasswordResponse {
  message?: string;
}

type MaybeEnvelope<T> =
  | T
  | {
      success?: boolean;
      data?: T;
      error?: string;
      message?: string;
    };

const TOKEN_STORAGE_KEY = "porprov_admin_token";
const USER_STORAGE_KEY = "porprov_admin_user";

function unwrapPayload<T extends object>(raw: MaybeEnvelope<T>): T {
  if (raw && typeof raw === "object" && "data" in raw && raw.data !== undefined) {
    if ("success" in raw && raw.success === false) {
      throw new Error(raw.error || raw.message || "Permintaan gagal.");
    }
    return raw.data;
  }
  return raw as T;
}

function loadStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function loadStoredUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

function persistAuth(token: string | null, user: AdminUser | null) {
  try {
    if (token && user) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors in restricted environments
  }
}

interface AuthState {
  token: string | null;
  user: AdminUser | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  checkSession: () => Promise<boolean>;
  forgotPassword: (email: string) => Promise<ForgotPasswordResponse>;
  resetPassword: (
    token: string,
    newPassword: string,
  ) => Promise<ResetPasswordResponse>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: loadStoredToken(),
  user: loadStoredUser(),
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post<MaybeEnvelope<AuthResponsePayload>>(
        "/login",
        { username, password },
      );
      const data = unwrapPayload(res.data);
      if (!data?.token || !data?.user) {
        throw new Error("Respons login tidak valid.");
      }
      persistAuth(data.token, data.user);
      set({
        token: data.token,
        user: data.user,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const message = getAPIErrorMessage(err);
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  register: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post<MaybeEnvelope<AuthResponsePayload>>(
        "/register",
        { username, email, password },
      );
      const data = unwrapPayload(res.data);
      if (!data?.token || !data?.user) {
        throw new Error("Respons registrasi tidak valid.");
      }
      persistAuth(data.token, data.user);
      set({
        token: data.token,
        user: data.user,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const message = getAPIErrorMessage(err);
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  checkSession: async () => {
    const token = get().token || loadStoredToken();
    if (!token) {
      persistAuth(null, null);
      set({ token: null, user: null });
      return false;
    }
    try {
      const res = await apiClient.get<MaybeEnvelope<{ user?: AdminUser } | AdminUser>>("/me");
      const raw = unwrapPayload(res.data);
      const meUser =
        raw && typeof raw === "object" && "user" in raw && raw.user
          ? raw.user
          : (raw as AdminUser);
      if (meUser && typeof meUser === "object" && "id" in meUser) {
        persistAuth(token, meUser);
        set({ token, user: meUser });
      }
      return true;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        persistAuth(null, null);
        set({ token: null, user: null });
        return false;
      }
      return true;
    }
  },

  forgotPassword: async (email) => {
    const res = await apiClient.post<MaybeEnvelope<ForgotPasswordResponse>>(
      "/forgot-password",
      { email },
    );
    return unwrapPayload(res.data);
  },

  resetPassword: async (token, newPassword) => {
    const res = await apiClient.post<MaybeEnvelope<ResetPasswordResponse>>(
      "/reset-password",
      { token, new_password: newPassword },
    );
    return unwrapPayload(res.data);
  },

  logout: () => {
    persistAuth(null, null);
    set({
      token: null,
      user: null,
      isLoading: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
