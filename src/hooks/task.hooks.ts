import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Task, TaskFormData } from "../types/task.types";
import { authFetch, authFetchJson, authFetchOrThrow } from "../lib/utils";

const API = `${import.meta.env.VITE_API_URL ?? "http://localhost:3001"}/api/tasks`;

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      try {
        setError(null);
        const data = await authFetchJson<Task[]>(
          API,
          {},
          "Failed to load tasks.",
        );
        setTasks(data);
      } catch (err) {
        const message = getErrorMessage(err, "Failed to load tasks.");
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  async function addTask(data: TaskFormData) {
    try {
      setError(null);
      const newTask = await authFetchJson<Task>(
        API,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
        },
        "Failed to add task.",
      );
      setTasks((prev) => [...prev, newTask]);
    } catch (err) {
      const message = getErrorMessage(err, "Failed to add task.");
      setError(message);
      toast.error(message);
    }
  }

  async function removeTask(id: Task["id"]) {
    try {
      setError(null);
      await authFetchOrThrow(
        `${API}/${id}`,
        { method: "DELETE" },
        "Failed to remove task.",
      );
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      const message = getErrorMessage(err, "Failed to remove task.");
      setError(message);
      toast.error(message);
    }
  }

  async function toggleTask(id: Task["id"]) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const patch = {
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString() : null,
    };

    try {
      setError(null);
      const updated = await authFetchJson<Task>(
        `${API}/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        },
        "Failed to update task.",
      );
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      const message = getErrorMessage(err, "Failed to update task.");
      setError(message);
      toast.error(message);
    }
  }

  async function editTask(id: Task["id"], data: Partial<TaskFormData>) {
    try {
      setError(null);
      const updated = await authFetchJson<Task>(
        `${API}/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
        "Failed to edit task.",
      );
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      const message = getErrorMessage(err, "Failed to edit task.");
      setError(message);
      toast.error(message);
    }
  }

  async function clearCompleted() {
    const completed = tasks.filter((t) => t.completed);
    try {
      setError(null);
      const results = await Promise.allSettled(
        completed.map((t) =>
          authFetchOrThrow(
            `${API}/${t.id}`,
            { method: "DELETE" },
            "Failed to remove completed task.",
          ),
        ),
      );
      const deletedIds = new Set(
        completed
          .filter((_, i) => results[i].status === "fulfilled")
          .map((t) => t.id),
      );
      setTasks((prev) => prev.filter((t) => !deletedIds.has(t.id)));
      const failed = results.some((result) => result.status === "rejected");
      if (failed) {
        const message = "Failed to clear some completed tasks.";
        setError(message);
        toast.error(message);
      }
    } catch (err) {
      const message = getErrorMessage(err, "Failed to clear completed tasks.");
      setError(message);
      toast.error(message);
    }
  }

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
    error,
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
