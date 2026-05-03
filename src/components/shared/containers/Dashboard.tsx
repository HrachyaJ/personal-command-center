import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Progress } from "../../ui/progress";
import {
  Bell,
  CheckCircle,
  Flame,
  Settings,
  Target,
  Repeat2,
  Shield,
  Calendar,
  Clock,
} from "lucide-react";
import { useTasks } from "../../../hooks/task.hooks";
import { useGoals } from "../../../hooks/goal.hooks";
import { useHabits } from "../../../hooks/habit.hooks";
import { useSession } from "../../../lib/auth-client";
import Insights from "../Insights";
import { Badge } from "../../ui/badge";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

function getMomentumLabel(rate: number): string {
  if (rate >= 80) return "🔥 On fire!";
  if (rate >= 60) return "💪 Keep it up!";
  if (rate >= 40) return "📈 Building momentum";
  if (rate > 0) return "🌱 Just getting started";
  return "✨ Nothing yet";
}

// ─── Skeleton primitives ─────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

// ─── Skeleton screens ────────────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-7 w-12 mt-1" />
            <Skeleton className="h-3 w-20 mt-1" />
          </div>
          <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

function TasksSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-1">
          <Skeleton className="w-4 h-4 rounded-full shrink-0" />
          <Skeleton
            className={`h-3.5 ${i % 3 === 0 ? "w-3/4" : i % 3 === 1 ? "w-1/2" : "w-2/3"}`}
          />
        </div>
      ))}
    </div>
  );
}

function GoalsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1.5">
            <Skeleton className={`h-3.5 ${i % 2 === 0 ? "w-2/5" : "w-1/2"}`} />
            <Skeleton className="h-3 w-16 shrink-0" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

function HabitsSkeleton() {
  return (
    <>
      <div className="mb-4">
        <div className="flex justify-between mb-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <Skeleton className="w-4 h-4 rounded-full shrink-0" />
            <Skeleton className={`h-3.5 ${i % 2 === 0 ? "w-3/4" : "w-1/2"}`} />
          </div>
        ))}
      </div>
    </>
  );
}

function OverallProgressSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i}>
          <div className="flex justify-between mb-1">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  testId?: string;
}

function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  iconColor,
  iconBg,
  testId,
}: StatCardProps) {
  return (
    <Card data-testid={testId}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
          </div>
          <div
            className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}
          >
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

function SectionCard({ title, children }: SectionCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
        {children}
      </CardContent>
    </Card>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  // ── Data ──────────────────────────────────────────────────────────────────
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
    habits,
    isCompletedToday,
    completedToday,
    totalHabits,
    completionRate: habitCompletionRate,
    longestCurrentStreak,
    loading: habitsLoading,
  } = useHabits();

  const { data: session, isPending: sessionLoading } = useSession();
  const user = session?.user;

  const isLoading =
    tasksLoading || goalsLoading || habitsLoading || sessionLoading;

  const PRIORITY_DOT: Record<string, string> = {
    high: "bg-red-500",
    medium: "bg-amber-400",
    low: "bg-slate-400",
  };

  const CATEGORY_ICON: Record<string, string> = {
    work: "💼",
    health: "🏃",
    personal: "🏠",
    learning: "📚",
    finance: "💰",
    other: "📌",
  };

  function formatShortDate(d: string | null) {
    if (!d) return null;
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  function isTaskOverdue(dateStr: string | null, completed: boolean) {
    if (!dateStr || completed) return false;
    return new Date(dateStr) < new Date();
  }

  const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

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
  const todaysHabits = habits.slice(0, 5);

  // ── Stat cards config ─────────────────────────────────────────────────────
  const statCards: StatCardProps[] = [
    {
      title: "Tasks Completed",
      value: completedTasksCount,
      subtext:
        tasksLeft === 0 && totalTasks > 0
          ? "All done! 🎉"
          : `${tasksLeft} remaining`,
      icon: CheckCircle,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
      testId: "stat-tasks-completed",
    },
    {
      title: "Productivity Score",
      value: `${taskCompletionRate}%`,
      subtext: getMomentumLabel(taskCompletionRate),
      icon: Flame,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
      testId: "stat-productivity-score",
    },
    {
      title: "Goals Completed",
      value: completedGoalsCount,
      subtext:
        activeGoals.length === 0
          ? "No active goals"
          : `${activeGoals.length} active`,
      icon: Target,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      testId: "stat-goals-completed",
    },
    {
      title: "Habit Streak",
      value: longestCurrentStreak,
      subtext: `${completedToday}/${totalHabits} done today`,
      icon: Repeat2,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-100",
      testId: "stat-habit-streak",
    },
  ];

  return (
    <div data-testid="dashboard-page">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-card border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            {isLoading ? (
              <>
                <Skeleton className="h-7 w-56 mb-2" />
                <Skeleton className="h-4 w-44" />
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold" data-testid="greeting">
                  {getTimeOfDayGreeting()}, {user?.name}
                </h2>
                <p className="text-muted-foreground mt-1">
                  Ready to tackle your goals today?
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Badge className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
              <Shield className="w-3 h-3 mr-1" />
              AI Coach Active
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer"
              data-testid="button-settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* ── Stat Cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))
            : statCards.map((card) => <StatCard key={card.title} {...card} />)}
        </div>

        {/* ── Main Grid ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Tasks + Goals ───────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Tasks */}
            <SectionCard title="Today's Tasks">
              {isLoading ? (
                <TasksSkeleton />
              ) : tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No tasks yet. Head to Tasks to add some.
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
                          className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${task.completed ? "bg-emerald-500 border-emerald-500" : "border-slate-300"}`}
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
                                <span className="text-[10px] text-slate-400">
                                  {CATEGORY_ICON[task.category]} {task.category}
                                </span>
                              )}
                              {task.dueDate && (
                                <span
                                  className={`flex items-center gap-0.5 text-[10px] ${overdue ? "text-red-500 font-medium" : "text-slate-400"}`}
                                >
                                  <Calendar size={9} />
                                  {overdue ? "Overdue · " : ""}
                                  {formatShortDate(task.dueDate)}
                                </span>
                              )}
                              {task.estimatedMinutes && (
                                <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
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
                      +{tasks.length - 6} more tasks
                    </p>
                  )}
                </div>
              )}
            </SectionCard>

            {/* Active Goals */}
            <SectionCard title="Active Goals">
              {isLoading ? (
                <GoalsSkeleton />
              ) : activeGoals.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active goals. Head to Goals to create one.
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
                      +{activeGoals.length - 4} more goals
                    </p>
                  )}
                </div>
              )}
            </SectionCard>
          </div>

          {/* Right: Habits + Overview ──────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Today's Habits */}
            <SectionCard title="Today's Habits">
              {isLoading ? (
                <HabitsSkeleton />
              ) : totalHabits === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No habits yet. Head to Habits to add some.
                </p>
              ) : (
                <>
                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>
                        {completedToday}/{totalHabits} completed
                      </span>
                      <span>{habitCompletionRate}%</span>
                    </div>
                    <Progress value={habitCompletionRate} className="h-1.5" />
                  </div>

                  {/* Habit list */}
                  <div className="space-y-2">
                    {todaysHabits.map((habit) => {
                      const done = isCompletedToday(habit);
                      return (
                        <div
                          key={habit.id}
                          className="flex items-center gap-2.5"
                        >
                          <div
                            className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${done ? "bg-emerald-500 border-emerald-500" : "border-slate-300"}`}
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
                    {habits.length > 5 && (
                      <p className="text-xs text-muted-foreground pt-1">
                        +{habits.length - 5} more habits
                      </p>
                    )}
                  </div>
                </>
              )}
            </SectionCard>

            <SectionCard title="AI Insights">
              {isLoading ? (
                <OverallProgressSkeleton />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {/* AI insights will be displayed here. */}
                  <Insights />
                </p>
              )}
            </SectionCard>

            {/* Overall Progress */}
            <SectionCard title="Overall Progress">
              {isLoading ? (
                <OverallProgressSkeleton />
              ) : (
                <div className="space-y-3">
                  {[
                    {
                      label: "Tasks",
                      rate: taskCompletionRate,
                      color: "bg-emerald-500",
                    },
                    {
                      label: "Goals",
                      rate: goalsCompletionRate,
                      color: "bg-blue-500",
                    },
                    {
                      label: "Habits",
                      rate: habitCompletionRate,
                      color: "bg-orange-500",
                    },
                  ].map(({ label, rate, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{label}</span>
                        <span>{rate}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className={`${color} h-1.5 rounded-full transition-all duration-500`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
