// authStore.ts — global authentication state using Zustand
// Zustand is simpler than Redux — just a function that returns state + actions
// Any component can read from or update this store
import { create } from "zustand";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

// Helper — safely reads user object from localStorage
// We use try/catch because JSON.parse can throw if data is corrupted
const getSavedUser = (): User | null => {
  try {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  // Now user is restored from localStorage on every page load
  user: getSavedUser(),
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),

  // login — saves BOTH token and user to localStorage
  login: (user, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  // logout — clears BOTH token and user from localStorage
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));