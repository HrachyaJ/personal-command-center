import { useEffect, useState } from "react";
import type { Task, TaskFormData } from "../types/task.types";

const API = `${import.meta.env.VITE_API_URL ?? "http://localhost:3001"}/api/tasks`;

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch all tasks for the logged-in user ──────────────────────────────
  useEffect(() => {
    fetch(API, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setTasks(data))
      .finally(() => setLoading(false));
  }, []);

  // ── CRUD ────────────────────────────────────────────────────────────────
  async function addTask(data: TaskFormData) {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title: data.title,
        dueDate: data.dueDate,
        scheduledFor: data.scheduledFor,
        priority: data.priority,
        category: data.category,
        estimatedMinutes: data.estimatedMinutes,
        isRecurring: data.isRecurring,
        recurrenceRule: data.recurrenceRule,
      }),
    });
    const newTask = await res.json();
    setTasks((prev) => [...prev, newTask]);
  }

  async function removeTask(id: Task["id"]) {
    await fetch(`${API}/${id}`, { method: "DELETE", credentials: "include" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function toggleTask(id: Task["id"]) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    // Also stamp completedAt when completing, clear it when un-completing
    const patch = {
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString() : null,
    };

    const res = await fetch(`${API}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(patch),
    });
    const updated = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function editTask(id: Task["id"], data: Partial<TaskFormData>) {
    const res = await fetch(`${API}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    const updated = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function clearCompleted() {
    const completed = tasks.filter((t) => t.completed);
    await Promise.all(
      completed.map((t) =>
        fetch(`${API}/${t.id}`, { method: "DELETE", credentials: "include" }),
      ),
    );
    setTasks((prev) => prev.filter((t) => !t.completed));
  }

  // ── Helpers (synchronous — no DB call needed) ───────────────────────────
  function countCompleted() {
    return tasks.filter((t) => t.completed).length;
  }

  function getCompletedTasks() {
    return tasks.filter((t) => t.completed);
  }

  function getTasksLeft() {
    return tasks.filter((t) => !t.completed).length;
  }

  function getStats() {
    const completed = tasks.filter((t) => t.completed).length;
    const total = tasks.length;
    const active = total - completed;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;
    return [
      { label: "Total Tasks", value: total, color: "text-blue-600" },
      { label: "Active Tasks", value: active, color: "text-amber-600" },
      { label: "Completed", value: completed, color: "text-emerald-600" },
      {
        label: "Completion",
        value: `${completionRate}%`,
        color: "text-purple-600",
      },
    ];
  }

  return {
    tasks,
    loading,
    addTask,
    removeTask,
    toggleTask,
    clearCompleted,
    countCompleted,
    getCompletedTasks,
    getTasksLeft,
    getStats,
    editTask,
  };
}
