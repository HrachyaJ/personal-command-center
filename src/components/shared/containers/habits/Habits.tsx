import { useState } from "react";
import type {
  HabitCategory,
  HabitFrequency,
} from "../../../../types/habit.types";
import { useHabits } from "../../../../hooks/habit.hooks";
import HabitList from "./HabitList";
import { CATEGORY_COLORS } from "../../../../lib/theme";
import {
  HabitListSkeleton,
  HabitStatCardSkeleton,
  ProgressSidebarSkeleton,
  StatCardSkeleton,
  TopStreaksSkeleton,
  WeeklyChartSkeleton,
} from "../../Skeletons";
import { CATEGORIES, getDayLabel, getLast7Days } from "../../../../lib/utils";
import { StatCard } from "../../StatCard";

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
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
          Habits
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Build consistency, one day at a time
        </p>
      </div>

      {/* Stats row — 2 cols on mobile, 4 on sm+ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <HabitStatCardSkeleton key={i} />
          ))
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

      {/* Main content — stacked on mobile, side-by-side on lg+ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Habits list — full width on mobile, 2/3 on lg */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm">
          {/* Add habit bar */}
          <div className="flex items-center gap-3 p-3 sm:p-4 border-b border-border">
            {!showForm ? (
              <>
                <input
                  type="text"
                  placeholder="New habit..."
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  onFocus={() => setShowForm(true)}
                  className="flex-1 text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none"
                />
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shrink-0"
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
                  <span className="hidden sm:inline">Add</span>
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
                  className="w-full text-sm text-foreground placeholder:text-muted-foreground outline-none border-b border-border pb-1 focus:border-blue-400 transition-colors"
                />
                {/* Category buttons — wrap on mobile */}
                <div className="flex items-start gap-3 flex-col sm:flex-row">
                  <div className="flex gap-1 flex-wrap">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setCategory(c.value)}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          category === c.value
                            ? "bg-blue-600 text-white"
                            : "bg-muted text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {c.emoji} {c.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1 sm:ml-auto">
                    {(["daily", "weekly"] as HabitFrequency[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFrequency(f)}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          frequency === f
                            ? "bg-blue-600 text-white"
                            : "bg-muted text-muted-foreground hover:bg-secondary"
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
                    className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
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
          <div className="px-3 sm:px-4">
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

        {/* Right sidebar — row on mobile (2 cols), column on lg */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
          {/* Weekly overview */}
          <div className="bg-card border border-border rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">
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
                                : "bg-muted"
                          }`}
                          style={{
                            height:
                              pct > 0 ? `${Math.max(pct * 100, 15)}%` : "4px",
                            minHeight: "4px",
                          }}
                        />
                      </div>
                      <span
                        className={`text-xs ${isToday ? "text-blue-600 font-semibold" : "text-muted-foreground"}`}
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
          <div className="bg-card border border-border rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Today's Progress
            </h3>
            {loading ? (
              <ProgressSidebarSkeleton />
            ) : totalHabits === 0 ? (
              <p className="text-xs text-muted-foreground">
                No habits to track yet
              </p>
            ) : (
              <>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-2xl font-bold text-foreground">
                    {completionRate}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {completedToday}/{totalHabits} done
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
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
          <div className="bg-card border border-border rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Top Streaks
            </h3>
            {loading ? (
              <TopStreaksSkeleton />
            ) : habits.length === 0 ? (
              <p className="text-xs text-muted-foreground">No habits yet</p>
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
                      <span className="text-xs text-muted-foreground truncate mr-2">
                        {h.name}
                      </span>
                      <span
                        className={`text-xs font-semibold shrink-0 ${h.streak > 0 ? "text-orange-500" : "text-muted-foreground"}`}
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
