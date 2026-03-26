import { useState } from "react";
import type { Habit } from "../../types/habit.types";

const CATEGORY_LABELS: Record<string, string> = {
  health: "🩺 Health",
  fitness: "💪 Fitness",
  mindfulness: "🧘 Mindfulness",
  learning: "📚 Learning",
  productivity: "⚡ Productivity",
  other: "✨ Other",
};

const CATEGORY_COLORS: Record<string, string> = {
  health: "#22c55e",
  fitness: "#f97316",
  mindfulness: "#a855f7",
  learning: "#3b82f6",
  productivity: "#eab308",
  other: "#6b7280",
};

interface HabitListProps {
  habits: Habit[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  isCompletedToday: (habit: Habit) => boolean;
}

export default function HabitList({
  habits,
  onToggle,
  onRemove,
  isCompletedToday,
}: HabitListProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <span className="text-3xl">🌱</span>
        </div>
        <p className="text-gray-500 text-sm font-medium">No habits yet</p>
        <p className="text-gray-400 text-xs mt-1">
          Add your first habit to start tracking
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {habits.map((habit) => {
        const done = isCompletedToday(habit);
        const color =
          habit.color || CATEGORY_COLORS[habit.category] || "#3b82f6";

        return (
          <div
            key={habit.id}
            className={`flex items-center gap-4 py-4 px-1 group transition-colors ${
              done ? "bg-green-50/40" : "hover:bg-gray-50/60"
            }`}
          >
            {/* Completion circle */}
            <button
              onClick={() => onToggle(habit.id)}
              className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                done
                  ? "border-green-500 bg-green-500"
                  : "border-gray-300 hover:border-blue-400"
              }`}
              aria-label={done ? "Mark incomplete" : "Mark complete"}
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
                    done ? "line-through text-gray-400" : "text-gray-800"
                  }`}
                >
                  {habit.name}
                </p>
                <p className="text-xs text-gray-400">
                  {CATEGORY_LABELS[habit.category]} ·{" "}
                  {habit.frequency === "daily" ? "Daily" : "Weekly"}
                </p>
              </div>
            </div>

            {/* Streak badge */}
            <div className="flex items-center gap-1 shrink-0">
              {habit.streak > 0 && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold">
                  🔥 {habit.streak}
                </span>
              )}
            </div>

            {/* Delete button */}
            <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {confirmDelete === habit.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      onRemove(habit.id);
                      setConfirmDelete(null);
                    }}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Delete
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(habit.id)}
                  className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors"
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
