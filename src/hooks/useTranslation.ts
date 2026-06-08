import { useCallback } from "react";
import { translate, type Locale } from "../lib/i18n";
import { useLocaleStore } from "../stores/useLocaleStore";

export function useTranslation() {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(locale, key, vars),
    [locale],
  );

  return { locale, setLocale, t } as const;
}
