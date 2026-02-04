import type { Task } from "../../types/task.types";
import { Edit } from "lucide-react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { useState } from "react";
import { Input } from "../ui/input";

export default function TaskItem({
  task,
  onDelete,
  onEdit,
  onToggle,
}: {
  task: Task;
  onDelete: (id: Task["id"]) => void;
  onToggle: (id: Task["id"]) => void;
  onEdit: (id: Task["id"], title: Task["title"]) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);

  function startEditing() {
    setIsEditing(true);
  }

  function saveChanges() {
    onEdit(task.id, editValue);
    setIsEditing(false);
  }

  function cancelEditing() {
    setIsEditing(false);
    setEditValue(task.title);
  }

  function handleEdit() {
    if (isEditing) {
      saveChanges();
    } else {
      startEditing();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && isEditing) {
      saveChanges();
    } else if (e.key === "Escape" && isEditing) {
      cancelEditing();
    }
  }

  return (
    <div className="w-full">
      <li className="p-2 border-b flex items-center justify-between gap-4">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
          className="mr-2 cursor-pointer border-border"
        />
        {isEditing ? (
          <div className="grow" onKeyDown={handleKeyDown}>
            <Input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="border p-1 bg-white w-full"
            />
          </div>
        ) : (
          <span
            className={`grow ${
              task.completed ? "line-through text-gray-500" : ""
            }`}
          >
            {task.title}
          </span>
        )}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleEdit}
            variant="outline"
            className="p-1 cursor-pointer size-7 rounded-full"
          >
            <Edit size={14} />
          </Button>
          <Button
            onClick={() => onDelete(task.id)}
            variant="outline"
            className="p-1 cursor-pointer size-7 rounded-full"
          >
            ✕
          </Button>
        </div>
      </li>
    </div>
  );
}
