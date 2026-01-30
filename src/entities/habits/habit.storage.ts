import type { Habit } from "./habit.types";
import { storage } from "../../shared/utils/storage";

const HABITS_KEY = "habits";

export const getHabits = (): Habit[] => {
  const raw = storage.get(HABITS_KEY);
  return raw ? (JSON.parse(raw) as Habit[]) : [];
};

export const saveHabits = (habits: Habit[]): void => {
  storage.set(HABITS_KEY, JSON.stringify(habits));
};

export const clearHabits = (): void => {
  storage.remove(HABITS_KEY);
};
