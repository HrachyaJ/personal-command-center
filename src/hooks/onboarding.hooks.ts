import { useCallback, useEffect, useState } from "react";

const ONBOARDING_SEEN_KEY_PREFIX = "personal_command_center_onboarding_seen";
const ONBOARDING_COOKIE_NAME_PREFIX = "pcc_onboarding_seen";
const ONBOARDING_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(
      `(?:^|; )${name.replace(/([.$?*|{}()\[\]\\/+^])/g, "\\$1")}=([^;]*)`,
    ),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Strict`;
}

function getOnboardingStorageKeys(pageKey: string) {
  const normalized = pageKey.trim().toLowerCase();
  return {
    localKey: `${ONBOARDING_SEEN_KEY_PREFIX}:${normalized}`,
    cookieKey: `${ONBOARDING_COOKIE_NAME_PREFIX}:${normalized}`,
  };
}

function hasSeenOnboardingInBrowser(pageKey: string): boolean {
  if (typeof window === "undefined") return false;

  const { localKey, cookieKey } = getOnboardingStorageKeys(pageKey);
  const localValue = window.localStorage.getItem(localKey);
  if (localValue === "true") return true;

  const cookieValue = getCookieValue(cookieKey);
  return cookieValue === "true";
}

function markOnboardingSeenInBrowser(pageKey: string) {
  if (typeof window === "undefined") return;

  const { localKey, cookieKey } = getOnboardingStorageKeys(pageKey);
  window.localStorage.setItem(localKey, "true");
  setCookie(cookieKey, "true", ONBOARDING_MAX_AGE_SECONDS);
}

export function useOnboardingSeen(pageKey: string) {
  const [seen, setSeen] = useState(() => hasSeenOnboardingInBrowser(pageKey));

  useEffect(() => {
    setSeen(hasSeenOnboardingInBrowser(pageKey));
  }, [pageKey]);

  const markSeen = useCallback(() => {
    if (seen) return;
    markOnboardingSeenInBrowser(pageKey);
    setSeen(true);
  }, [seen, pageKey]);

  return { seen, markSeen };
}
