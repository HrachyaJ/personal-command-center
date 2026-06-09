import { useState } from "react";
import type { Habit } from "../../../types/habit.types";
import { CATEGORY_COLORS } from "../../../lib/theme";
import { useTranslation } from "../../../hooks/useTranslation";
import { getCategoryLabels } from "../../../lib/utils";

interface HabitListProps {
  habits: Habit[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => Promise<void>;
  isCompletedToday: (habit: Habit) => boolean;
}

export default function HabitList({
  habits,
  onToggle,
  onRemove,
  isCompletedToday,
}: HabitListProps) {
  const { t } = useTranslation();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null); // add this

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <span className="text-3xl">🌱</span>
        </div>
        <p className="text-muted-foreground text-sm font-medium">
          {t("habits.list.emptyTitle")}
        </p>
        <p className="text-muted-foreground text-xs mt-1">
          {t("habits.list.emptySubtitle")}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {habits.map((habit) => {
        // Add this block at the top:
        if (deletingId === habit.id) {
          return (
            <div key={habit.id} className="flex items-center gap-4 py-4 px-1">
              <div className="shrink-0 w-6 h-6 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                <div className="h-2.5 w-20 bg-muted animate-pulse rounded" />
              </div>
            </div>
          );
        }

        const done = isCompletedToday(habit);
        const color =
          habit.color || CATEGORY_COLORS[habit.category] || "#3b82f6";

        return (
          <div
            key={habit.id}
            className={`flex items-center gap-4 py-4 px-1 group transition-colors ${
              done ? "bg-green-500/10" : "hover:bg-muted/60"
            }`}
          >
            {/* Completion circle */}
            <button
              onClick={() => onToggle(habit.id)}
              className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                done
                  ? "border-green-500 bg-green-500"
                  : "border-border hover:border-primary"
              }`}
              aria-label={
                done
                  ? t("habits.list.markIncomplete")
                  : t("habits.list.markComplete")
              }
            >
              {done && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>

            {/* Color dot + name */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <div className="min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    done
                      ? "line-through text-muted-foreground"
                      : "text-foreground"
                  }`}
                >
                  {habit.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getCategoryLabels(t)[habit.category]} ·{" "}
                  {habit.frequency === "daily"
                    ? t("habits.frequency.daily")
                    : t("habits.frequency.weekly")}
                </p>
              </div>
            </div>

            {/* Streak badge */}
            <div className="flex items-center gap-1 shrink-0">
              {habit.streak > 0 && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-xs font-semibold">
                  🔥 {habit.streak}
                </span>
              )}
            </div>

            {/* Delete button */}
            <div className="shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              {confirmDelete === habit.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={async () => {
                      setDeletingId(habit.id);
                      setConfirmDelete(null);
                      await onRemove(habit.id);
                      setDeletingId(null);
                    }}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    {t("habits.list.confirmDelete")}
                  </button>
                  <span className="text-muted-foreground">|</span>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="text-xs text-muted-foreground hover:text-muted-foreground"
                  >
                    {t("habits.list.cancelDelete")}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(habit.id)}
                  className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-red-400 transition-colors"
                  aria-label="Remove habit"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
