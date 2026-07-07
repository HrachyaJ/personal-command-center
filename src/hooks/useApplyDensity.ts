// src/hooks/useApplyDensity.ts
import { useEffect } from "react";
import { useDensityStore } from "../stores/useDensityStore";

// Compact density works by shrinking the root font-size. Tailwind's default
// spacing scale (p-4, gap-3, space-y-4, ...) and most text sizes (text-sm,
// text-xs, ...) are defined in rem units, so scaling the root font-size
// scales every rem-based padding, margin, gap, and text size across the
// whole app proportionally — no need to touch individual components or
// maintain a parallel set of "compact" utility classes.
const ROOT_FONT_SIZE: Record<"comfortable" | "compact", string> = {
  comfortable: "100%",
  compact: "87.5%", // ~14px base instead of 16px — noticeably tighter, still readable
};

const STORAGE_KEY = "focusflow:density";

// Applies the persisted density to <html> on every change, and keeps it in
// sync if the user changes it in another tab (zustand's persist middleware
// writes to localStorage but doesn't listen for changes made elsewhere).
export function useApplyDensity() {
  const density = useDensityStore((s) => s.density);

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = ROOT_FONT_SIZE[density];
    // Exposed as a data attribute too, in case any component wants finer
    // control later (e.g. `[data-density="compact"] .some-card { ... }`)
    // without needing another store subscription.
    root.dataset.density = density;
  }, [density]);

  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        const next = parsed?.state?.density;
        if (
          (next === "comfortable" || next === "compact") &&
          next !== useDensityStore.getState().density
        ) {
          useDensityStore.setState({ density: next });
        }
      } catch {
        // ignore malformed storage payloads
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);
}
