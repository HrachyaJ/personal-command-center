import { useState, useEffect } from "react";
import type { Goal } from "../types/goal.types";
import { goalStorage } from "../entities/goal/goal.storage";

export function useGoals() {
  // Initialize state with goals from localStorage
  const [goals, setGoals] = useState<Goal[]>(() => goalStorage.getAll());

  // Save to localStorage whenever goals change
  useEffect(() => {
    goalStorage.saveAll(goals);
  }, [goals]);

  /**
   * Add a new goal
   */
  const addGoal = (goalData: {
    title: string;
    description: string;
    targetValue: number;
    unit: string;
    deadline?: string;
  }): Goal => {
    const newGoal: Goal = {
      id: Date.now().toString(), // Simple ID using timestamp
      title: goalData.title,
      description: goalData.description,
      targetValue: goalData.targetValue,
      currentValue: 0, // Always starts at 0
      unit: goalData.unit,
      deadline: goalData.deadline,
      status: "active",
    };

    setGoals((prev) => [...prev, newGoal]);
    return newGoal;
  };

  /**
   * Update a goal's progress by adding to current value
   */
  const updateProgress = (goalId: string, addValue: number): void => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? { ...goal, currentValue: goal.currentValue + addValue }
          : goal,
      ),
    );
  };

  /**
   * Set a goal's current value directly (alternative to updateProgress)
   */
  const setProgress = (goalId: string, value: number): void => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId ? { ...goal, currentValue: value } : goal,
      ),
    );
  };

  /**
   * Mark a goal as completed
   */
  const completeGoal = (goalId: string): void => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId ? { ...goal, status: "completed" } : goal,
      ),
    );
  };

  /**
   * Mark a goal as paused
   */
  const pauseGoal = (goalId: string): void => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId ? { ...goal, status: "paused" } : goal,
      ),
    );
  };

  /**
   * Reactivate a paused or completed goal
   */
  const activateGoal = (goalId: string): void => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId ? { ...goal, status: "active" } : goal,
      ),
    );
  };

  /**
   * Delete a goal
   */
  const deleteGoal = (goalId: string): void => {
    setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
  };

  /**
   * Update goal details (title, description, etc.)
   */
  const updateGoal = (goalId: string, updates: Partial<Goal>): void => {
    setGoals((prev) =>
      prev.map((goal) => (goal.id === goalId ? { ...goal, ...updates } : goal)),
    );
  };

  /**
   * Get goals filtered by status
   */
  const getGoalsByStatus = (
    status: "active" | "completed" | "paused",
  ): Goal[] => {
    return goals.filter((goal) => goal.status === status);
  };

  /**
   * Get a single goal by ID
   */
  const getGoalById = (goalId: string): Goal | undefined => {
    return goals.find((goal) => goal.id === goalId);
  };

  /**
   * Calculate statistics
   */
  const getStats = () => {
    const total = goals.length;
    const active = goals.filter((g) => g.status === "active").length;
    const completed = goals.filter((g) => g.status === "completed").length;
    const paused = goals.filter((g) => g.status === "paused").length;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      active,
      completed,
      paused,
      completionRate,
    };
  };

  /**
   * Clear all goals (useful for testing/reset)
   */
  const clearAllGoals = (): void => {
    setGoals([]);
  };

  return {
    // State
    goals,

    // CRUD operations
    addGoal,
    updateGoal,
    deleteGoal,

    // Progress operations
    updateProgress,
    setProgress,

    // Status operations
    completeGoal,
    pauseGoal,
    activateGoal,

    // Queries
    getGoalsByStatus,
    getGoalById,
    getStats,

    // Utilities
    clearAllGoals,
  };
}
