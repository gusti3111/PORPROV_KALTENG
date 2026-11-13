import { create } from "zustand";
import { apiClient, getAPIErrorMessage } from "@/api/client";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
}

interface AuthResponsePayload {
  token: string;
  user: AdminUser;
}

interface APIEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const TOKEN_STORAGE_KEY = "porprov_admin_token";
const USER_STORAGE_KEY = "porprov_admin_user";

function loadStoredToken(): string | null {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function loadStoredUser(): AdminUser | null {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
    const raw = sessionStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

function persistAuth(token: string | null, user: AdminUser | null) {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    if (token && user) {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
      sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(USER_STORAGE_KEY);
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
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: loadStoredToken(),
  user: loadStoredUser(),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post<APIEnvelope<AuthResponsePayload>>("/auth/login", {
        email,
        password,
      });
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.error || "Gagal masuk ke akun admin");
      }
      const data = res.data.data;
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

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post<APIEnvelope<AuthResponsePayload>>("/auth/register", {
        name,
        email,
        password,
      });
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.error || "Gagal mendaftarkan akun admin");
      }
      const data = res.data.data;
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

  logout: () => {
    persistAuth(null, null);
    set({ token: null, user: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
