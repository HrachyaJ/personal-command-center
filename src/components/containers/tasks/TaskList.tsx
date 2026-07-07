import type { Task, TaskFormData } from "../../../types/task.types";
import TaskItem from "./TaskItem";

export default function TaskList({
  tasks,
  onDelete,
  onToggle,
  onEdit,
  deletingIds,
}: {
  tasks: Task[];
  onDelete: (id: Task["id"]) => void;
  onToggle: (id: Task["id"]) => void;
  onClearCompleted: () => void;
  onCountCompleted: () => number;
  onEdit: (id: Task["id"], data: Partial<TaskFormData>) => void;
  deletingIds?: Set<string>;
}) {
  // Sort: incomplete first, then by priority (high → medium → low → none), then by due date
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

  const sorted = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const pa = a.priority != null ? (priorityOrder[a.priority] ?? 3) : 3;
    const pb = b.priority != null ? (priorityOrder[b.priority] ?? 3) : 3;
    if (pa !== pb) return pa - pb;
    if (a.dueDate && b.dueDate)
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });

  return (
    <ul className="space-y-2">
      {sorted.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onDelete={onDelete}
          onToggle={onToggle}
          onEdit={onEdit}
          isDeleting={deletingIds?.has(task.id) ?? false}
        />
      ))}
    </ul>
  );
}
