import { create } from "zustand";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

// ── Helpers ──────────────────────────────────────────────

const getSavedUser = (): User | null => {
  try {
    // Try localStorage first
    const fromLocal = localStorage.getItem("user");
    if (fromLocal) return JSON.parse(fromLocal);

    // Fallback: try sessionStorage
    const fromSession = sessionStorage.getItem("user");
    if (fromSession) return JSON.parse(fromSession);

    return null;
  } catch {
    return null;
  }
};

const getSavedToken = (): string | null => {
  try {
    // Try localStorage first
    const fromLocal = localStorage.getItem("token");
    if (fromLocal) return fromLocal;

    // Fallback: try sessionStorage
    const fromSession = sessionStorage.getItem("token");
    if (fromSession) return fromSession;

    // Fallback: try cookie
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
};

const saveToStorage = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (err) { void err; }
  try {
    sessionStorage.setItem(key, value);
  } catch (err) { void err; }
  // Also save token as cookie (works in Safari)
  if (key === "token") {
    document.cookie = `token=${encodeURIComponent(value)};path=/;max-age=604800;SameSite=Lax`;
  }
};

const clearStorage = () => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch (err) { void err; }
  try {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  } catch (err) { void err; }
  // Clear cookie
  document.cookie = "token=;path=/;max-age=0";
};

// ── Store ─────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set) => ({
  user: getSavedUser(),
  token: getSavedToken(),
  isAuthenticated: !!getSavedToken(),

  login: (user, token) => {
    // Save to all storage types for maximum compatibility
    saveToStorage("token", token);
    saveToStorage("user", JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    clearStorage();
    set({ user: null, token: null, isAuthenticated: false });
  },
}));