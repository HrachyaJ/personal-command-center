import { useState, useEffect } from "react";
import type { Goal } from "../types/goal.types";

const API = `${import.meta.env.VITE_API_URL ?? "http://localhost:3001"}/api/goals`;

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setGoals(data))
      .finally(() => setLoading(false));
  }, []);

  async function addGoal(goalData: {
    title: string;
    description: string;
    targetValue: number;
    unit: string;
    deadline?: string;
  }) {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(goalData),
    });
    const newGoal = await res.json();
    setGoals((prev) => [...prev, newGoal]);
    return newGoal;
  }

  async function updateGoal(goalId: string, updates: Partial<Goal>) {
    const res = await fetch(`${API}/${goalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updates),
    });
    const updated = await res.json();
    setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
  }

  async function deleteGoal(goalId: string) {
    await fetch(`${API}/${goalId}`, {
      method: "DELETE",
      credentials: "include",
    });
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
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
