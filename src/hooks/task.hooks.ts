import { useEffect, useState } from "react";
import { getTasks, saveTasks } from "../entities/tasks/task.storage";
import type { Task } from "../types/task.types";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => getTasks());

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  function addTask(title: Task["title"]) {
    setTasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title, completed: false },
    ]);
  }

  function removeTask(id: Task["id"]) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function toggleTask(id: Task["id"]) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }

  return {
    tasks,
    addTask,
    removeTask,
    toggleTask,
  };
}
