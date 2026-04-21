import { useState } from "react";
import type { HabitCategory, HabitFrequency } from "../../../types/habit.types";
import { useHabits } from "../../../hooks/habit.hooks";
import HabitList from "../HabitList";
import { CATEGORY_COLORS } from "../../../lib/theme";

const CATEGORIES: { value: HabitCategory; label: string; emoji: string }[] = [
  { value: "health", label: "Health", emoji: "🩺" },
  { value: "fitness", label: "Fitness", emoji: "💪" },
  { value: "mindfulness", label: "Mindfulness", emoji: "🧘" },
  { value: "learning", label: "Learning", emoji: "📚" },
  { value: "productivity", label: "Productivity", emoji: "⚡" },
  { value: "other", label: "Other", emoji: "✨" },
];

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

function getDayLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "short" }).charAt(0);
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

function StatCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col items-center justify-center">
      <Skeleton className="h-9 w-12 mb-2" />
      <Skeleton className="h-3.5 w-20" />
    </div>
  );
}

function HabitListSkeleton() {
  return (
    <div className="py-2 space-y-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-3">
          <Skeleton className="w-5 h-5 rounded-full shrink-0" />
          <Skeleton
            className={`h-4 ${i % 3 === 0 ? "w-2/3" : i % 3 === 1 ? "w-1/2" : "w-3/5"}`}
          />
          <Skeleton className="h-4 w-8 ml-auto shrink-0" />
        </div>
      ))}
    </div>
  );
}

function WeeklyChartSkeleton() {
  return (
    <div className="flex items-end gap-1.5 h-16">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex items-end h-10">
            <Skeleton className="w-full rounded-sm" />
          </div>
          <Skeleton className="h-3 w-3 rounded" />
        </div>
      ))}
    </div>
  );
}

function ProgressSidebarSkeleton() {
  return (
    <>
      <div className="flex items-end justify-between mb-2">
        <Skeleton className="h-8 w-12" />
        <Skeleton className="h-3.5 w-16" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </>
  );
}

function TopStreaksSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <Skeleton className={`h-3.5 ${i % 2 === 0 ? "w-2/5" : "w-1/3"}`} />
          <Skeleton className="h-3.5 w-8" />
        </div>
      ))}
    </div>
  );
}

// ─── Habits ───────────────────────────────────────────────────────────────────

export default function Habits() {
  const {
    habits,
    addHabit,
    removeHabit,
    toggleHabitToday,
    isCompletedToday,
    totalHabits,
    completedToday,
    completionRate,
    longestCurrentStreak,
    loading,
  } = useHabits();

  const [newHabitName, setNewHabitName] = useState("");
  const [category, setCategory] = useState<HabitCategory>("productivity");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [showForm, setShowForm] = useState(false);

  const last7Days = getLast7Days();

  function handleAdd() {
    if (!newHabitName.trim()) return;
    addHabit({
      name: newHabitName.trim(),
      category,
      frequency,
      color: CATEGORY_COLORS[category],
    });
    setNewHabitName("");
    setCategory("productivity");
    setFrequency("daily");
    setShowForm(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") setShowForm(false);
  }

  const weeklyData = last7Days.map((day) => {
    const count = habits.filter((h) => h.completedDates.includes(day)).length;
    const pct = totalHabits > 0 ? count / totalHabits : 0;
    return { day, count, pct };
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Habits</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Build consistency, one day at a time
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              value={totalHabits}
              label="Total Habits"
              color="text-blue-600"
            />
            <StatCard
              value={completedToday}
              label="Done Today"
              color="text-orange-500"
            />
            <StatCard
              value={completionRate + "%"}
              label="Completion"
              color="text-green-600"
            />
            <StatCard
              value={longestCurrentStreak}
              label="Best Streak 🔥"
              color="text-purple-600"
            />
          </>
        )}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Habits list — 2/3 width */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm">
          {/* Add habit bar */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            {!showForm ? (
              <>
                <input
                  type="text"
                  placeholder="New habit..."
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  onFocus={() => setShowForm(true)}
                  className="flex-1 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none"
                />
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add
                </button>
              </>
            ) : (
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  placeholder="Habit name..."
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="w-full text-sm text-gray-700 placeholder-gray-400 outline-none border-b border-gray-200 pb-1 focus:border-blue-400 transition-colors"
                />
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex gap-1 flex-wrap">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setCategory(c.value)}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          category === c.value
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {c.emoji} {c.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1 ml-auto">
                    {(["daily", "weekly"] as HabitFrequency[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFrequency(f)}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          frequency === f
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setNewHabitName("");
                    }}
                    className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={!newHabitName.trim()}
                    className="px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Add Habit
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* List */}
          <div className="px-4">
            {loading ? (
              <HabitListSkeleton />
            ) : (
              <HabitList
                habits={habits}
                onToggle={toggleHabitToday}
                onRemove={removeHabit}
                isCompletedToday={isCompletedToday}
              />
            )}
          </div>
        </div>

        {/* Right sidebar: Analytics */}
        <div className="space-y-4">
          {/* Weekly overview */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              This Week
            </h3>
            {loading ? (
              <WeeklyChartSkeleton />
            ) : (
              <div className="flex items-end gap-1.5 h-16">
                {weeklyData.map(({ day, count, pct }) => {
                  const today = last7Days[last7Days.length - 1];
                  const isToday = day === today;
                  return (
                    <div
                      key={day}
                      className="flex-1 flex flex-col items-center gap-1"
                      title={`${count} / ${totalHabits} habits`}
                    >
                      <div className="w-full relative flex items-end h-10">
                        <div
                          className={`w-full rounded-sm transition-all ${
                            isToday
                              ? "bg-blue-500"
                              : pct > 0
                                ? "bg-blue-200"
                                : "bg-gray-100"
                          }`}
                          style={{
                            height:
                              pct > 0 ? `${Math.max(pct * 100, 15)}%` : "4px",
                            minHeight: "4px",
                          }}
                        />
                      </div>
                      <span
                        className={`text-xs ${isToday ? "text-blue-600 font-semibold" : "text-gray-400"}`}
                      >
                        {getDayLabel(day)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Today's progress */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Today's Progress
            </h3>
            {loading ? (
              <ProgressSidebarSkeleton />
            ) : totalHabits === 0 ? (
              <p className="text-xs text-gray-400">No habits to track yet</p>
            ) : (
              <>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {completionRate}%
                  </span>
                  <span className="text-xs text-gray-400">
                    {completedToday}/{totalHabits} done
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                {completionRate === 100 && (
                  <p className="text-xs text-green-600 font-medium mt-2">
                    🎉 All habits done today!
                  </p>
                )}
              </>
            )}
          </div>

          {/* Top streaks */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Top Streaks
            </h3>
            {loading ? (
              <TopStreaksSkeleton />
            ) : habits.length === 0 ? (
              <p className="text-xs text-gray-400">No habits yet</p>
            ) : (
              <div className="space-y-2">
                {[...habits]
                  .sort((a, b) => b.streak - a.streak)
                  .slice(0, 4)
                  .map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between"
                    >
                      <span className="text-xs text-gray-600 truncate max-w-30px">
                        {h.name}
                      </span>
                      <span
                        className={`text-xs font-semibold ${h.streak > 0 ? "text-orange-500" : "text-gray-300"}`}
                      >
                        {h.streak > 0 ? `🔥 ${h.streak}` : "—"}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shared stat card ─────────────────────────────────────────────────────────

function StatCard({
  value,
  label,
  color,
}: {
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col items-center justify-center">
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
      <span className="text-sm text-gray-500 mt-1">{label}</span>
    </div>
  );
}
