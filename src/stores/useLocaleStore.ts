import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getBrowserLocale, type Locale } from "../lib/i18n";

interface LocaleStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: getBrowserLocale(),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "focusflow:locale",
    },
  ),
);
