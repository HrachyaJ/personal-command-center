import { useState, useEffect, useCallback } from "react";
import type {
  Habit,
  HabitCategory,
  HabitFrequency,
} from "../types/habit.types";
import { getHabits, saveHabits } from "../entities/habits/habit.storage";

function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}

function recalcStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;
  const sorted = [...completedDates].sort().reverse();
  let streak = 0;
  let cursor = new Date(getTodayISO());
  for (const dateStr of sorted) {
    const d = new Date(dateStr);
    const diff = (cursor.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    if (diff <= 1) {
      streak++;
      cursor = d;
    } else {
      break;
    }
  }
  return streak;
}

export function useHabits() {
  const [habits, setHabitsState] = useState<Habit[]>([]);

  useEffect(() => {
    setHabitsState(getHabits());
  }, []);

  const persist = useCallback((updated: Habit[]) => {
    setHabitsState(updated);
    saveHabits(updated);
  }, []);

  function addHabit(params: {
    name: string;
    description?: string;
    category: HabitCategory;
    frequency: HabitFrequency;
    color?: string;
  }) {
    const habit: Habit = {
      id: crypto.randomUUID(),
      name: params.name,
      description: params.description,
      category: params.category,
      frequency: params.frequency,
      streak: 0,
      longestStreak: 0,
      completedDates: [],
      createdAt: new Date().toISOString(),
      color: params.color,
    };
    persist([...habits, habit]);
  }

  function removeHabit(id: string) {
    persist(habits.filter((h) => h.id !== id));
  }

  function toggleHabitToday(id: string) {
    const today = getTodayISO();
    persist(
      habits.map((h) => {
        if (h.id !== id) return h;
        const alreadyDone = h.completedDates.includes(today);
        const newDates = alreadyDone
          ? h.completedDates.filter((d) => d !== today)
          : [...h.completedDates, today];
        const newStreak = recalcStreak(newDates);
        return {
          ...h,
          completedDates: newDates,
          streak: newStreak,
          longestStreak: Math.max(h.longestStreak, newStreak),
        };
      }),
    );
  }

  function isCompletedToday(habit: Habit): boolean {
    return habit.completedDates.includes(getTodayISO());
  }

  // Analytics helpers
  const totalHabits = habits.length;
  const completedToday = habits.filter(isCompletedToday).length;
  const completionRate =
    totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const longestCurrentStreak = habits.reduce(
    (max, h) => Math.max(max, h.streak),
    0,
  );

  return {
    habits,
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
