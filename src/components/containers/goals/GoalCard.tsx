import { Calendar, CheckCircle2, Trash2, Plus } from "lucide-react";
import type { Goal } from "../../../types/goal.types";
import { Badge } from "../../ui/badge";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Progress } from "../../ui/progress";
import { Input } from "../../ui/input";
import { useState } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { getStatusColor } from "../../../lib/utils";

interface GoalCardProps {
  goal: Goal;
  onUpdateProgress: (id: string, value: number) => void;
  onCompleteGoal: (id: string) => void;
  onDeleteGoal: (id: string) => void;
  isDeleting?: boolean;
}

export const GoalCard = ({
  goal,
  onUpdateProgress,
  onCompleteGoal,
  onDeleteGoal,
  isDeleting = false,
}: GoalCardProps) => {
  const { t } = useTranslation();
  const [progressInput, setProgressInput] = useState("");

  const progressPercentage =
    goal.targetValue > 0
      ? Math.round((goal.currentValue / goal.targetValue) * 100)
      : 0;

  function submitProgress() {
    const value = parseInt(progressInput, 10);
    if (value > 0) {
      onUpdateProgress(goal.id, value);
      setProgressInput("");
    }
  }

  if (isDeleting) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                <div className="h-3 w-56 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-5 w-16 bg-muted animate-pulse rounded-full shrink-0" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                <div className="h-3 w-8 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-2 w-full bg-muted animate-pulse rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg truncate">
                {goal.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                {goal.description}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Badge
                className={`${getStatusColor(goal.status)} text-xs whitespace-nowrap`}
              >
                {goal.status === "completed" && (
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                )}
                {t(`goals.status.${goal.status}`)}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteGoal(goal.id)}
                className="cursor-pointer hover:bg-red-600 h-7 w-7 p-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                {goal.currentValue} / {goal.targetValue}{" "}
                {t(`goals.form.unit.${goal.unit}`)}
              </span>
              <span className="text-muted-foreground">
                {progressPercentage}%
              </span>
            </div>
            <Progress value={Math.min(progressPercentage, 100)} />
          </div>

          {/* Deadline */}
          {goal.deadline && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>
                {t("goals.goalCard.dueLabel")}:{" "}
                {new Date(goal.deadline).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Progress input */}
          {goal.status === "active" && (
            <div className="flex items-center gap-2 pt-1">
              <Input
                type="number"
                placeholder={t("goals.goalCard.addProgressPlaceholder")}
                className="flex-1 h-8 text-sm"
                value={progressInput}
                onChange={(e) => setProgressInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitProgress();
                }}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={submitProgress}
                disabled={!progressInput || parseInt(progressInput, 10) <= 0}
                className="cursor-pointer h-8 px-2"
                aria-label={t("goals.goalCard.addProgressAria")}
              >
                <Plus className="w-4 h-4" />
              </Button>
              {progressPercentage >= 100 && (
                <Button
                  size="sm"
                  onClick={() => onCompleteGoal(goal.id)}
                  className="cursor-pointer h-8 text-xs whitespace-nowrap"
                >
                  {t("goals.goalCard.markComplete")}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
