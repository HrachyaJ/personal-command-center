import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TaskCategory, TaskPriority } from "../types/task.types";
import type { HabitCategory } from "../types/habit.types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

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

export const isOverdue = (dateStr: string | null, completed: boolean) => {
  if (!dateStr || completed) return false;
  const d = parseDate(dateStr);
  if (isNaN(d.getTime())) return false;
  return d < new Date();
};

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

export function formatShortDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function isTaskOverdue(dateStr: string | null, completed: boolean) {
  if (!dateStr || completed) return false;
  return new Date(dateStr) < new Date();
}
