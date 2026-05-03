export type TaskPriority = "low" | "medium" | "high";
export type TaskCategory =
  | "work"
  | "health"
  | "personal"
  | "learning"
  | "finance"
  | "other";

export interface Task {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  createdAt: string;

  // Scheduling
  dueDate: string | null;
  scheduledFor: string | null;

  // Classification
  priority: TaskPriority;
  category: TaskCategory;
  estimatedMinutes: number | null;

  // Completion tracking
  completedAt: string | null;

  // Recurrence
  isRecurring: boolean;
  recurrenceRule: string | null;
}

// What the user fills in when creating/editing a task
export interface TaskFormData {
  title: string;
  dueDate: string | null;
  scheduledFor: string | null;
  priority: TaskPriority;
  category: TaskCategory;
  estimatedMinutes: number | null;
  isRecurring: boolean;
  recurrenceRule: string | null;
}
