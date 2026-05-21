import { useState, useEffect } from "react";
import type { Goal } from "../types/goal.types";

const API = `${import.meta.env.VITE_API_URL ?? "http://localhost:3001"}/api/goals`;

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGoals() {
      try {
        setError(null);
        const res = await fetch(API, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch goals");
        const data = await res.json();
        setGoals(data);
      } catch (err) {
        setError((err as Error).message);
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
      setError(null);
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(goalData),
      });
      if (!res.ok) throw new Error("Failed to add goal");
      const newGoal = await res.json();
      setGoals((prev) => [...prev, newGoal]);
      return newGoal;
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function updateGoal(goalId: string, updates: Partial<Goal>) {
    try {
      setError(null);
      const res = await fetch(`${API}/${goalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update goal");
      const updated = await res.json();
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function deleteGoal(goalId: string) {
    try {
      setError(null);
      const res = await fetch(`${API}/${goalId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete goal");
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function updateProgress(goalId: string, addValue: number) {
    // Read currentValue from state functionally to avoid stale closure race
    // when two rapid increments fire before either resolves.
    let currentValue: number | undefined;
    setGoals((prev) => {
      const goal = prev.find((g) => g.id === goalId);
      currentValue = goal?.currentValue;
      return prev;
    });
    if (currentValue === undefined) return;
    await updateGoal(goalId, { currentValue: currentValue + addValue });
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
    error,
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
