import { useState } from "react";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { Progress } from "../../ui/progress";
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Flame,
  Target,
  Sparkles,
  Zap,
  BarChart3,
  Clock,
} from "lucide-react";
import type { Habit } from "../../../types/habit.types";
import type { Task } from "../../../types/task.types";
import type { Goal } from "../../../types/goal.types";
import { computeScores } from "../../../hooks/useProductivityReport";
import { useTranslation } from "../../../hooks/useTranslation";
import { AiCoachHeaderSkeleton } from "../../shared/Skeletons";

interface AiCoachHeaderProps {
  habits: Habit[];
  tasks: Task[];
  goals: Goal[];
  isRefreshing: boolean;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function AiCoachHeader({
  habits,
  tasks,
  goals,
  isRefreshing,
  onRefresh,
  isLoading,
}: AiCoachHeaderProps) {
  const { t } = useTranslation();
  const { scores, stats } = computeScores(habits, tasks, goals);

  return (
    <div className="space-y-6">
      {/* Static header block: Never reloads or flashes */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            {t("aiCoach.title")}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {t("aiCoach.subtitle")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading || isRefreshing}
          className="cursor-pointer gap-2"
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading || isRefreshing ? "animate-spin" : ""}`}
          />
          {t("aiCoach.button.refresh")}
        </Button>
      </div>

      {/* Conditional data block: Only swaps the metrics content */}
      {isLoading ? (
        <AiCoachHeaderSkeleton />
      ) : (
        <>
          {/* Productivity score card */}
          <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-primary/10 overflow-hidden relative">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="shrink-0 flex items-center gap-5">
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        className="text-primary/10"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 34}`}
                        strokeDashoffset={`${2 * Math.PI * 34 * (1 - scores.overall / 100)}`}
                        className="text-primary transition-all duration-700"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-primary leading-none">
                        {scores.overall}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        / 100
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      {t("aiCoach.productivityScore")}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {scores.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span
                        className={`text-sm font-medium ${scores.trend === "up" ? "text-green-600" : "text-red-500"}`}
                      >
                        {scores.trend === "up" ? "+" : "-"}
                        {scores.trendValue}% {t("aiCoach.trend.vsLastWeek")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-3 gap-4 sm:border-l sm:pl-6 border-primary/10">
                  {[
                    {
                      label: t("aiCoach.scoreLabel.tasks"),
                      value: scores.tasks,
                      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                    },
                    {
                      label: t("aiCoach.scoreLabel.habits"),
                      value: scores.habits,
                      icon: <Flame className="w-3.5 h-3.5" />,
                    },
                    {
                      label: t("aiCoach.scoreLabel.goals"),
                      value: scores.goals,
                      icon: <Target className="w-3.5 h-3.5" />,
                    },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="space-y-1.5">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                        {icon}
                        {label}
                      </div>
                      <div className="text-xl font-bold">{value}</div>
                      <Progress value={value} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </div>
              <Sparkles className="absolute top-4 right-4 w-5 h-5 text-primary/20" />
            </CardContent>
          </Card>

          {/* Stat tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: t("aiCoach.stats.currentStreak"),
                value: `${stats.currentStreak}d`,
                sub: t("aiCoach.stats.sub.bestHabit"),
                icon: <Flame className="w-4 h-4 text-orange-500" />,
                color: "text-orange-600",
              },
              {
                label: t("aiCoach.stats.bestStreak"),
                value: `${stats.longestStreak}d`,
                sub: t("aiCoach.stats.sub.allTime"),
                icon: <Zap className="w-4 h-4 text-yellow-500" />,
                color: "text-yellow-600",
              },
              {
                label: t("aiCoach.stats.avgTasksPerDay"),
                value: stats.avgTasksPerDay,
                sub: t("aiCoach.stats.sub.thisWeek"),
                icon: <BarChart3 className="w-4 h-4 text-blue-500" />,
                color: "text-blue-600",
              },
              {
                label: t("aiCoach.stats.peakHours"),
                value: stats.peakHour,
                sub:
                  stats.peakCompletion > 0
                    ? t("aiCoach.stats.sub.completionRate", {
                        percent: stats.peakCompletion,
                      })
                    : t("aiCoach.stats.sub.noData"),
                icon: <Clock className="w-4 h-4 text-green-500" />,
                color: "text-green-600",
              },
            ].map(({ label, value, sub, icon, color }) => (
              <Card key={label}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        {label}
                      </p>
                      <p className={`text-2xl font-bold mt-1 ${color}`}>
                        {value}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {sub}
                      </p>
                    </div>
                    <div className="mt-0.5">{icon}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
