import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Goal } from "../types/goal.types";
import {
  API_BASE,
  authFetch,
  authFetchJson,
  authFetchOrThrow,
} from "../lib/utils";

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

const API = `${API_BASE}/api/goals`;

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGoals() {
      try {
        const data = await authFetchJson<Goal[]>(
          API,
          {},
          "Failed to load goals.",
        );
        setGoals(data);
      } catch (err) {
        const message = getErrorMessage(err, "Failed to load goals.");
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
    fetchGoals();
  }, []);

  async function addGoal(goalData: {
    title: string;
    description: string;
    targetValue: number;
    unit: string;
    deadline?: string;
  }) {
    try {
      const newGoal = await authFetchJson<Goal>(
        API,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(goalData),
        },
        "Failed to add goal.",
      );
      setGoals((prev) => [...prev, newGoal]);
      return newGoal;
    } catch (err) {
      const message = getErrorMessage(err, "Failed to add goal.");
      toast.error(message);
    }
  }

  async function updateGoal(goalId: string, updates: Partial<Goal>) {
    try {
      const updated = await authFetchJson<Goal>(
        `${API}/${goalId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        },
        "Failed to update goal.",
      );
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
    } catch (err) {
      const message = getErrorMessage(err, "Failed to update goal.");
      toast.error(message);
    }
  }

  async function deleteGoal(goalId: string) {
    try {
      await authFetchOrThrow(
        `${API}/${goalId}`,
        { method: "DELETE" },
        "Failed to delete goal.",
      );
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    } catch (err) {
      const message = getErrorMessage(err, "Failed to delete goal.");
      toast.error(message);
    }
  }

  async function updateProgress(goalId: string, addValue: number) {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    await updateGoal(goalId, { currentValue: goal.currentValue + addValue });
  }

  async function setProgress(goalId: string, value: number) {
    await updateGoal(goalId, { currentValue: value });
  }

  async function completeGoal(goalId: string) {
    await updateGoal(goalId, { status: "completed" });
  }

  async function pauseGoal(goalId: string) {
    await updateGoal(goalId, { status: "paused" });
  }

  async function activateGoal(goalId: string) {
    await updateGoal(goalId, { status: "active" });
  }

  function getGoalsByStatus(status: "active" | "completed" | "paused") {
    return goals.filter((g) => g.status === status);
  }

  function getGoalById(goalId: string) {
    return goals.find((g) => g.id === goalId);
  }

  function countCompletedGoals() {
    return goals.filter((g) => g.status === "completed").length;
  }

  function getStats() {
    const total = goals.length;
    const active = goals.filter((g) => g.status === "active").length;
    const completed = goals.filter((g) => g.status === "completed").length;
    const paused = goals.filter((g) => g.status === "paused").length;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, active, completed, paused, completionRate };
  }

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    updateProgress,
    setProgress,
    completeGoal,
    pauseGoal,
    activateGoal,
    getGoalsByStatus,
    getGoalById,
    getStats,
    countCompletedGoals,
  };
}
