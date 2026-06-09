import { useState } from "react";
import { toast } from "sonner";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Collapsible, CollapsibleContent } from "../../ui/collapsible";
import {
  PlusIcon,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from "lucide-react";
import type {
  TaskCategory,
  TaskFormData,
  TaskPriority,
} from "../../../types/task.types";
import { API_BASE } from "../../../lib/utils";
import { useTranslation } from "../../../hooks/useTranslation";

interface TaskInputProps {
  onAdd: (data: TaskFormData) => void;
}

function Toggle({
  id,
  checked,
  onChange,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
        checked ? "bg-blue-600" : "bg-secondary"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-card shadow-lg transition-transform duration-200 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

const EMPTY_FORM: TaskFormData = {
  title: "",
  dueDate: null,
  scheduledFor: null,
  priority: "low",
  category: "other",
  estimatedMinutes: null,
  isRecurring: false,
  recurrenceRule: null,
};

function runPrediction(form: TaskFormData) {
  const params = new URLSearchParams({
    hour: String(new Date().getHours()),
    day: String(new Date().getDay()),
    priority: form.priority ?? "low",
    category: form.category ?? "other",
    estimatedMinutes: String(form.estimatedMinutes ?? 0),
    has_dueDate: form.dueDate ? "1" : "0",
    isRecurring: form.isRecurring ? "1" : "0",
  });

  fetch(`${API_BASE}/api/predict?${params.toString()}`)
    .then((r) => r.text())
    .then((text) => {
      const prob = parseFloat(text);
      if (isNaN(prob)) return;
      if (prob > 0.75) {
        toast.success(
          `High completion probability: ${(prob * 100).toFixed(1)}%`,
          { description: "Great time to add this task!" },
        );
      } else if (prob >= 0.3) {
        toast.info(
          `Moderate completion probability: ${(prob * 100).toFixed(1)}%`,
          { description: "Consider scheduling it in the morning." },
        );
      } else {
        toast.warning(
          `Low completion probability: ${(prob * 100).toFixed(1)}%`,
          {
            description:
              "Try setting a deadline or breaking it into smaller tasks.",
          },
        );
      }
    })
    .catch(() => {
      toast.error("Task prediction unavailable right now.");
    });
}

export default function TaskInput({ onAdd }: TaskInputProps) {
  const [form, setForm] = useState<TaskFormData>(EMPTY_FORM);
  const [showOptions, setShowOptions] = useState(false);
  const { t } = useTranslation();

  function set<K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (!form.priority) return;
    if (!form.category) return;

    const taskData = { ...form, title: form.title.trim() };

    // Add task immediately — don't wait for ML
    onAdd(taskData);
    setForm(EMPTY_FORM);
    setShowOptions(false);

    // Fire prediction in background — result shows as a toast when ready
    runPrediction(taskData);
  }

  return (
    <form id="task-input" onSubmit={handleSubmit} className="space-y-3">
      {/* Main input row */}
      <div className="flex items-center gap-2">
        <Input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder={t("tasks.newTaskPlaceholder")}
          className="flex-1 bg-card border-border"
        />
        <Select
          value={form.priority ?? ""}
          onValueChange={(v) => set("priority", v as TaskPriority)}
        >
          <SelectTrigger className="w-27.5 bg-card border-border text-xs cursor-pointer">
            <SelectValue placeholder={t("tasks.priority.label")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="low"
              className="cursor-pointer text-muted-foreground"
            >
              {t("tasks.priority.low")}
            </SelectItem>
            <SelectItem
              value="medium"
              className="cursor-pointer text-amber-600"
            >
              {t("tasks.priority.medium")}
            </SelectItem>
            <SelectItem value="high" className="cursor-pointer text-red-600">
              {t("tasks.priority.high")}
            </SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowOptions((v) => !v)}
          className="cursor-pointer gap-1 px-2.5 text-muted-foreground"
          title="More options"
        >
          <SlidersHorizontal size={14} />
          {showOptions ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </Button>

        <Button
          type="submit"
          disabled={!form.title.trim()}
          className="cursor-pointer shrink-0"
        >
          <PlusIcon size={16} />
          {t("tasks.addButton")}
        </Button>
      </div>

      {/* Expanded options */}
      <Collapsible open={showOptions}>
        <CollapsibleContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 pb-1 px-0.5">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {t("tasks.categoryLabel")}
              </Label>
              <Select
                value={form.category ?? ""}
                onValueChange={(v) => set("category", v as TaskCategory)}
              >
                <SelectTrigger className="bg-card border-border text-xs h-8 cursor-pointer">
                  <SelectValue placeholder={t("tasks.categoryLabel")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work" className="cursor-pointer">
                    💼 {t("tasks.category.work")}
                  </SelectItem>
                  <SelectItem value="health" className="cursor-pointer">
                    🏃 {t("tasks.category.health")}
                  </SelectItem>
                  <SelectItem value="personal" className="cursor-pointer">
                    🏠 {t("tasks.category.personal")}
                  </SelectItem>
                  <SelectItem value="learning" className="cursor-pointer">
                    📚 {t("tasks.category.learning")}
                  </SelectItem>
                  <SelectItem value="finance" className="cursor-pointer">
                    💰 {t("tasks.category.finance")}
                  </SelectItem>
                  <SelectItem value="other" className="cursor-pointer">
                    📌 {t("tasks.category.other")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {t("tasks.estimatedMinutes")}
              </Label>
              <Input
                type="number"
                min={1}
                placeholder={t("tasks.estimatedMinutes.placeholder")}
                value={form.estimatedMinutes ?? ""}
                onChange={(e) =>
                  set(
                    "estimatedMinutes",
                    e.target.value === "" ? null : parseInt(e.target.value, 10),
                  )
                }
                className="bg-card border-border text-xs h-8"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {t("tasks.dueDate")}
              </Label>
              <Input
                type="date"
                value={form.dueDate ?? ""}
                onChange={(e) => set("dueDate", e.target.value || null)}
                className="bg-card border-border text-xs h-8"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {t("tasks.scheduledFor")}
              </Label>
              <Input
                type="date"
                value={form.scheduledFor ?? ""}
                onChange={(e) => set("scheduledFor", e.target.value || null)}
                className="bg-card border-border text-xs h-8"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2 px-0.5">
            <div className="flex items-center gap-2">
              <Toggle
                id="recurring"
                checked={form.isRecurring}
                onChange={(v) => {
                  set("isRecurring", v);
                  if (!v) set("recurrenceRule", null);
                }}
              />
              <Label
                htmlFor="recurring"
                className="text-xs text-muted-foreground cursor-pointer"
              >
                {t("tasks.isRecurring")}
              </Label>
            </div>

            {form.isRecurring && (
              <Select
                value={form.recurrenceRule ?? ""}
                onValueChange={(v) => set("recurrenceRule", v || null)}
              >
                <SelectTrigger className="w-32.5 bg-card border-border text-xs h-8 cursor-pointer">
                  <SelectValue placeholder={t("tasks.recurrence.frequency")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily" className="cursor-pointer">
                    {t("tasks.recurrence.daily")}
                  </SelectItem>
                  <SelectItem value="weekdays" className="cursor-pointer">
                    {t("tasks.recurrence.weekdays")}
                  </SelectItem>
                  <SelectItem value="weekly" className="cursor-pointer">
                    {t("tasks.recurrence.weekly")}
                  </SelectItem>
                  <SelectItem value="monthly" className="cursor-pointer">
                    {t("tasks.recurrence.monthly")}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </form>
  );
}
