import { create } from "zustand";
import { persist } from "zustand/middleware";

type Density = "comfortable" | "compact";

interface DensityStore {
  density: Density;
  setDensity: (d: Density) => void;
}

export const useDensityStore = create<DensityStore>()(
  persist(
    (set) => ({
      density: "comfortable",
      setDensity: (density) => set({ density }),
    }),
    { name: "focusflow:density" },
  ),
);
