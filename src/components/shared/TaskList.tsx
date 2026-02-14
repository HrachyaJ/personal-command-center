import type { Task } from "../../types/task.types";
import TaskItem from "./TaskItem";

export default function TaskList({
  tasks,
  onDelete,
  onToggle,
  onEdit,
}: {
  tasks: Task[];
  onDelete: (id: Task["id"]) => void;
  onToggle: (id: Task["id"]) => void;
  onClearCompleted: () => void;
  onCountCompleted: () => number;
  onEdit: (id: Task["id"], title: Task["title"]) => void;
}) {
  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onDelete={onDelete}
          onToggle={onToggle}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
}
