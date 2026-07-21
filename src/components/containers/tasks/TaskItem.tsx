import type {
  Task,
  TaskFormData,
  TaskCategory,
  TaskPriority,
} from "../../../types/task.types";
import { Edit, Trash2, Calendar, Clock, Save, X } from "lucide-react";
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
import { Collapsible, CollapsibleContent } from "../../ui/collapsible";
import { useState } from "react";
import {
  CATEGORY_ICONS,
  formatDate,
  isOverdue,
  PRIORITY_STYLES,
} from "../../../lib/utils";
import { useTranslation } from "../../../hooks/useTranslation";

export default function TaskItem({
  task,
  onDelete,
  onEdit,
  onToggle,
  isDeleting = false,
}: {
  task: Task;
  onDelete: (id: Task["id"]) => void;
  onToggle: (id: Task["id"]) => void;
  onEdit: (id: Task["id"], data: Partial<TaskFormData>) => void;
  isDeleting?: boolean;
}) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<TaskFormData>({
    title: task.title,
    dueDate: task.dueDate,
    scheduledFor: task.scheduledFor,
    priority: task.priority,
    category: task.category,
    estimatedMinutes: task.estimatedMinutes,
  });

  function set<K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) {
    setEditData((prev) => ({ ...prev, [key]: value }));
  }

  function startEditing() {
    setEditData({
      title: task.title,
      dueDate: task.dueDate,
      scheduledFor: task.scheduledFor,
      priority: task.priority,
      category: task.category,
      estimatedMinutes: task.estimatedMinutes,
    });
    setIsEditing(true);
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
    });
    setIsEditing(false);
  }

  const overdue = isOverdue(task.dueDate, task.completed);

  if (isDeleting) {
    return (
      <li className="rounded-lg border border-border bg-card">
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="w-4 h-4 rounded bg-muted animate-pulse shrink-0" />
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="h-3.5 w-40 bg-muted animate-pulse rounded" />
            <div className="h-2.5 w-24 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </li>
    );
  }

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
                  {t(`tasks.priority.${task.priority}`)}
                </Badge>
              )}
              {task.category && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground"
                >
                  {CATEGORY_ICONS[task.category]}{" "}
                  {t(`tasks.category.${task.category}`)}
                </Badge>
              )}
              {task.dueDate && (
                <span
                  className={`flex items-center gap-0.5 text-[10px] ${overdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}
                >
                  <Calendar size={10} />
                  {overdue ? `${t("tasks.overdue")} · ` : `${t("tasks.due")} `}
                  {formatDate(task.dueDate)}
                </span>
              )}
              {task.scheduledFor && (
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Clock size={10} />
                  {t("tasks.scheduled")} {formatDate(task.scheduledFor)}
                </span>
              )}
              {task.estimatedMinutes && (
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Clock size={10} />~{task.estimatedMinutes}m
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
                <Save size={12} /> {t("tasks.save")}
              </Button>
              <Button
                onClick={cancelEditing}
                size="sm"
                variant="outline"
                className="cursor-pointer h-7 px-2 text-xs gap-1"
              >
                <X size={12} /> {t("tasks.cancel")}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={startEditing}
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
                  {t("tasks.priority.label")}
                </Label>
                <Select
                  value={editData.priority ?? ""}
                  onValueChange={(v) => set("priority", v as TaskPriority)}
                >
                  <SelectTrigger className="h-7 text-xs bg-card border-border cursor-pointer">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="low"
                      className="cursor-pointer text-xs text-muted-foreground"
                    >
                      {t("tasks.priority.low")}
                    </SelectItem>
                    <SelectItem
                      value="medium"
                      className="cursor-pointer text-xs text-amber-600"
                    >
                      {t("tasks.priority.medium")}
                    </SelectItem>
                    <SelectItem
                      value="high"
                      className="cursor-pointer text-xs text-red-600"
                    >
                      {t("tasks.priority.high")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {t("tasks.categoryLabel")}
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
                      💼 {t("tasks.category.work")}
                    </SelectItem>
                    <SelectItem
                      value="health"
                      className="cursor-pointer text-xs"
                    >
                      🏃 {t("tasks.category.health")}
                    </SelectItem>
                    <SelectItem
                      value="personal"
                      className="cursor-pointer text-xs"
                    >
                      🏠 {t("tasks.category.personal")}
                    </SelectItem>
                    <SelectItem
                      value="learning"
                      className="cursor-pointer text-xs"
                    >
                      📚 {t("tasks.category.learning")}
                    </SelectItem>
                    <SelectItem
                      value="finance"
                      className="cursor-pointer text-xs"
                    >
                      💰 {t("tasks.category.finance")}
                    </SelectItem>
                    <SelectItem
                      value="other"
                      className="cursor-pointer text-xs"
                    >
                      📌 {t("tasks.category.other")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Est. minutes */}
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {t("tasks.estimatedMinutes")}
                </Label>
                <Input
                  type="number"
                  min={1}
                  placeholder={t("tasks.estimatedMinutes.placeholder")}
                  value={editData.estimatedMinutes ?? ""}
                  onChange={(e) =>
                    set(
                      "estimatedMinutes",
                      e.target.value === ""
                        ? null
                        : parseInt(e.target.value, 10),
                    )
                  }
                  className="h-7 text-xs bg-card border-border"
                />
              </div>

              {/* Due date */}
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {t("tasks.dueDate")}
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
                  {t("tasks.scheduledFor")}
                </Label>
                <Input
                  type="date"
                  value={editData.scheduledFor ?? ""}
                  onChange={(e) => set("scheduledFor", e.target.value || null)}
                  className="h-7 text-xs bg-card border-border"
                />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}
