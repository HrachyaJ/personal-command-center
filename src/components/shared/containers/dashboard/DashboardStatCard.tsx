import { useGoals } from "../../../../hooks/goal.hooks";
import { useTasks } from "../../../../hooks/task.hooks";
import { Card, CardContent } from "../../../ui/card";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  testId?: string;
}

export function DashboardStatCard({
  title,
  value,
  subtext,
  icon: Icon,
  iconColor,
  iconBg,
  testId,
}: StatCardProps) {
  const { tasks, countCompleted, getTasksLeft } = useTasks();
  const { goals, countCompletedGoals, getGoalsByStatus } = useGoals();

  // ── Derived: Goals ────────────────────────────────────────────────────────
  const completedGoalsCount = countCompletedGoals();
  const activeGoals = getGoalsByStatus("active");
  const goalsCompletionRate =
    goals.length > 0
      ? Math.round((completedGoalsCount / goals.length) * 100)
      : 0;

  // ── Derived: Habits ───────────────────────────────────────────────────────

  return (
    <Card data-testid={testId}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
          </div>
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}
          >
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
