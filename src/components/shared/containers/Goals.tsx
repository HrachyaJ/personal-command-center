import { useState } from "react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Progress } from "../../ui/progress";
import { Badge } from "../../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Plus, Target, Calendar, Trash2, CheckCircle2 } from "lucide-react";
import type { Goal } from "../../../types/goal.types";
import { useGoals } from "../../../hooks/goal.hooks";

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6 text-center">
        <Skeleton className="h-8 sm:h-9 w-12 mx-auto mb-2" />
        <Skeleton className="h-3.5 w-24 mx-auto" />
      </CardContent>
    </Card>
  );
}

function GoalCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-3.5 w-3/5" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full ml-4 shrink-0" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3.5 w-8" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-3.5 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Goals ───────────────────────────────────────────────────────────────────

export default function Goals() {
  const {
    addGoal,
    updateProgress,
    completeGoal,
    deleteGoal,
    getGoalsByStatus,
    getStats,
    loading,
  } = useGoals();

  const stats = getStats();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "paused">(
    "active",
  );
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    targetValue: "",
    unit: "tasks",
    deadline: "",
  });

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    addGoal({
      title: newGoal.title,
      description: newGoal.description,
      targetValue: parseInt(newGoal.targetValue),
      unit: newGoal.unit,
      deadline: newGoal.deadline || undefined,
    });
    setNewGoal({
      title: "",
      description: "",
      targetValue: "",
      unit: "tasks",
      deadline: "",
    });
    setIsAddDialogOpen(false);
  };

  const handleUpdateProgress = (goalId: string, addValue: number) =>
    updateProgress(goalId, addValue);
  const handleCompleteGoal = (goalId: string) => completeGoal(goalId);
  const handleDeleteGoal = (goalId: string) => deleteGoal(goalId);

  const filteredGoals = getGoalsByStatus(activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "paused":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const GoalCard = ({ goal }: { goal: Goal }) => {
    const progressPercentage = Math.round(
      (goal.currentValue / goal.targetValue) * 100,
    );
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
                  onClick={() => handleDeleteGoal(goal.id)}
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
                        handleUpdateProgress(goal.id, value);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }}
                />
                {progressPercentage >= 100 && (
                  <Button
                    size="sm"
                    onClick={() => handleCompleteGoal(goal.id)}
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

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Goals</h1>
          <p className="text-muted-foreground text-sm">
            Set and track your productivity goals
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="cursor-pointer shrink-0" size="sm">
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Goal</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100vw-2rem)] max-w-lg sm:w-full rounded-xl">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter goal title"
                  value={newGoal.title}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter goal description"
                  value={newGoal.description}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetValue">Target Value *</Label>
                  <Input
                    id="targetValue"
                    type="number"
                    placeholder="100"
                    value={newGoal.targetValue}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, targetValue: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    value={newGoal.unit}
                    onValueChange={(value) =>
                      setNewGoal({ ...newGoal, unit: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tasks">Tasks</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="sessions">Sessions</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, deadline: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="cursor-pointer">
                  Create Goal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stat Cards — 2 cols on mobile, 4 on lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <Card>
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  {stats.total}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Total Goals
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                  {stats.active}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Active Goals
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">
                  {stats.completed}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Completed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                  {stats.completionRate}%
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Completion Rate
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Tabs + Goal List */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as any)}
      >
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger
            value="active"
            className="cursor-pointer flex-1 sm:flex-none text-xs sm:text-sm"
          >
            Active ({loading ? "…" : stats.active})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="cursor-pointer flex-1 sm:flex-none text-xs sm:text-sm"
          >
            Completed ({loading ? "…" : stats.completed})
          </TabsTrigger>
          <TabsTrigger
            value="paused"
            className="cursor-pointer flex-1 sm:flex-none text-xs sm:text-sm"
          >
            Paused ({loading ? "…" : stats.paused})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-3 sm:space-y-4 mt-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <GoalCardSkeleton key={i} />
            ))
          ) : filteredGoals.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4 text-sm">
                  No {activeTab} goals yet
                </p>
                <Button
                  className="cursor-pointer"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  Create your first goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
