import { useState, useCallback } from "react";
import type { Habit } from "../types/habit.types";
import type { Task } from "../types/task.types";
import type { Goal } from "../types/goal.types";

export interface ProductivityScores {
  overall: number;
  tasks: number;
  habits: number;
  goals: number;
  trend: "up" | "down";
  trendValue: number;
}

export interface PatternStats {
  currentStreak: number;
  longestStreak: number;
  avgTasksPerDay: number;
  peakHour: string;
  peakCompletion: number;
}

export interface WeeklyReport {
  summary: string;
  highlights: string[];
  watchOuts: string[];
}

function getISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return getISO(d);
  });
}

function getLast14Days(): string[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return getISO(d);
  });
}

export function computeScores(
  habits: Habit[],
  tasks: Task[],
  goals: Goal[],
): { scores: ProductivityScores; stats: PatternStats } {
  const last7 = getLast7Days();
  const last14 = getLast14Days();
  const thisWeek = last7;
  const lastWeek = last14.slice(0, 7);

  // ── Habits score ──
  const dailyHabits = habits.filter((h) => h.frequency === "daily");
  const totalSlots = dailyHabits.length * 7;
  const completedSlots = dailyHabits.reduce(
    (sum, h) =>
      sum + thisWeek.filter((d) => h.completedDates.includes(d)).length,
    0,
  );
  const habitsScore =
    totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : 0;

  // last week habits score for trend
  const completedSlotsLW = dailyHabits.reduce(
    (sum, h) =>
      sum + lastWeek.filter((d) => h.completedDates.includes(d)).length,
    0,
  );
  const habitsScoreLW =
    totalSlots > 0 ? Math.round((completedSlotsLW / totalSlots) * 100) : 0;

  // ── Tasks score ──
  const thisWeekTasks = tasks.filter(
    (t) => t.completedAt && thisWeek.includes(t.completedAt.slice(0, 10)),
  );
  const lastWeekTasks = tasks.filter(
    (t) => t.completedAt && lastWeek.includes(t.completedAt.slice(0, 10)),
  );
  const createdThisWeek = tasks.filter((t) =>
    thisWeek.includes(t.createdAt.slice(0, 10)),
  );
  const tasksScore =
    createdThisWeek.length > 0
      ? Math.min(
          100,
          Math.round(
            (thisWeekTasks.length / Math.max(createdThisWeek.length, 1)) * 100,
          ),
        )
      : thisWeekTasks.length > 0
        ? 80
        : 0;

  const createdLastWeek = tasks.filter((t) =>
    lastWeek.includes(t.createdAt.slice(0, 10)),
  );
  const tasksScoreLW =
    createdLastWeek.length > 0
      ? Math.min(
          100,
          Math.round(
            (lastWeekTasks.length / Math.max(createdLastWeek.length, 1)) * 100,
          ),
        )
      : 0;

  // ── Goals score ──
  const activeGoals = goals.filter(
    (g) => g.status === "active" || g.status === "completed",
  );
  const goalsScore =
    activeGoals.length > 0
      ? Math.round(
          activeGoals.reduce((sum, g) => {
            const pct = Math.min(
              100,
              (g.currentValue / Math.max(g.targetValue, 1)) * 100,
            );
            return sum + pct;
          }, 0) / activeGoals.length,
        )
      : 0;

  // ── Overall ──
  const weights = { tasks: 0.4, habits: 0.35, goals: 0.25 };
  const overall = Math.round(
    tasksScore * weights.tasks +
      habitsScore * weights.habits +
      goalsScore * weights.goals,
  );
  const overallLW = Math.round(
    tasksScoreLW * weights.tasks +
      habitsScoreLW * weights.habits +
      goalsScore * weights.goals,
  );
  const trendValue = Math.abs(overall - overallLW);
  const trend: "up" | "down" = overall >= overallLW ? "up" : "down";

  // ── Pattern stats ──
  const longestStreak = habits.reduce(
    (max, h) => Math.max(max, h.longestStreak ?? 0),
    0,
  );
  const currentStreak = habits.reduce(
    (max, h) => Math.max(max, h.streak ?? 0),
    0,
  );

  const avgTasksPerDay =
    thisWeek.length > 0 ? Math.round((thisWeekTasks.length / 7) * 10) / 10 : 0;

  // Peak hour: bucket completedAt hours
  const hourBuckets: Record<string, { label: string; count: number }> = {
    "6": { label: "6–9 AM", count: 0 },
    "9": { label: "9–12 PM", count: 0 },
    "12": { label: "12–3 PM", count: 0 },
    "15": { label: "3–6 PM", count: 0 },
    "18": { label: "6–9 PM", count: 0 },
    "21": { label: "9 PM+", count: 0 },
  };
  tasks
    .filter((t) => t.completedAt)
    .forEach((t) => {
      const hour = new Date(t.completedAt!).getHours();
      const bucket =
        hour < 9
          ? "6"
          : hour < 12
            ? "9"
            : hour < 15
              ? "12"
              : hour < 18
                ? "15"
                : hour < 21
                  ? "18"
                  : "21";
      hourBuckets[bucket].count++;
    });
  const peakBucket = Object.values(hourBuckets).reduce(
    (best, b) => (b.count > best.count ? b : best),
    { label: "Morning", count: 0 },
  );
  const totalTasksCompleted = tasks.filter((t) => t.completed).length;
  const peakCompletion =
    totalTasksCompleted > 0
      ? Math.round((peakBucket.count / totalTasksCompleted) * 100)
      : 0;

  return {
    scores: {
      overall,
      tasks: tasksScore,
      habits: habitsScore,
      goals: goalsScore,
      trend,
      trendValue,
    },
    stats: {
      currentStreak,
      longestStreak,
      avgTasksPerDay,
      peakHour: peakBucket.label,
      peakCompletion,
    },
  };
}
