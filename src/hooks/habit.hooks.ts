import { useState } from "react";
import type { Habit } from "../types/habit.types";

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);

  // Habit management logic here
  function addHabit(habit: Habit) {
    setHabits((prev) => [...prev, habit]);
  }

  function removeHabit(id: string) {
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
  }

  function toggleHabit(id: string) {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.streak } : habit,
      ),
    );
  }

  return {
    habits,
    addHabit,
    removeHabit,
    toggleHabit,
  };
}
