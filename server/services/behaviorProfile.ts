import { Goal } from "../types/goal.types.js";
import { Habit } from "../types/habit.types.js";
import { Task } from "../types/task.types.js";

export interface NeglectedGoal {
  goalTitle: string;
  daysWithoutProgress: number;
}

interface BehaviorProfile {
  // execution
  taskCompletionRate: number;
  avgTasksPerDay: number;

  // consistency
  currentStreak: number;
  longestStreak: number;
  habitConsistency: number;

  // focus
  activeGoals: number;
  goalsWithProgress: number;
  concentrationScore: number;

  // patterns
  strongestDay: string;
  weakestDay: string;
  strongestTimeBlock: string;
  weakestTimeBlock: string;

  // risk
  overcommitmentRisk: "low" | "medium" | "high";
  neglectedGoals: NeglectedGoal[];

  // growth
  taskCompletionLast7Days: number;
  taskCompletionPrevious7Days: number;
  momentum: number;
  weeklyTrend: number;

  // synthesized
  focusScore: number;
  consistencyScore: number;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIME_BLOCKS = [
  { label: "Early morning", from: 5, to: 8 },
  { label: "Morning", from: 9, to: 12 },
  { label: "Afternoon", from: 13, to: 16 },
  { label: "Evening", from: 17, to: 20 },
  { label: "Night", from: 21, to: 4 },
];

function normalizeDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getTimeBlock(hour: number) {
  const block = TIME_BLOCKS.find((entry) => {
    if (entry.from <= entry.to) {
      return hour >= entry.from && hour <= entry.to;
    }
    return hour >= entry.from || hour <= entry.to;
  });
  return block?.label ?? "Unknown";
}

function getDateSpanDays(start: Date, end: Date) {
  const startMs = Date.UTC(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );
  const endMs = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.max(1, Math.floor((endMs - startMs) / 86_400_000) + 1);
}

function getDifferenceInDays(a: Date, b: Date) {
  const aMs = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const bMs = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((bMs - aMs) / 86_400_000);
}

function getWeekSpan(start: Date, end: Date) {
  const startMonday = new Date(start);
  startMonday.setUTCDate(
    startMonday.getUTCDate() - ((startMonday.getUTCDay() + 6) % 7),
  );
  const endMonday = new Date(end);
  endMonday.setUTCDate(
    endMonday.getUTCDate() - ((endMonday.getUTCDay() + 6) % 7),
  );
  const diffMs =
    Date.UTC(
      endMonday.getUTCFullYear(),
      endMonday.getUTCMonth(),
      endMonday.getUTCDate(),
    ) -
    Date.UTC(
      startMonday.getUTCFullYear(),
      startMonday.getUTCMonth(),
      startMonday.getUTCDate(),
    );
  return Math.max(1, Math.floor(diffMs / (86_400_000 * 7)) + 1);
}

function buildDayCompletionRates(tasks: Task[]) {
  const dayStats: Record<string, { total: number; completed: number }> = {};

  tasks.forEach((task) => {
    const created = new Date(task.createdAt);
    if (Number.isNaN(created.getTime())) return;

    const dayName = DAY_NAMES[created.getUTCDay()];
    if (!dayStats[dayName]) {
      dayStats[dayName] = { total: 0, completed: 0 };
    }

    dayStats[dayName].total += 1;
    if (task.completedAt) {
      dayStats[dayName].completed += 1;
    }
  });

  return dayStats;
}

function buildTimeBlockRates(tasks: Task[]) {
  const blockStats: Record<string, { total: number; completed: number }> = {};

  tasks.forEach((task) => {
    const created = new Date(task.createdAt);
    if (Number.isNaN(created.getTime())) return;

    const block = getTimeBlock(created.getUTCHours());
    if (!blockStats[block]) {
      blockStats[block] = { total: 0, completed: 0 };
    }

    blockStats[block].total += 1;
    if (task.completedAt) {
      blockStats[block].completed += 1;
    }
  });

  return blockStats;
}

function chooseStrongestAndWeakest<T>(counts: Record<string, number>) {
  const entries = Object.entries(counts).filter(([, value]) => value > 0);
  if (entries.length === 0) {
    return { strongest: "Unknown", weakest: "Unknown" };
  }

  const sorted = entries.sort((a, b) => b[1] - a[1]);
  const strongest = sorted[0][0];
  const weakest = sorted.length > 1 ? sorted[sorted.length - 1][0] : "Unknown";
  return { strongest, weakest };
}

function buildHabitDateSet(habits: Habit[]) {
  const dateSet = new Set<string>();
  habits.forEach((habit) => {
    habit.completedDates.forEach((dateString) => {
      const date = new Date(dateString);
      if (!Number.isNaN(date.getTime())) {
        dateSet.add(normalizeDateKey(date));
      }
    });
  });
  return dateSet;
}

function buildStreaksFromDates(dateSet: Set<string>) {
  if (dateSet.size === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const dates = Array.from(dateSet)
    .map((date) => new Date(date))
    .sort((a, b) => a.getTime() - b.getTime());

  let longestStreak = 0;
  let currentStreak = 0;
  let streak = 0;
  let previousDate = dates[0];

  for (const date of dates) {
    if (date.getTime() === previousDate.getTime()) {
      continue;
    }

    const diffDays = getDifferenceInDays(previousDate, date);
    if (diffDays === 1) {
      streak += 1;
    } else {
      streak = 1;
    }

    longestStreak = Math.max(longestStreak, streak);
    previousDate = date;
  }

  longestStreak = Math.max(longestStreak, streak || 1);

  const today = new Date();
  let checkDate = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  let runningStreak = 0;
  let lastCheckedDate = checkDate;

  while (true) {
    const key = normalizeDateKey(lastCheckedDate);
    if (!dateSet.has(key)) {
      if (runningStreak === 0) {
        const yesterday = new Date(lastCheckedDate);
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        const yesterdayKey = normalizeDateKey(yesterday);
        if (dateSet.has(yesterdayKey)) {
          runningStreak = 1;
        }
      }
      break;
    }

    runningStreak += 1;
    lastCheckedDate.setUTCDate(lastCheckedDate.getUTCDate() - 1);
  }

  currentStreak = runningStreak;
  return { currentStreak, longestStreak };
}

function buildHabitConsistency(habits: Habit[]) {
  if (habits.length === 0) return 0;

  const ratios = habits.map((habit) => {
    const createdAt = new Date(habit.createdAt);
    if (Number.isNaN(createdAt.getTime())) return 0;

    const actualCompletions = new Set(
      habit.completedDates.map((dateString) =>
        normalizeDateKey(new Date(dateString)),
      ),
    ).size;
    const expected =
      habit.frequency === "weekly"
        ? getWeekSpan(createdAt, new Date())
        : getDateSpanDays(createdAt, new Date());

    return expected > 0 ? Math.min(1, actualCompletions / expected) : 0;
  });

  return Math.round(
    (ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length) * 100,
  );
}

function buildNeglectedGoals(goals: Goal[]) {
  const now = new Date();

  return goals
    .filter((goal) => goal.status === "active" && goal.currentValue === 0)
    .map((goal) => {
      const createdAt = new Date(goal.createdAt);
      const daysWithoutProgress = Number.isNaN(createdAt.getTime())
        ? 0
        : Math.max(
            0,
            Math.floor(
              (Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate(),
              ) -
                Date.UTC(
                  createdAt.getUTCFullYear(),
                  createdAt.getUTCMonth(),
                  createdAt.getUTCDate(),
                )) /
                86_400_000,
            ),
          );
      return {
        goalTitle: goal.title,
        daysWithoutProgress,
      };
    })
    .sort((a, b) => b.daysWithoutProgress - a.daysWithoutProgress);
}

export function buildBehaviorProfile(
  habits: Habit[],
  tasks: Task[],
  goals: Goal[],
): BehaviorProfile {
  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter((task) => task.completedAt).length;
  const taskCompletionRate =
    totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  const createdDateKeys = new Set(
    tasks
      .map((task) => new Date(task.createdAt))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map((date) => normalizeDateKey(date)),
  );
  const avgTasksPerDay =
    createdDateKeys.size > 0
      ? Number((totalTasks / createdDateKeys.size).toFixed(1))
      : 0;

  const activeGoals = goals.filter((goal) => goal.status === "active").length;
  const goalsWithProgress = goals.filter(
    (goal) => goal.currentValue > 0,
  ).length;

  const overcommitmentRisk =
    activeGoals > 4 && goalsWithProgress < activeGoals / 2
      ? "high"
      : activeGoals > 2 && goalsWithProgress < activeGoals / 2
        ? "medium"
        : "low";

  const completionRate = taskCompletionRate;
  const goalFocusScore = activeGoals > 0 ? goalsWithProgress / activeGoals : 1;
  const focusScore =
    activeGoals > 0
      ? Math.round((goalFocusScore * 0.6 + (completionRate / 100) * 0.4) * 100)
      : completionRate;

  const habitConsistency = buildHabitConsistency(habits);
  const consistencyScore =
    habits.length > 0 && totalTasks > 0
      ? Math.round((taskCompletionRate + habitConsistency) / 2)
      : habits.length > 0
        ? habitConsistency
        : taskCompletionRate;

  const neglectedGoals = buildNeglectedGoals(goals);
  const concentrationScore =
    activeGoals > 0 ? Math.round((goalsWithProgress / activeGoals) * 100) : 100;

  const now = new Date();
  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const msPerDay = 86_400_000;
  const last7DaysStart = new Date(todayUtc - msPerDay * 6);
  const previous7DaysStart = new Date(todayUtc - msPerDay * 13);
  const previous7DaysEnd = new Date(todayUtc - msPerDay * 7);

  const taskCompletionLast7Days = tasks.filter((task) => {
    if (!task.completedAt) return false;
    const completedAt = new Date(task.completedAt);
    if (Number.isNaN(completedAt.getTime())) return false;
    const completedUtc = Date.UTC(
      completedAt.getUTCFullYear(),
      completedAt.getUTCMonth(),
      completedAt.getUTCDate(),
    );
    return completedUtc >= last7DaysStart.getTime() && completedUtc <= todayUtc;
  }).length;

  const taskCompletionPrevious7Days = tasks.filter((task) => {
    if (!task.completedAt) return false;
    const completedAt = new Date(task.completedAt);
    if (Number.isNaN(completedAt.getTime())) return false;
    const completedUtc = Date.UTC(
      completedAt.getUTCFullYear(),
      completedAt.getUTCMonth(),
      completedAt.getUTCDate(),
    );
    return (
      completedUtc >= previous7DaysStart.getTime() &&
      completedUtc < previous7DaysEnd.getTime()
    );
  }).length;

  const momentum = taskCompletionLast7Days - taskCompletionPrevious7Days;
  const weeklyTrend = momentum;

  const dayStats = buildDayCompletionRates(tasks);
  const dayRates: Record<string, number> = {};
  Object.entries(dayStats).forEach(([day, stats]) => {
    dayRates[day] = stats.total > 0 ? stats.completed / stats.total : 0;
  });
  const { strongest: strongestDay, weakest: weakestDay } =
    chooseStrongestAndWeakest(dayRates);

  const blockStats = buildTimeBlockRates(tasks);
  const blockRates: Record<string, number> = {};
  Object.entries(blockStats).forEach(([block, stats]) => {
    blockRates[block] = stats.total > 0 ? stats.completed / stats.total : 0;
  });
  const { strongest: strongestTimeBlock, weakest: weakestTimeBlock } =
    chooseStrongestAndWeakest(blockRates);

  const habitDateSet = buildHabitDateSet(habits);
  const { currentStreak, longestStreak } = buildStreaksFromDates(habitDateSet);

  return {
    taskCompletionRate,
    avgTasksPerDay,
    currentStreak,
    longestStreak,
    habitConsistency,
    activeGoals,
    goalsWithProgress,
    concentrationScore,
    strongestDay,
    weakestDay,
    strongestTimeBlock,
    weakestTimeBlock,
    overcommitmentRisk,
    neglectedGoals,
    taskCompletionLast7Days,
    taskCompletionPrevious7Days,
    momentum,
    weeklyTrend,
    focusScore,
    consistencyScore,
  };
}
