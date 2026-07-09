import { Clock, AlertTriangle, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { computeScores } from "../../../hooks/useProductivityReport";
import { computePatterns } from "../ai-coach/AiCoachPatterns";
import { useTranslation } from "../../../hooks/useTranslation";
import { Skeleton } from "../../shared/Skeletons";
import type { Task } from "../../../types/task.types";
import type { JSX } from "react";

interface DashboardPatternsProps {
  tasks: Task[];
  stats: ReturnType<typeof computeScores>["stats"];
  isLoading: boolean;
}

export default function DashboardPatterns({
  tasks,
  stats,
  isLoading,
}: DashboardPatternsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    );
  }

  const { bestTimeOfDay, weakDays } = computePatterns(tasks);

  const hasTaskData = tasks.some((task) => task.completedAt);
  const topTime = hasTaskData
    ? [...bestTimeOfDay]
        .filter((b) => b.completionRate > 0)
        .sort((a, b) => b.completionRate - a.completionRate)[0]
    : null;
  const weakestDay = weakDays[0];
  const hasAvgTasks = hasTaskData && stats.avgTasksPerDay > 0;

  const rows = [
    topTime && {
      icon: <Clock className="w-4 h-4 text-green-500 shrink-0" />,
      label: t("dashboard.patterns.mostProductive"),
      value: t(topTime.label),
    },
    weakestDay && {
      icon: <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />,
      label: t("dashboard.patterns.toughestDay"),
      value: t("dashboard.patterns.toughestDayValue", {
        day: t(`aiCoach.patterns.day.${weakestDay.label.toLowerCase()}`),
        rate: weakestDay.completionRate,
      }),
    },
    hasAvgTasks && {
      icon: <BarChart3 className="w-4 h-4 text-blue-500 shrink-0" />,
      label: t("dashboard.patterns.avgTasksPerDay"),
      value: `${stats.avgTasksPerDay}`,
    },
  ].filter(Boolean) as { icon: JSX.Element; label: string; value: string }[];

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("dashboard.patterns.notEnoughData")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {row.icon}
            {row.label}
          </div>
          <span className="text-sm font-semibold text-foreground">
            {row.value}
          </span>
        </div>
      ))}
      <button
        onClick={() => navigate("/ai-coach")}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer pt-1"
      >
        {t("dashboard.patterns.seeFullPatterns")}
      </button>
    </div>
  );
}
