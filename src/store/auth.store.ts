import { create } from "zustand";

type AuthState = {
  isLoggedIn: boolean;
  setLoggedIn: () => void;
  setLoggedOut: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  setLoggedIn: () => set({ isLoggedIn: true }),
  setLoggedOut: () => set({ isLoggedIn: false }),
}));
