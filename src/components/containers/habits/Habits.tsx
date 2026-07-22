import { useEffect, useState } from "react";
import type { HabitCategory, HabitFrequency } from "../../../types/habit.types";
import { useHabits } from "../../../hooks/habit.hooks";
import HabitList from "./HabitList";
import { CATEGORY_COLORS } from "../../../lib/theme";
import {
  HabitListSkeleton,
  HabitStatCardSkeleton,
  ProgressSidebarSkeleton,
  TopStreaksSkeleton,
  WeeklyChartSkeleton,
} from "../../shared/Skeletons";
import { getCategories, getDayLabel, getLast7Days } from "../../../lib/utils";
import { StatCard } from "../../shared/StatCard";
import { OnboardingDialog } from "../../shared/OnboardingPanel";
import { useOnboardingSeen } from "../../../hooks/onboarding.hooks";
import { useTranslation } from "../../../hooks/useTranslation";
import { Button } from "../../ui/button";

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
    longestStreak,
    loading,
  } = useHabits();
  const { t, locale } = useTranslation();

  const [newHabitName, setNewHabitName] = useState("");
  const [category, setCategory] = useState<HabitCategory>("productivity");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [showForm, setShowForm] = useState(false);
  const last7Days = getLast7Days();
  const { seen: onboardingSeen, markSeen: markOnboardingSeen } =
    useOnboardingSeen("habits");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    if (loading || onboardingSeen) return;

    if (totalHabits > 0) {
      // User already has data (e.g. seeded/legacy habits) — they're not new,
      // so retire the flag silently instead of waiting for an empty state.
      markOnboardingSeen();
      return;
    }

    setIsOnboardingOpen(true);
  }, [loading, totalHabits, onboardingSeen]);

  const handleOnboardingOpenChange = (open: boolean) => {
    setIsOnboardingOpen(open);
    if (!open) {
      markOnboardingSeen();
    }
  };

  const handleStartHabitOnboarding = () => {
    markOnboardingSeen();
    setIsOnboardingOpen(false);
    setShowForm(true);
  };

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
          {t("habits.header")}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t("habits.subtitle")}
        </p>
      </div>

      <OnboardingDialog
        open={isOnboardingOpen}
        onOpenChange={handleOnboardingOpenChange}
        title={t("habits.onboarding.title")}
        subtitle={t("habits.onboarding.subtitle")}
        steps={[
          {
            title: t("habits.onboarding.step.chooseBehavior"),
            description: t("habits.onboarding.step.chooseBehaviorDesc"),
          },
          {
            title: t("habits.onboarding.step.setCategory"),
            description: t("habits.onboarding.step.setCategoryDesc"),
          },
          {
            title: t("habits.onboarding.step.trackCompletion"),
            description: t("habits.onboarding.step.trackCompletionDesc"),
          },
        ]}
        primaryAction={{
          label: t("habits.onboarding.primaryAction"),
          onClick: handleStartHabitOnboarding,
        }}
        secondaryAction={{
          label: t("habits.onboarding.secondaryAction"),
          onClick: () => handleOnboardingOpenChange(false),
        }}
      />

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
              label={t("habits.stats.totalHabits")}
              color="text-blue-600"
            />
            <StatCard
              value={completedToday}
              label={t("habits.stats.doneToday")}
              color="text-orange-500"
            />
            <StatCard
              value={completionRate + "%"}
              label={t("habits.stats.completion")}
              color="text-green-600"
            />
            <StatCard
              value={longestStreak}
              label={t("habits.stats.bestStreak")}
              color="text-purple-600"
            />
          </>
        )}
      </div>

      {/* Main content — stacked on mobile, side-by-side on lg+ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 pb-15 lg:pb-0">
        {/* Habits list — full width on mobile, 2/3 on lg */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm self-start pb-2">
          {/* Add habit bar */}
          <div className="flex items-center gap-3 p-3 sm:p-4 border-b border-border">
            {!showForm ? (
              <>
                <input
                  type="text"
                  placeholder={t("habits.newHabitPlaceholder")}
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  onFocus={() => setShowForm(true)}
                  className="flex-1 text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none"
                />
                <Button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shrink-0"
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
                  <span className="hidden sm:inline">
                    {t("habits.addButton")}
                  </span>
                </Button>
              </>
            ) : (
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  placeholder={t("habits.habitNamePlaceholder")}
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="w-full text-sm text-foreground placeholder:text-muted-foreground outline-none border-b border-border pb-1 focus:border-blue-400 transition-colors"
                />
                {/* Category buttons — wrap on mobile */}
                <div className="flex items-start gap-3 flex-col sm:flex-row">
                  <div className="flex gap-1 flex-wrap">
                    {getCategories(t).map((c) => (
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
                        {t(`habits.frequency.${f}`)}
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
                    {t("habits.cancel")}
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={!newHabitName.trim()}
                    className="px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    {t("habits.addHabit")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* List */}
          <div>
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
              {t("habits.weeklyOverview.title")}
            </h3>
            {loading ? (
              <WeeklyChartSkeleton />
            ) : (
              <div
                className="flex items-end gap-1.5"
                style={{ height: `${Math.max(64, totalHabits * 12)}px` }}
              >
                {weeklyData.map(({ day, count, pct }) => {
                  const today = last7Days[last7Days.length - 1];
                  const isToday = day === today;
                  return (
                    <div
                      key={day}
                      className="flex-1 flex flex-col items-center gap-1"
                      title={t("habits.weeklyTooltip", {
                        completed: count,
                        total: totalHabits,
                      })}
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
                        {getDayLabel(day, locale === "ru" ? "ru-RU" : "en-US")}
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
              {t("habits.progress.title")}
            </h3>
            {loading ? (
              <ProgressSidebarSkeleton />
            ) : totalHabits === 0 ? (
              <p className="text-xs text-muted-foreground">
                {t("habits.progress.noHabits")}
              </p>
            ) : (
              <>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-2xl font-bold text-foreground">
                    {completionRate}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t("habits.progress.doneCount", {
                      completed: completedToday,
                      total: totalHabits,
                    })}
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
                    {t("habits.progress.allDoneToday")}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Top streaks */}
          <div className="bg-card border border-border rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              {t("habits.topStreaks.title")}
            </h3>
            {loading ? (
              <TopStreaksSkeleton />
            ) : habits.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {t("habits.topStreaks.noHabits")}
              </p>
            ) : (
              <div className="space-y-2">
                {[...habits]
                  .sort((a, b) => b.longestStreak - a.longestStreak)
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
                        className={`text-xs font-semibold shrink-0 ${h.longestStreak > 0 ? "text-orange-500" : "text-muted-foreground"}`}
                      >
                        {h.longestStreak > 0 ? `🔥 ${h.longestStreak}` : "—"}
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
