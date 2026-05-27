import type {
  Task,
  TaskFormData,
  TaskCategory,
  TaskPriority,
} from "../../../types/task.types";
import {
  Edit,
  Trash2,
  Calendar,
  Clock,
  RefreshCw,
  Save,
  X,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Badge } from "../../ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Switch } from "../../ui/switch";
import { Collapsible, CollapsibleContent } from "../../ui/collapsible";
import { useState } from "react";
import {
  CATEGORY_ICONS,
  formatDate,
  isOverdue,
  PRIORITY_STYLES,
} from "../../../lib/utils";

export default function TaskItem({
  task,
  onDelete,
  onEdit,
  onToggle,
}: {
  task: Task;
  onDelete: (id: Task["id"]) => void;
  onToggle: (id: Task["id"]) => void;
  onEdit: (id: Task["id"], data: Partial<TaskFormData>) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<TaskFormData>({
    title: task.title,
    dueDate: task.dueDate,
    scheduledFor: task.scheduledFor,
    priority: task.priority,
    category: task.category,
    estimatedMinutes: task.estimatedMinutes,
    isRecurring: task.isRecurring,
    recurrenceRule: task.recurrenceRule,
  });

  function set<K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) {
    setEditData((prev) => ({ ...prev, [key]: value }));
  }

  function saveChanges() {
    if (!editData.title.trim()) return;
    if (!editData.priority) return;
    if (!editData.category) return;
    onEdit(task.id, { ...editData, title: editData.title.trim() });
    setIsEditing(false);
  }

  function cancelEditing() {
    setEditData({
      title: task.title,
      dueDate: task.dueDate,
      scheduledFor: task.scheduledFor,
      priority: task.priority,
      category: task.category,
      estimatedMinutes: task.estimatedMinutes,
      isRecurring: task.isRecurring,
      recurrenceRule: task.recurrenceRule,
    });
    setIsEditing(false);
  }

  const overdue = isOverdue(task.dueDate, task.completed);

  return (
    <li
      className={`rounded-lg border bg-card transition-all ${task.completed ? "opacity-60" : ""} ${overdue ? "border-red-200 bg-red-50/30" : "border-border"}`}
    >
      {/* ── Main row ── */}
      <div className="flex items-center gap-3 px-3 py-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
          className="cursor-pointer border-border shrink-0"
        />

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              autoFocus
              value={editData.title}
              onChange={(e) => set("title", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveChanges();
                if (e.key === "Escape") cancelEditing();
              }}
              className="h-7 text-sm bg-card border-border"
            />
          ) : (
            <span
              className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
            >
              {task.title}
            </span>
          )}

          {/* Metadata badges — only shown when not editing */}
          {!isEditing && (
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {task.priority && (
                <Badge
                  className={`text-[10px] px-1.5 py-0 h-4 ${PRIORITY_STYLES[task.priority].badge}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mr-1 inline-block ${PRIORITY_STYLES[task.priority].dot}`}
                  />
                  {task.priority}
                </Badge>
              )}
              {task.category && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground"
                >
                  {CATEGORY_ICONS[task.category]} {task.category}
                </Badge>
              )}
              {task.dueDate && (
                <span
                  className={`flex items-center gap-0.5 text-[10px] ${overdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}
                >
                  <Calendar size={10} />
                  {overdue ? "Overdue · " : "Due "}
                  {formatDate(task.dueDate)}
                </span>
              )}
              {task.scheduledFor && (
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Clock size={10} />
                  Scheduled {formatDate(task.scheduledFor)}
                </span>
              )}
              {task.estimatedMinutes && (
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Clock size={10} />~{task.estimatedMinutes}m
                </span>
              )}
              {task.isRecurring && (
                <span className="flex items-center gap-0.5 text-[10px] bg-primary text-primary-foreground rounded px-1.5 py-0">
                  <RefreshCw size={10} />
                  {task.recurrenceRule ?? "recurring"}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {isEditing ? (
            <>
              <Button
                onClick={saveChanges}
                size="sm"
                variant="default"
                className="cursor-pointer h-7 px-2 text-xs gap-1"
              >
                <Save size={12} /> Save
              </Button>
              <Button
                onClick={cancelEditing}
                size="sm"
                variant="outline"
                className="cursor-pointer h-7 px-2 text-xs gap-1"
              >
                <X size={12} /> Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setIsEditing(true)}
                variant="ghost"
                size="sm"
                className="cursor-pointer h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              >
                <Edit size={13} />
              </Button>
              <Button
                onClick={() => onDelete(task.id)}
                variant="ghost"
                size="sm"
                className="cursor-pointer h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 size={13} />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Expanded edit fields ── */}
      <Collapsible open={isEditing}>
        <CollapsibleContent>
          <div className="border-t border-border px-3 py-3 space-y-3 bg-muted">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Priority */}
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Priority
                </Label>
                <Select
                  value={editData.priority ?? ""}
                  onValueChange={(v) => set("priority", v as TaskPriority)}
                >
                  <SelectTrigger className="h-7 text-xs bg-card border-border cursor-pointer">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="low"
                      className="cursor-pointer text-xs text-muted-foreground"
                    >
                      Low
                    </SelectItem>
                    <SelectItem
                      value="medium"
                      className="cursor-pointer text-xs text-amber-600"
                    >
                      Medium
                    </SelectItem>
                    <SelectItem
                      value="high"
                      className="cursor-pointer text-xs text-red-600"
                    >
                      High
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Category
                </Label>
                <Select
                  value={editData.category ?? "none"}
                  onValueChange={(v) => set("category", v as TaskCategory)}
                >
                  <SelectTrigger className="h-7 text-xs bg-card border-border cursor-pointer">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work" className="cursor-pointer text-xs">
                      💼 Work
                    </SelectItem>
                    <SelectItem
                      value="health"
                      className="cursor-pointer text-xs"
                    >
                      🏃 Health
                    </SelectItem>
                    <SelectItem
                      value="personal"
                      className="cursor-pointer text-xs"
                    >
                      🏠 Personal
                    </SelectItem>
                    <SelectItem
                      value="learning"
                      className="cursor-pointer text-xs"
                    >
                      📚 Learning
                    </SelectItem>
                    <SelectItem
                      value="finance"
                      className="cursor-pointer text-xs"
                    >
                      💰 Finance
                    </SelectItem>
                    <SelectItem
                      value="other"
                      className="cursor-pointer text-xs"
                    >
                      📌 Other
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Est. minutes */}
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Est. minutes
                </Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g. 30"
                  value={editData.estimatedMinutes ?? ""}
                  onChange={(e) =>
                    set(
                      "estimatedMinutes",
                      e.target.value === "" ? null : parseInt(e.target.value),
                    )
                  }
                  className="h-7 text-xs bg-card border-border"
                />
              </div>

              {/* Due date */}
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Due date
                </Label>
                <Input
                  type="date"
                  value={editData.dueDate ?? ""}
                  onChange={(e) => set("dueDate", e.target.value || null)}
                  className="h-7 text-xs bg-card border-border"
                />
              </div>

              {/* Scheduled for */}
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Schedule for
                </Label>
                <Input
                  type="date"
                  value={editData.scheduledFor ?? ""}
                  onChange={(e) => set("scheduledFor", e.target.value || null)}
                  className="h-7 text-xs bg-card border-border"
                />
              </div>
            </div>

            {/* Recurring */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id={`recurring-${task.id}`}
                  checked={editData.isRecurring}
                  onCheckedChange={(v) => {
                    set("isRecurring", v);
                    if (!v) set("recurrenceRule", null);
                  }}
                  className="[&_span]:shadow-sm data-unchecked:bg-secondary data-unchecked:border-border data-checked:bg-blue-600"
                />
                <Label
                  htmlFor={`recurring-${task.id}`}
                  className="text-xs text-muted-foreground cursor-pointer"
                >
                  Recurring
                </Label>
              </div>
              {editData.isRecurring && (
                <Select
                  value={editData.recurrenceRule ?? ""}
                  onValueChange={(v) => set("recurrenceRule", v || null)}
                >
                  <SelectTrigger className="w-32.5 h-7 text-xs bg-card border-border cursor-pointer">
                    <SelectValue placeholder="Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="daily"
                      className="cursor-pointer text-xs"
                    >
                      Daily
                    </SelectItem>
                    <SelectItem
                      value="weekdays"
                      className="cursor-pointer text-xs"
                    >
                      Weekdays
                    </SelectItem>
                    <SelectItem
                      value="weekly"
                      className="cursor-pointer text-xs"
                    >
                      Weekly
                    </SelectItem>
                    <SelectItem
                      value="monthly"
                      className="cursor-pointer text-xs"
                    >
                      Monthly
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}
