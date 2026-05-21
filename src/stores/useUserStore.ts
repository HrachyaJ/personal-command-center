import { API_BASE } from "../lib/utils";
import { create } from "zustand";

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
}

export const useUserStore = create<UserStore>()((set, get) => ({
  user: null,
  loading: true,
  fetch: async () => {
    // Don't refetch if we already have a user
    if (get().user) return;
    set({ loading: true });
    try {
      const res = await fetch(`${API_BASE}/api/user`, {
        credentials: "include",
      });
      if (res.ok) set({ user: await res.json() });
      else set({ loading: false }); // explicit fallback
    } finally {
      set({ loading: false });
    }
  },
  update: (data) =>
    set((s) => ({ user: s.user ? { ...s.user, ...data } : null })),
}));
