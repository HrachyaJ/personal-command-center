import { useState, useEffect } from "react";
import { toast } from "sonner";
import type {
  Habit,
  HabitCategory,
  HabitFrequency,
} from "../types/habit.types";
import {
  API_BASE,
  authFetch,
  authFetchJson,
  authFetchOrThrow,
} from "../lib/utils";

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

const API = `${API_BASE}/api/habits`;

function getTodayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHabits() {
      try {
        setLoading(true);
        const data = await authFetchJson<Habit[]>(
          API,
          {},
          "Failed to load habits.",
        );
        setHabits(data);
      } catch (err) {
        const message = getErrorMessage(err, "Failed to load habits.");
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
      toast.error(message);
    }
  }

  async function removeHabit(id: string) {
    try {
      await authFetchOrThrow(
        `${API}/${id}`,
        { method: "DELETE" },
        "Failed to remove habit.",
      );
      setHabits((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      const message = getErrorMessage(err, "Failed to remove habit.");
      toast.error(message);
    }
  }

  async function toggleHabitToday(id: string) {
    const today = getTodayISO();
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    const alreadyDone = habit.completedDates?.includes(today);

    // Snapshot so we can roll back if the request fails.
    const previousHabits = habits;

    // Optimistic update — flip today's completion instantly, sync in
    // background. Streak/longestStreak are left alone here since they're
    // server-computed; they'll settle to the correct value once the
    // response comes back, which is fast enough not to be noticeable.
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              completedDates: alreadyDone
                ? (h.completedDates ?? []).filter((d) => d !== today)
                : [...(h.completedDates ?? []), today],
            }
          : h,
      ),
    );

    try {
      if (alreadyDone) {
        const updated = await authFetchJson<Habit>(
          `${API}/${id}/complete`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date: today }),
          },
          "Failed to undo habit completion.",
        );
        setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
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
      setHabits(previousHabits); // roll back the optimistic flip
      const message = getErrorMessage(err, "Failed to update habit.");
      toast.error(message);
    }
  }

  function isCompletedToday(habit: Habit): boolean {
    return habit.completedDates?.includes(getTodayISO()) ?? false;
  }

  // Highest *current* (active) streak across all habits — resets to 0/low
  // whenever a habit's streak breaks. Used for "what's hot right now" UI.
  const longestCurrentStreak = habits.reduce(
    (max, h) => Math.max(max, h.streak ?? 0),
    0,
  );

  // Highest *all-time* streak ever achieved across all habits — does not
  // reset when a streak breaks. This is what "Best Streak" should usually
  // mean, and matches the calculation used in the AI Coach tab.
  const longestStreak = habits.reduce(
    (max, h) => Math.max(max, h.longestStreak ?? 0),
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
    todaysHabits,
    addHabit,
    removeHabit,
    toggleHabitToday,
    isCompletedToday,
    totalHabits,
    completedToday,
    completionRate,
    longestCurrentStreak,
    longestStreak,
  };
}
