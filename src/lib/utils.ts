import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TaskCategory, TaskPriority } from "../types/task.types";
import type { InsightType, Priority } from "../types/ai-coach.types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// In production, leave VITE_API_URL unset (or set to "") so requests go to
// the current origin and get routed through the Vercel rewrite in
// vercel.json (/api/* -> Render backend). This keeps the auth cookie
// first-party/same-site, which Chrome's third-party cookie partitioning
// otherwise blocks. In local dev there's no rewrite, so we fall back to
// hitting the local backend directly.
export const API_BASE = import.meta.env.DEV
  ? ""
  : (import.meta.env.VITE_API_URL ?? "");

// For the future the dynamic subtitle could be enhanced to pull from a larger set of phrases or even use an AI service to generate personalized messages based on user data and time of day.
export function getDynamicMotivationalSubtitle(
  t: (key: string) => string,
): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    const keys = [
      "dashboard.subtitle.morning.0",
      "dashboard.subtitle.morning.1",
      "dashboard.subtitle.morning.2",
      "dashboard.subtitle.morning.3",
    ];
    return t(keys[hour % keys.length]);
  } else if (hour >= 12 && hour < 17) {
    const keys = [
      "dashboard.subtitle.afternoon.0",
      "dashboard.subtitle.afternoon.1",
      "dashboard.subtitle.afternoon.2",
      "dashboard.subtitle.afternoon.3",
    ];
    return t(keys[hour % keys.length]);
  } else if (hour >= 17 && hour < 22) {
    const keys = [
      "dashboard.subtitle.evening.0",
      "dashboard.subtitle.evening.1",
      "dashboard.subtitle.evening.2",
      "dashboard.subtitle.evening.3",
    ];
    return t(keys[hour % keys.length]);
  } else {
    const keys = [
      "dashboard.subtitle.night.0",
      "dashboard.subtitle.night.1",
      "dashboard.subtitle.night.2",
      "dashboard.subtitle.night.3",
    ];
    return t(keys[hour % keys.length]);
  }
}
export function getTimeOfDayGreeting(t: (key: string) => string): string {
  const hour = new Date().getHours();
  if (hour < 12) return t("dashboard.greeting.morning");
  if (hour < 18) return t("dashboard.greeting.afternoon");
  return t("dashboard.greeting.evening");
}
export function getMomentumLabel(
  rate: number,
  t: (key: string) => string,
): string {
  if (rate >= 80) return t("dashboard.momentum.onFire");
  if (rate >= 60) return t("dashboard.momentum.keepItUp");
  if (rate >= 40) return t("dashboard.momentum.building");
  if (rate > 0) return t("dashboard.momentum.starting");
  return t("dashboard.momentum.nothing");
}

export function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

export function getDayLabel(iso: string, locale: string = "en-US"): string {
  const d = new Date(iso);
  return d
    .toLocaleDateString(locale, { weekday: "short" })
    .charAt(0)
    .toUpperCase();
}

export const PRIORITY_STYLES: Record<
  TaskPriority,
  { badge: string; dot: string }
> = {
  low: {
    badge: "bg-muted text-muted-foreground border-border",
    dot: "bg-secondary",
  },
  medium: {
    badge:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    dot: "bg-amber-400",
  },
  high: {
    badge:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
    dot: "bg-red-500",
  },
};

export const CATEGORY_ICONS: Record<TaskCategory, string> = {
  work: "💼",
  health: "🏃",
  personal: "🏠",
  learning: "📚",
  finance: "💰",
  other: "📌",
};

export const parseDate = (dateStr: string): Date => {
  // Date-only strings like "2025-04-29" are parsed as UTC by default,
  // which shifts the day in local timezones. Append local midnight instead.
  // Full ISO strings (contain "T") are left untouched.
  return new Date(dateStr.includes("T") ? dateStr : dateStr + "T00:00");
};

export const formatDate = (dateStr: string | null) => {
  if (!dateStr) return null;
  const d = parseDate(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Alias kept for any callers using the old name — delegates to formatDate
export const formatShortDate = formatDate;

export const isOverdue = (dateStr: string | null, completed: boolean) => {
  if (!dateStr || completed) return false;
  const d = parseDate(dateStr);
  if (isNaN(d.getTime())) return false;
  return d < new Date();
};

// Alias kept for any callers using the old name — delegates to isOverdue
export const isTaskOverdue = isOverdue;
export function getCategories(t: (key: string) => string) {
  return [
    { value: "health", label: t("habits.category.health"), emoji: "🩺" },
    { value: "fitness", label: t("habits.category.fitness"), emoji: "💪" },
    {
      value: "mindfulness",
      label: t("habits.category.mindfulness"),
      emoji: "🧘",
    },
    { value: "learning", label: t("habits.category.learning"), emoji: "📚" },
    {
      value: "productivity",
      label: t("habits.category.productivity"),
      emoji: "⚡",
    },
    { value: "other", label: t("habits.category.other"), emoji: "✨" },
  ] as const;
}

export const PRIORITY_DOT: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-secondary",
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
    case "completed":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800";
    case "paused":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800";
    default:
      return "bg-muted text-foreground border-border";
  }
};

export function authFetch(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

export async function getResponseErrorMessage(
  response: Response,
  fallbackMessage: string,
) {
  try {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await response.json();
      if (body?.message) return String(body.message);
      if (body?.error) return String(body.error);
      return JSON.stringify(body);
    }

    const text = await response.text();
    return text ? text : fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export async function authFetchOrThrow(
  url: string,
  options: RequestInit = {},
  fallbackMessage = "Request failed",
) {
  const res = await authFetch(url, options);
  if (!res.ok) {
    throw new Error(await getResponseErrorMessage(res, fallbackMessage));
  }
  return res;
}

export async function authFetchJson<T>(
  url: string,
  options: RequestInit = {},
  fallbackMessage = "Request failed",
) {
  const res = await authFetchOrThrow(url, options, fallbackMessage);
  return (await res.json()) as T;
}

export function insightColors(type: InsightType) {
  switch (type) {
    case "tip":
      return {
        badge:
          "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
        icon: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40",
        border: "border-l-blue-400 dark:border-l-blue-500",
      };
    case "warning":
      return {
        badge:
          "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800",
        icon: "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/40",
        border: "border-l-yellow-400 dark:border-l-yellow-500",
      };
    case "achievement":
      return {
        badge:
          "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800",
        icon: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/40",
        border: "border-l-green-400 dark:border-l-green-500",
      };
    case "pattern":
      return {
        badge:
          "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
        icon: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/40",
        border: "border-l-purple-400 dark:border-l-purple-500",
      };
  }
}

export function priorityColors(priority: Priority) {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800";
    case "medium":
      return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800";
    case "low":
      return "bg-muted text-muted-foreground border-border";
  }
}

export function impactColors(impact: "high" | "medium" | "low") {
  switch (impact) {
    case "high":
      return "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800";
    case "medium":
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
    case "low":
      return "bg-muted text-muted-foreground border-border";
  }
}

export function effortColors(effort: "easy" | "moderate" | "hard") {
  switch (effort) {
    case "easy":
      return "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800";
    case "moderate":
      return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800";
    case "hard":
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800";
  }
}
export function getCategoryLabels(
  t: (key: string) => string,
): Record<string, string> {
  return {
    health: `🩺 ${t("habits.category.health")}`,
    fitness: `💪 ${t("habits.category.fitness")}`,
    mindfulness: `🧘 ${t("habits.category.mindfulness")}`,
    learning: `📚 ${t("habits.category.learning")}`,
    productivity: `⚡ ${t("habits.category.productivity")}`,
    other: `✨ ${t("habits.category.other")}`,
  };
}

export const SIDEBAR_ROUTES = [
  "/dashboard",
  "/tasks",
  "/habits",
  "/goals",
  "/ai-coach",
];
