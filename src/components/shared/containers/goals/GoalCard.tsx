import { Calendar, CheckCircle2, Trash2 } from "lucide-react";
import type { Goal } from "../../../../types/goal.types";
import { Badge } from "../../../ui/badge";
import { Card, CardContent } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Progress } from "../../../ui/progress";
import { Input } from "../../../ui/input";
import { useGoals } from "../../../../hooks/goal.hooks";

export const GoalCard = ({ goal }: { goal: Goal }) => {
  const { updateProgress, completeGoal, deleteGoal } = useGoals();

  const progressPercentage = Math.round(
    (goal.currentValue / goal.targetValue) * 100,
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "paused":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-muted text-foreground border-border";
    }
  };
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
                {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteGoal(goal.id)}
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
                {goal.currentValue} / {goal.targetValue} {goal.unit}
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
              <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
            </div>
          )}

          {/* Progress input */}
          {goal.status === "active" && (
            <div className="flex items-center gap-2 pt-1">
              <Input
                type="number"
                placeholder="Add progress"
                className="flex-1 h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const value = parseInt(
                      (e.target as HTMLInputElement).value,
                    );
                    if (value > 0) {
                      updateProgress(goal.id, value);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }
                }}
              />
              {progressPercentage >= 100 && (
                <Button
                  size="sm"
                  onClick={() => completeGoal(goal.id)}
                  className="cursor-pointer h-8 text-xs whitespace-nowrap"
                >
                  Mark Complete
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
