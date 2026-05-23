import { useState, useEffect } from "react";
import type {
  Habit,
  HabitCategory,
  HabitFrequency,
} from "../types/habit.types";
import { authFetch } from "../lib/utils";

const API = `${import.meta.env.VITE_API_URL ?? "http://localhost:3001"}/api/habits`;

function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
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
        const response = await authFetch(API);
        if (!response.ok) throw new Error("Failed to fetch habits");
        const data = await response.json();
        setHabits(data);
      } catch (err) {
        setError((err as Error).message);
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
      const res = await authFetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error("Failed to add habit");
      const newHabit = await res.json();
      setHabits((prev) => [...prev, newHabit]);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function removeHabit(id: string) {
    try {
      setError(null);
      const res = await authFetch(`${API}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove habit");
      setHabits((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      setError((err as Error).message);
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
        const res = await authFetch(`${API}/${id}/complete`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: today }),
        });
        if (!res.ok) throw new Error("Failed to undo habit completion");
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
        const res = await authFetch(`${API}/${id}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: today }),
        });
        if (!res.ok) throw new Error("Failed to complete habit");
        const updated = await res.json();
        setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
      }
    } catch (err) {
      setError((err as Error).message);
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
