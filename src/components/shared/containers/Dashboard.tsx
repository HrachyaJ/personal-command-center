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
} from "lucide-react";
import { useTasks } from "../../../hooks/task.hooks";
import { useGoals } from "../../../hooks/goal.hooks";
import { useHabits } from "../../../hooks/habit.hooks";

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
  const { tasks, countCompleted, getTasksLeft } = useTasks();
  const { goals, countCompletedGoals, getGoalsByStatus } = useGoals();
  const {
    habits,
    isCompletedToday,
    completedToday,
    totalHabits,
    completionRate: habitCompletionRate,
    longestCurrentStreak,
  } = useHabits();

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
  const todaysHabits = habits.slice(0, 5); // Show first 5 on dashboard

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
            <h2 className="text-2xl font-semibold" data-testid="greeting">
              {getTimeOfDayGreeting()}, John Doe!
            </h2>
            <p className="text-muted-foreground mt-1">
              Ready to tackle your goals today?
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* <Badge className="bg-green-50 text-green-700 border-green-200">
              <Shield className="w-3 h-3 mr-1" />
              AI Coach Active
            </Badge> */}
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
          {statCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>

        {/* ── Main Grid ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Tasks + Goals ───────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Tasks */}
            <SectionCard title="Today's Tasks">
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No tasks yet. Head to Tasks to add some.
                </p>
              ) : (
                <div className="space-y-2">
                  {tasks.slice(0, 6).map((task) => (
                    <div key={task.id} className="flex items-center gap-3 py-1">
                      <div
                        className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${task.completed ? "bg-emerald-500 border-emerald-500" : "border-slate-300"}`}
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
                      <span
                        className={`text-sm ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                      >
                        {task.title}
                      </span>
                    </div>
                  ))}
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
              {activeGoals.length === 0 ? (
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
              {totalHabits === 0 ? (
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
                            className={`text-sm  1 truncate ${done ? "line-through text-muted-foreground" : "text-foreground"}`}
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

            {/* Overall Progress */}
            <SectionCard title="Overall Progress">
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
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
