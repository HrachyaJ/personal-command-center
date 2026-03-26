import { useEffect, useState } from "react";
import type { Task } from "../types/task.types";

const API = "http://localhost:3001/api/tasks";

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
  async function addTask(title: Task["title"]) {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title }),
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
    const res = await fetch(`${API}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ completed: !task.completed }),
    });
    const updated = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function editTask(id: Task["id"], title: Task["title"]) {
    const res = await fetch(`${API}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title }),
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

  // ── Helpers (kept synchronous — no DB call needed) ──────────────────────
  function countCompleted() {
    return tasks.filter((t) => t.completed).length;
  }

  function getCompletedTasks() {
    return tasks.filter((t) => t.completed);
  }

  function getTasksLeft() {
    return tasks.filter((t) => !t.completed).length;
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
    editTask,
  };
}
