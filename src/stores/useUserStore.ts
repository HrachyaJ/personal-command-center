import { API_BASE, authFetch } from "../lib/utils";
import { create } from "zustand";

const TOKEN_KEY = "focusflow:token";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface UserStore {
  user: User | null;
  loading: boolean;
  fetch: () => Promise<void>;
  update: (data: Partial<User>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>()((set) => ({
  user: null,
  loading: true,
  fetch: async () => {
    set({ loading: true });
    try {
      const res = await authFetch(`${API_BASE}/api/user`);
      if (res.ok) set({ user: await res.json() });
      else set({ user: null }); // token invalid/expired — treat as logged out
    } finally {
      set({ loading: false });
    }
  },
  update: (data) =>
    set((s) => ({ user: s.user ? { ...s.user, ...data } : null })),
  clearUser: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("focusflow:last_user");
    set({ user: null, loading: false });
  },
}));
