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

  useEffect(() => {
    fetch(API, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setHabits(data))
      .finally(() => setLoading(false));
  }, []);

  async function addHabit(params: {
    name: string;
    description?: string;
    category: HabitCategory;
    frequency: HabitFrequency;
    color?: string;
  }) {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(params),
    });
    const newHabit = await res.json();
    setHabits((prev) => [...prev, newHabit]);
  }

  async function removeHabit(id: string) {
    await fetch(`${API}/${id}`, { method: "DELETE", credentials: "include" });
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }

  async function toggleHabitToday(id: string) {
    const today = getTodayISO();
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    const alreadyDone = habit.completedDates?.includes(today);

    if (alreadyDone) {
      // undo
      await fetch(`${API}/${id}/complete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ date: today }),
      });
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
      const updated = await res.json();
      setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
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
