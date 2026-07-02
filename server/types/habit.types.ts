export type HabitFrequency = "daily" | "weekly";

export type HabitCategory =
  | "health"
  | "fitness"
  | "mindfulness"
  | "learning"
  | "productivity"
  | "other";

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  streak: number;
  longestStreak: number;
  completedDates: string[]; // ISO date strings e.g. "2026-03-03"
  createdAt: string;
  color?: string;
}
