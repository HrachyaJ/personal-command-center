import { useState } from "react";
import { toast } from "sonner";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { Label } from "../../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { Collapsible, CollapsibleContent } from "../../../ui/collapsible";
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
} from "../../../../types/task.types";
import { API_BASE } from "../../../../lib/utils";

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

export default function TaskInput({ onAdd }: TaskInputProps) {
  const [form, setForm] = useState<TaskFormData>(EMPTY_FORM);
  const [showOptions, setShowOptions] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);

  function set<K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (!form.priority) return;
    if (!form.category) return;

    setIsPredicting(true);
    try {
      const params = new URLSearchParams({
        hour: String(new Date().getHours()),
        day: String(new Date().getDay()),
        priority: form.priority ?? "low",
        category: form.category ?? "other",
        estimatedMinutes: String(form.estimatedMinutes ?? 0),
        has_dueDate: form.dueDate ? "1" : "0",
        isRecurring: form.isRecurring ? "1" : "0",
      });

      const response = await fetch(
        `${API_BASE}/api/predict?${params.toString()}`,
      );
      const completionProbability = parseFloat(await response.text());

      if (completionProbability > 0.75) {
        toast.success(
          `High completion probability: ${(completionProbability * 100).toFixed(1)}%`,
          { description: "Great time to add this task!" },
        );
      } else if (completionProbability >= 0.3) {
        toast.info(
          `Moderate completion probability: ${(completionProbability * 100).toFixed(1)}%`,
          { description: "Consider scheduling it in the morning." },
        );
      } else {
        toast.warning(
          `Low completion probability: ${(completionProbability * 100).toFixed(1)}%`,
          {
            description:
              "Try setting a deadline or breaking it into smaller tasks.",
          },
        );
      }
    } catch {
      // Silently skip if the ML server is down — don't block task creation
    } finally {
      setIsPredicting(false);
    }

    onAdd({ ...form, title: form.title.trim() });
    setForm(EMPTY_FORM);
    setShowOptions(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Main input row */}
      <div className="flex items-center gap-2">
        <Input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="New task..."
          className="flex-1 bg-card border-border"
        />
        {/* Priority quick-select inline */}
        <Select
          value={form.priority ?? ""}
          onValueChange={(v) => set("priority", v as TaskPriority)}
        >
          <SelectTrigger className="w-27.5 bg-card border-border text-xs cursor-pointer">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="low"
              className="cursor-pointer text-muted-foreground"
            >
              Low
            </SelectItem>
            <SelectItem
              value="medium"
              className="cursor-pointer text-amber-600"
            >
              Medium
            </SelectItem>
            <SelectItem value="high" className="cursor-pointer text-red-600">
              High
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
          disabled={!form.title.trim() || isPredicting}
          className="cursor-pointer shrink-0"
        >
          <PlusIcon size={16} />
          {isPredicting ? "Analyzing..." : "Add"}
        </Button>
      </div>

      {/* Expanded options */}
      <Collapsible open={showOptions}>
        <CollapsibleContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 pb-1 px-0.5">
            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <Select
                value={form.category ?? ""}
                onValueChange={(v) => set("category", v as TaskCategory)}
              >
                <SelectTrigger className="bg-card border-border text-xs h-8 cursor-pointer">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work" className="cursor-pointer">
                    💼 Work
                  </SelectItem>
                  <SelectItem value="health" className="cursor-pointer">
                    🏃 Health
                  </SelectItem>
                  <SelectItem value="personal" className="cursor-pointer">
                    🏠 Personal
                  </SelectItem>
                  <SelectItem value="learning" className="cursor-pointer">
                    📚 Learning
                  </SelectItem>
                  <SelectItem value="finance" className="cursor-pointer">
                    💰 Finance
                  </SelectItem>
                  <SelectItem value="other" className="cursor-pointer">
                    📌 Other
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estimated time */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Est. minutes
              </Label>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 30"
                value={form.estimatedMinutes ?? ""}
                onChange={(e) =>
                  set(
                    "estimatedMinutes",
                    e.target.value === "" ? null : parseInt(e.target.value),
                  )
                }
                className="bg-card border-border text-xs h-8"
              />
            </div>

            {/* Due date */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Due date</Label>
              <Input
                type="date"
                value={form.dueDate ?? ""}
                onChange={(e) => set("dueDate", e.target.value || null)}
                className="bg-card border-border text-xs h-8"
              />
            </div>

            {/* Scheduled for */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Schedule for
              </Label>
              <Input
                type="date"
                value={form.scheduledFor ?? ""}
                onChange={(e) => set("scheduledFor", e.target.value || null)}
                className="bg-card border-border text-xs h-8"
              />
            </div>
          </div>

          {/* Recurring row */}
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
                Recurring
              </Label>
            </div>

            {form.isRecurring && (
              <Select
                value={form.recurrenceRule ?? ""}
                onValueChange={(v) => set("recurrenceRule", v || null)}
              >
                <SelectTrigger className="w-32.5 bg-card border-border text-xs h-8 cursor-pointer">
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily" className="cursor-pointer">
                    Daily
                  </SelectItem>
                  <SelectItem value="weekdays" className="cursor-pointer">
                    Weekdays
                  </SelectItem>
                  <SelectItem value="weekly" className="cursor-pointer">
                    Weekly
                  </SelectItem>
                  <SelectItem value="monthly" className="cursor-pointer">
                    Monthly
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
