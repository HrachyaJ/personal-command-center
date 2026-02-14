import { storage } from "../../lib/storage";
import type { Goal } from "../../types/goal.types";

const GOALS_STORAGE_KEY = "focusflow_goals";

export const goalStorage = {
  // Get all goals from localStorage
  getAll: (): Goal[] => {
    try {
      const goalsJson = storage.get(GOALS_STORAGE_KEY);
      if (!goalsJson) return [];
      return JSON.parse(goalsJson) as Goal[];
    } catch (error) {
      console.error("Error reading goals from storage:", error);
      return [];
    }
  },

  // Save all goals to localStorage
  saveAll: (goals: Goal[]): void => {
    try {
      storage.set(GOALS_STORAGE_KEY, JSON.stringify(goals));
    } catch (error) {
      console.error("Error saving goals to storage:", error);
    }
  },

  // Add a single goal
  add: (goal: Goal): Goal[] => {
    const goals = goalStorage.getAll();
    const newGoals = [...goals, goal];
    goalStorage.saveAll(newGoals);
    return newGoals;
  },

  // Update a single goal
  update: (goalId: string, updatedGoal: Partial<Goal>): Goal[] => {
    const goals = goalStorage.getAll();
    const newGoals = goals.map((goal) =>
      goal.id === goalId ? { ...goal, ...updatedGoal } : goal,
    );
    goalStorage.saveAll(newGoals);
    return newGoals;
  },

  // Delete a goal
  delete: (goalId: string): Goal[] => {
    const goals = goalStorage.getAll();
    const newGoals = goals.filter((goal) => goal.id !== goalId);
    goalStorage.saveAll(newGoals);
    return newGoals;
  },

  // Get a single goal by ID
  getById: (goalId: string): Goal | undefined => {
    const goals = goalStorage.getAll();
    return goals.find((goal) => goal.id === goalId);
  },

  // Clear all goals (useful for testing or reset)
  clear: (): void => {
    storage.remove(GOALS_STORAGE_KEY);
  },
};
