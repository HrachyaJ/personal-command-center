import { useState, useEffect } from "react";
import { toast } from "sonner";
import type {
  Habit,
  HabitCategory,
  HabitFrequency,
} from "../types/habit.types";
import { authFetch, authFetchJson, authFetchOrThrow } from "../lib/utils";

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

const API = `${import.meta.env.VITE_API_URL ?? "http://localhost:3001"}/api/habits`;

function getTodayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHabits() {
      try {
        setLoading(true);
        setError(null);
        const data = await authFetchJson<Habit[]>(
          API,
          {},
          "Failed to load habits.",
        );
        setHabits(data);
      } catch (err) {
        const message = getErrorMessage(err, "Failed to load habits.");
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
    fetchHabits();
  }, []);

  async function addHabit(params: {
    name: string;
    description?: string;
    category: HabitCategory;
    frequency: HabitFrequency;
    color?: string;
  }) {
    try {
      setError(null);
      const newHabit = await authFetchJson<Habit>(
        API,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        },
        "Failed to add habit.",
      );
      setHabits((prev) => [...prev, newHabit]);
    } catch (err) {
      const message = getErrorMessage(err, "Failed to add habit.");
      setError(message);
      toast.error(message);
    }
  }

  async function removeHabit(id: string) {
    try {
      setError(null);
      await authFetchOrThrow(
        `${API}/${id}`,
        { method: "DELETE" },
        "Failed to remove habit.",
      );
      setHabits((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      const message = getErrorMessage(err, "Failed to remove habit.");
      setError(message);
      toast.error(message);
    }
  }

  async function toggleHabitToday(id: string) {
    try {
      setError(null);
      const today = getTodayISO();
      const habit = habits.find((h) => h.id === id);
      if (!habit) return;

      const alreadyDone = habit.completedDates?.includes(today);

      if (alreadyDone) {
        await authFetchOrThrow(
          `${API}/${id}/complete`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date: today }),
          },
          "Failed to undo habit completion.",
        );
        setHabits((prev) =>
          prev.map((h) =>
            h.id === id
              ? {
                  ...h,
                  completedDates: h.completedDates.filter((d) => d !== today),
                }
              : h,
          ),
        );
      } else {
        const updated = await authFetchJson<Habit>(
          `${API}/${id}/complete`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date: today }),
          },
          "Failed to complete habit.",
        );
        setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
      }
    } catch (err) {
      const message = getErrorMessage(err, "Failed to update habit.");
      setError(message);
      toast.error(message);
    }
  }

  function isCompletedToday(habit: Habit): boolean {
    return habit.completedDates?.includes(getTodayISO()) ?? false;
  }

  const longestCurrentStreak = habits.reduce(
    (max, h) => Math.max(max, h.streak ?? 0),
    0,
  );

  function getTodayDayOfWeek(): number {
    return new Date().getDay();
  }

  function isDueToday(habit: Habit): boolean {
    if (habit.frequency === "daily") return true;
    if (habit.frequency === "weekly") {
      const createdDay = new Date(habit.createdAt).getDay();
      return createdDay === getTodayDayOfWeek();
    }
    return false;
  }

  const todaysHabits = habits.filter(isDueToday);
  const totalHabits = todaysHabits.length;
  const completedToday = todaysHabits.filter(isCompletedToday).length;
  const completionRate =
    totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  return {
    habits,
    loading,
    error,
    todaysHabits,
    addHabit,
    removeHabit,
    toggleHabitToday,
    isCompletedToday,
    totalHabits,
    completedToday,
    completionRate,
    longestCurrentStreak,
  };
}
