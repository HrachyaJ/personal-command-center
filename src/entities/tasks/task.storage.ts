import type { Task } from "../../types/task.types";
import { storage } from "../../lib/storage";

const TASKS_KEY = "tasks";

export const getTasks = (): Task[] => {
  const raw = storage.get(TASKS_KEY);
  return raw ? (JSON.parse(raw) as Task[]) : [];
};

export const saveTasks = (tasks: Task[]): void => {
  storage.set(TASKS_KEY, JSON.stringify(tasks));
};

export const clearTasks = (): void => {
  storage.remove(TASKS_KEY);
};
