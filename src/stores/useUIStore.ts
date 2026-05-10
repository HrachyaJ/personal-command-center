import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIStore {
  sidebarCollapsed: boolean;
  settingsOpen: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  setSettingsOpen: (value: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      settingsOpen: false,
      setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),
      setSettingsOpen: (value) => set({ settingsOpen: value }),
    }),
    {
      name: "ui",
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    },
    // settingsOpen is intentionally not persisted — always closed on refresh
  ),
);
