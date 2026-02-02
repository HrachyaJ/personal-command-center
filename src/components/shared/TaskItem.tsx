import type { Task } from "../../types/task.types";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";

export default function TaskItem({
  task,
  onDelete,
  onToggle,
  onClearCompleted,
  onCountCompleted,
}: {
  task: Task;
  onDelete: (id: Task["id"]) => void;
  onToggle: (id: Task["id"]) => void;
  onClearCompleted: () => void;
  onCountCompleted: () => number;
}) {
  return (
    <li className="p-2 border-b flex items-center justify-between">
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        className="cursor-pointer"
      />
      <span
        style={{ textDecoration: task.completed ? "line-through" : "none" }}
      >
        {task.title}
      </span>
      <Button
        onClick={() => onDelete(task.id)}
        variant="outline"
        className="p-1 cursor-pointer ml-2 size-7 rounded-full flex items-center justify-center"
      >
        ✕
      </Button>
    </li>
  );
}
