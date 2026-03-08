// authStore.ts — global authentication state using Zustand
// Zustand is simpler than Redux — just a function that returns state + actions
// Any component can read from or update this store

import { create } from "zustand";
import type { User } from "../types";
interface AuthState {
  user: User | null;          // logged in user or null
  token: string | null;       // JWT token or null
  isAuthenticated: boolean;   // true if logged in

  // Actions — functions that update the state
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state — check localStorage in case user was already logged in
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),

  // login action — saves user + token to state AND localStorage
  // localStorage persists across page refreshes
  login: (user, token) => {
    localStorage.setItem("token", token);
    set({ user, token, isAuthenticated: true });
  },

  // logout action — clears everything
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));