import { Button } from "../../ui/button";
import { Progress } from "../../ui/progress";
import {
  Bell,
  CheckCircle,
  Flame,
  Settings,
  Target,
  Repeat2,
  Calendar,
  Clock,
  Shield,
} from "lucide-react";
import { useTasks } from "../../../hooks/task.hooks";
import { useGoals } from "../../../hooks/goal.hooks";
import { useHabits } from "../../../hooks/habit.hooks";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SettingsDialog } from "../settings/SettingsDialog";
import { useTranslation } from "../../../hooks/useTranslation";
import {
  CATEGORY_ICONS,
  formatShortDate,
  getDynamicMotivationalSubtitle,
  getMomentumLabel,
  getTimeOfDayGreeting,
  isTaskOverdue,
  PRIORITY_DOT,
} from "../../../lib/utils";
import {
  GoalsSkeleton,
  HabitsSkeleton,
  OverallProgressSkeleton,
  Skeleton,
  StatCardSkeleton,
  TasksSkeleton,
} from "../../shared/Skeletons";
import { DashboardSectionCard } from "./DashboardSectionCard";
import { DashboardStatCard, type StatCardProps } from "./DashboardStatCard";
import { useUserStore } from "../../../stores/useUserStore";
import { useOnboardingSeen } from "../../../hooks/onboarding.hooks";
import { OnboardingDialog } from "../../shared/OnboardingPanel";
import { ErrorBoundary } from "../../shared/ErrorBoundary";
import Insights from "../../shared/Insights";
import { Badge } from "../../ui/badge";

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

export default function Dashboard() {
  const {
    tasks,
    countCompleted,
    getTasksLeft,
    loading: tasksLoading,
  } = useTasks();
  const {
    goals,
    countCompletedGoals,
    getGoalsByStatus,
    loading: goalsLoading,
  } = useGoals();
  const {
    isCompletedToday,
    completedToday,
    totalHabits,
    todaysHabits,

    completionRate: habitCompletionRate,
    longestCurrentStreak,
    loading: habitsLoading,
  } = useHabits();
  const { user, loading: userLoading } = useUserStore();
  const { t } = useTranslation();

  const isLoading =
    tasksLoading || goalsLoading || habitsLoading || userLoading;

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<
    "appearance" | "account" | "notifications" | "privacy"
  >("appearance");

  const openSettings = (tab: typeof settingsTab = "appearance") => {
    setSettingsTab(tab);
    setSettingsOpen(true);
  };

  const navigate = useNavigate();
  const {
    seen: dashboardOnboardingSeen,
    markSeen: markDashboardOnboardingSeen,
  } = useOnboardingSeen("dashboard");
  const [isDashboardOnboardingOpen, setIsDashboardOnboardingOpen] =
    useState(false);

  const showDashboardOnboardingBanner =
    !isLoading &&
    tasks.length === 0 &&
    goals.length === 0 &&
    totalHabits === 0 &&
    !dashboardOnboardingSeen;

  const handleDashboardOnboardingOpenChange = (open: boolean) => {
    setIsDashboardOnboardingOpen(open);
    if (!open) {
      markDashboardOnboardingSeen();
    }
  };

  const handleDashboardGetStarted = () => {
    setIsDashboardOnboardingOpen(true);
  };

  const handleDashboardPrimaryAction = () => {
    markDashboardOnboardingSeen();
    setIsDashboardOnboardingOpen(false);
    navigate("/tasks");
  };

  const sortedDashboardTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const pa = PRIORITY_RANK[a.priority ?? ""] ?? 3;
    const pb = PRIORITY_RANK[b.priority ?? ""] ?? 3;
    if (pa !== pb) return pa - pb;
    if (a.dueDate && b.dueDate)
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });

  // ── Derived: Tasks ────────────────────────────────────────────────────────
  const totalTasks = tasks.length;
  const completedTasksCount = countCompleted();
  const tasksLeft = getTasksLeft();
  const taskCompletionRate =
    totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  // ── Derived: Goals ────────────────────────────────────────────────────────
  const completedGoalsCount = countCompletedGoals();
  const activeGoals = getGoalsByStatus("active");
  const goalsCompletionRate =
    goals.length > 0
      ? Math.round((completedGoalsCount / goals.length) * 100)
      : 0;

  // ── Derived: Habits ───────────────────────────────────────────────────────

  const statCards: StatCardProps[] = [
    {
      title: t("dashboard.stats.tasksCompleted"),
      value: completedTasksCount,
      subtext:
        tasksLeft === 0 && totalTasks > 0
          ? t("dashboard.stats.allDone")
          : t("dashboard.stats.remaining", { count: tasksLeft }),
      icon: CheckCircle,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
      testId: "stat-tasks-completed",
    },
    {
      title: t("dashboard.stats.productivityScore"),
      value: `${taskCompletionRate}%`,
      subtext: getMomentumLabel(taskCompletionRate, t),
      icon: Flame,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
      testId: "stat-productivity-score",
    },
    {
      title: t("dashboard.stats.goalsCompleted"),
      value: completedGoalsCount,
      subtext:
        activeGoals.length === 0
          ? t("dashboard.stats.noActiveGoals")
          : t("dashboard.stats.activeGoalsCount", {
              count: activeGoals.length,
            }),
      icon: Target,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      testId: "stat-goals-completed",
    },
    {
      title: t("dashboard.stats.habitStreak"),
      value: longestCurrentStreak,
      subtext: t("dashboard.stats.doneToday", {
        completed: completedToday,
        total: totalHabits,
      }),
      icon: Repeat2,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-100",
      testId: "stat-habit-streak",
    },
  ];

  return (
    // pb-20 gives space above the mobile bottom nav
    <div data-testid="dashboard-page" className="pb-20 md:pb-0">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-card border-b border-border p-4 sm:p-6">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="min-w-0">
            {isLoading ? (
              <>
                <Skeleton className="h-7 w-48 sm:w-56 mb-2" />
                <Skeleton className="h-4 w-36 sm:w-44" />
              </>
            ) : (
              <>
                <h2
                  className="text-xl sm:text-2xl font-semibold truncate"
                  data-testid="greeting"
                >
                  {getTimeOfDayGreeting(t)}, {user?.name}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {getDynamicMotivationalSubtitle(t)}
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* Hide badge on very small screens */}
            <Badge className="hidden sm:flex bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
              <Shield className="w-3 h-3 mr-1" />
              {t("dashboard.aiBadge")}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer h-9 w-9 sm:h-10 sm:w-10"
              data-testid="button-notifications"
              onClick={() => openSettings("notifications")}
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer h-9 w-9 sm:h-10 sm:w-10"
              data-testid="button-settings"
              onClick={() => openSettings("appearance")}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {showDashboardOnboardingBanner ? (
          <div className="rounded-3xl border border-blue-200 bg-blue-50 p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-900">
                {t("dashboard.onboarding.readyToGetStarted")}
              </p>
              <p className="text-sm text-blue-700">
                {t("dashboard.onboarding.buildMomentum")}
              </p>
            </div>
            <Button onClick={handleDashboardGetStarted}>
              {t("dashboard.onboarding.getStarted")}
            </Button>
          </div>
        ) : null}

        {/* ── Stat Cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))
            : statCards.map((card) => (
                <DashboardStatCard key={card.title} {...card} />
              ))}
        </div>

        {/* ── Main Grid ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left: Tasks + Goals ───────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Today's Tasks */}
            <DashboardSectionCard title={t("dashboard.section.tasks")}>
              {isLoading ? (
                <TasksSkeleton />
              ) : tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.tasks.noTasks")}
                </p>
              ) : (
                <div className="space-y-2">
                  {sortedDashboardTasks.slice(0, 6).map((task) => {
                    const overdue = isTaskOverdue(task.dueDate, task.completed);
                    return (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 py-1"
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${task.completed ? "bg-emerald-500 border-emerald-500" : "border-border"}`}
                        >
                          {task.completed && (
                            <svg
                              className="w-2.5 h-2.5 text-white"
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
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {task.priority && (
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[task.priority]}`}
                              />
                            )}
                            <span
                              className={`text-sm truncate ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                            >
                              {task.title}
                            </span>
                          </div>
                          {(task.category ||
                            task.dueDate ||
                            task.estimatedMinutes) && (
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {task.category && (
                                <span className="text-[10px] text-muted-foreground">
                                  {CATEGORY_ICONS[task.category]}{" "}
                                  {task.category}
                                </span>
                              )}
                              {task.dueDate && (
                                <span
                                  className={`flex items-center gap-0.5 text-[10px] ${overdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}
                                >
                                  <Calendar size={9} />
                                  {overdue
                                    ? `${t("dashboard.tasks.overdue")} · `
                                    : ""}
                                  {formatShortDate(task.dueDate)}
                                </span>
                              )}
                              {task.estimatedMinutes && (
                                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                  <Clock size={9} />~{task.estimatedMinutes}m
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {tasks.length > 6 && (
                    <p className="text-xs text-muted-foreground pt-1">
                      {t("dashboard.tasks.moreTasks", {
                        count: tasks.length - 6,
                      })}
                    </p>
                  )}
                </div>
              )}
            </DashboardSectionCard>

            {/* Active Goals */}
            <DashboardSectionCard title={t("dashboard.section.activeGoals")}>
              {isLoading ? (
                <GoalsSkeleton />
              ) : activeGoals.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.goals.noActiveGoals")}
                </p>
              ) : (
                <div className="space-y-4">
                  {activeGoals.slice(0, 4).map((goal) => {
                    const pct = Math.min(
                      Math.round((goal.currentValue / goal.targetValue) * 100),
                      100,
                    );
                    return (
                      <div key={goal.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-foreground truncate max-w-[70%]">
                            {goal.title}
                          </span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {goal.currentValue}/{goal.targetValue} {goal.unit}
                          </span>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                      </div>
                    );
                  })}
                  {activeGoals.length > 4 && (
                    <p className="text-xs text-muted-foreground">
                      {t("dashboard.goals.moreGoals", {
                        count: activeGoals.length - 4,
                      })}
                    </p>
                  )}
                </div>
              )}
            </DashboardSectionCard>
          </div>

          {/* Right: Habits + Overview ──────────────────────────────────────── */}
          <div className="space-y-4 sm:space-y-6">
            {/* Today's Habits */}
            <DashboardSectionCard title={t("dashboard.section.habits")}>
              {isLoading ? (
                <HabitsSkeleton />
              ) : totalHabits === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.habits.noHabits")}
                </p>
              ) : (
                <>
                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>
                        {t("dashboard.habits.completed", {
                          completed: completedToday,
                          total: totalHabits,
                        })}
                      </span>
                      <span>{habitCompletionRate}%</span>
                    </div>
                    <Progress value={habitCompletionRate} className="h-1.5" />
                  </div>

                  {/* Habit list */}
                  <div className="space-y-2">
                    {todaysHabits.slice(0, 5).map((habit) => {
                      const done = isCompletedToday(habit);
                      return (
                        <div
                          key={habit.id}
                          className="flex items-center gap-2.5"
                        >
                          <div
                            className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${done ? "bg-emerald-500 border-emerald-500" : "border-border"}`}
                          >
                            {done && (
                              <svg
                                className="w-2.5 h-2.5 text-white"
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
                          </div>
                          <span
                            className={`text-sm flex-1 truncate ${done ? "line-through text-muted-foreground" : "text-foreground"}`}
                          >
                            {habit.name}
                          </span>
                          {habit.streak > 0 && (
                            <span className="text-xs text-orange-500 font-medium shrink-0">
                              🔥 {habit.streak}
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {todaysHabits.length > 5 && (
                      <p className="text-xs text-muted-foreground pt-1">
                        {t("dashboard.habits.moreHabits", {
                          count: todaysHabits.length - 5,
                        })}
                      </p>
                    )}
                  </div>
                </>
              )}
            </DashboardSectionCard>

            <DashboardSectionCard title={t("dashboard.section.aiInsights")}>
              <ErrorBoundary
                fallback={
                  <p className="text-sm text-destructive">
                    {t("dashboard.aiInsights.unavailable")}
                  </p>
                }
              >
                <Insights />
              </ErrorBoundary>
            </DashboardSectionCard>

            {/* Overall Progress */}
            <DashboardSectionCard
              title={t("dashboard.section.overallProgress")}
            >
              {isLoading ? (
                <OverallProgressSkeleton />
              ) : (
                <div className="space-y-3">
                  {[
                    {
                      label: t("dashboard.overall.tasks"),
                      rate: taskCompletionRate,
                      color: "bg-emerald-500",
                    },
                    {
                      label: t("dashboard.overall.goals"),
                      rate: goalsCompletionRate,
                      color: "bg-blue-500",
                    },
                    {
                      label: t("dashboard.overall.habits"),
                      rate: habitCompletionRate,
                      color: "bg-orange-500",
                    },
                  ].map(({ label, rate, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{label}</span>
                        <span>{rate}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-1.5">
                        <div
                          className={`${color} h-1.5 rounded-full transition-all duration-500`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DashboardSectionCard>
          </div>
        </div>
      </div>

      <OnboardingDialog
        open={isDashboardOnboardingOpen}
        onOpenChange={handleDashboardOnboardingOpenChange}
        title={t("dashboard.onboarding.dialog.title")}
        subtitle={t("dashboard.onboarding.dialog.subtitle")}
        steps={[
          {
            title: t("dashboard.onboarding.step.captureTask"),
            description: t("dashboard.onboarding.step.captureTaskDesc"),
          },
          {
            title: t("dashboard.onboarding.step.setGoal"),
            description: t("dashboard.onboarding.step.setGoalDesc"),
          },
          {
            title: t("dashboard.onboarding.step.addHabit"),
            description: t("dashboard.onboarding.step.addHabitDesc"),
          },
        ]}
        primaryAction={{
          label: t("dashboard.onboarding.primaryAction"),
          onClick: handleDashboardPrimaryAction,
        }}
        secondaryAction={{
          label: t("dashboard.onboarding.secondaryAction"),
          onClick: () => handleDashboardOnboardingOpenChange(false),
        }}
      />

      {/* Settings Modal */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        initialTab={settingsTab}
      />
    </div>
  );
}
