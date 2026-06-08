import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TaskCategory, TaskPriority } from "../types/task.types";
import type { HabitCategory } from "../types/habit.types";
import type { InsightType, Priority } from "../types/ai-coach";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

// For the future the dynamic subtitle could be enhanced to pull from a larger set of phrases or even use an AI service to generate personalized messages based on user data and time of day.
export function getDynamicMotivationalSubtitle(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    // 5:00 AM - 11:59 AM
    const morningPhrases = [
      "Ready to tackle your goals today?",
      "The morning is yours. Let's make it count.",
      "Win the morning, win the day. What's first?",
      "Fresh start, clear focus. Let's build momentum.",
    ];
    return morningPhrases[hour % morningPhrases.length];
  } else if (hour >= 12 && hour < 17) {
    // 12:00 PM - 4:59 PM
    const afternoonPhrases = [
      "Keep the momentum going!",
      "Stay focused, you're making solid progress.",
      "One task at a time. You've got this handled.",
      "Midday check-in: channel your energy effectively.",
    ];
    return afternoonPhrases[hour % afternoonPhrases.length];
  } else if (hour >= 17 && hour < 22) {
    // 5:00 PM - 9:59 PM
    const eveningPhrases = [
      "Let's finish the day strong.",
      "Reviewing your wins? Excellent discipline.",
      "Bringing order to the evening. Keep it up.",
      "Time to tie up loose ends and wrap up gracefully.",
    ];
    return eveningPhrases[hour % eveningPhrases.length];
  } else {
    // 10:00 PM - 4:59 AM
    const nightPhrases = [
      "Preparing the ground for tomorrow?",
      "Late-night focus hits differently. Stay steady.",
      "Wrap up your thoughts and clear your mind.",
      "Rest is part of the discipline. Don't overdo it.",
    ];
    return nightPhrases[hour % nightPhrases.length];
  }
}

// For the fu
export function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export function getMomentumLabel(rate: number): string {
  if (rate >= 80) return "🔥 On fire!";
  if (rate >= 60) return "💪 Keep it up!";
  if (rate >= 40) return "📈 Building momentum";
  if (rate > 0) return "🌱 Just getting started";
  return "✨ Nothing yet";
}

export function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

export function getDayLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "short" }).charAt(0);
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
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
  high: { badge: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
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

export const CATEGORIES: {
  value: HabitCategory;
  label: string;
  emoji: string;
}[] = [
  { value: "health", label: "Health", emoji: "🩺" },
  { value: "fitness", label: "Fitness", emoji: "💪" },
  { value: "mindfulness", label: "Mindfulness", emoji: "🧘" },
  { value: "learning", label: "Learning", emoji: "📚" },
  { value: "productivity", label: "Productivity", emoji: "⚡" },
  { value: "other", label: "Other", emoji: "✨" },
];

export const PRIORITY_DOT: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-secondary",
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "paused":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-muted text-foreground border-border";
  }
};

export function authFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("focusflow:token");
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
        badge: "bg-blue-100 text-blue-800 border-blue-200",
        icon: "text-blue-600 bg-blue-50",
        border: "border-l-blue-400",
      };
    case "warning":
      return {
        badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: "text-yellow-600 bg-yellow-50",
        border: "border-l-yellow-400",
      };
    case "achievement":
      return {
        badge: "bg-green-100 text-green-800 border-green-200",
        icon: "text-green-600 bg-green-50",
        border: "border-l-green-400",
      };
    case "pattern":
      return {
        badge: "bg-purple-100 text-purple-800 border-purple-200",
        icon: "text-purple-600 bg-purple-50",
        border: "border-l-purple-400",
      };
  }
}

export function priorityColors(priority: Priority) {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700 border-red-200";
    case "medium":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "low":
      return "bg-muted text-muted-foreground border-border";
  }
}

export function impactColors(impact: "high" | "medium" | "low") {
  switch (impact) {
    case "high":
      return "bg-green-100 text-green-700 border-green-200";
    case "medium":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "low":
      return "bg-muted text-muted-foreground border-border";
  }
}

export function effortColors(effort: "easy" | "moderate" | "hard") {
  switch (effort) {
    case "easy":
      return "bg-green-100 text-green-700 border-green-200";
    case "moderate":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "hard":
      return "bg-red-100 text-red-700 border-red-200";
  }
}

export const CATEGORY_LABELS: Record<string, string> = {
  health: "🩺 Health",
  fitness: "💪 Fitness",
  mindfulness: "🧘 Mindfulness",
  learning: "📚 Learning",
  productivity: "⚡ Productivity",
  other: "✨ Other",
};

export const SIDEBAR_ROUTES = [
  "/dashboard",
  "/tasks",
  "/habits",
  "/goals",
  "/ai-coach",
];
