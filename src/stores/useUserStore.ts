import { API_BASE } from "../lib/utils";
import { create } from "zustand";

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserStore {
  user: User | null;
  loading: boolean;
  fetch: () => Promise<void>;
  update: (data: Partial<User>) => void;
}

export const useUserStore = create<UserStore>()((set) => ({
  user: null,
  loading: false,
  fetch: async () => {
    set({ loading: true });
    try {
      const res = await fetch(`${API_BASE}/api/user`, {
        credentials: "include",
      });
      if (res.ok) set({ user: await res.json() });
    } finally {
      set({ loading: false });
    }
  },
  update: (data) =>
    set((s) => ({ user: s.user ? { ...s.user, ...data } : null })),
}));
