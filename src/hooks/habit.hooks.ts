import { useState, useEffect } from "react";
import type {
  Habit,
  HabitCategory,
  HabitFrequency,
} from "../types/habit.types";

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
        const response = await fetch(API, { credentials: "include" });
        if (!response.ok) {
          throw new Error("Failed to fetch habits");
        }
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
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        throw new Error("Failed to add habit");
      }
      const newHabit = await res.json();
      setHabits((prev) => [...prev, newHabit]);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function removeHabit(id: string) {
    try {
      setError(null);
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to remove habit");
      }
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
        // undo
        const res = await fetch(`${API}/${id}/complete`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ date: today }),
        });
        if (!res.ok) {
          throw new Error("Failed to undo habit completion");
        }
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
        // complete
        const res = await fetch(`${API}/${id}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ date: today }),
        });
        if (!res.ok) {
          throw new Error("Failed to complete habit");
        }
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

  const totalHabits = habits.length;
  const completedToday = habits.filter(isCompletedToday).length;
  const completionRate =
    totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const longestCurrentStreak = habits.reduce(
    (max, h) => Math.max(max, h.streak ?? 0),
    0,
  );

  return {
    habits,
    loading,
    error,
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
