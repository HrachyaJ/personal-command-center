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

export default function Goals() {
  // ============================================
  // USE THE HOOK - This handles all data management
  // ============================================
  const {
    goals,
    addGoal,
    updateProgress,
    completeGoal,
    deleteGoal,
    getGoalsByStatus,
    getStats,
  } = useGoals();

  // Get statistics
  const stats = getStats();

  // ============================================
  // LOCAL UI STATE (not persisted)
  // ============================================
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

  // ============================================
  // EVENT HANDLERS
  // ============================================

  // Creates a new goal
  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();

    // Call the hook's addGoal function
    addGoal({
      title: newGoal.title,
      description: newGoal.description,
      targetValue: parseInt(newGoal.targetValue),
      unit: newGoal.unit,
      deadline: newGoal.deadline || undefined,
    });

    // Reset the form
    setNewGoal({
      title: "",
      description: "",
      targetValue: "",
      unit: "tasks",
      deadline: "",
    });

    // Close the dialog
    setIsAddDialogOpen(false);
  };

  // Updates the progress of a goal
  const handleUpdateProgress = (goalId: string, addValue: number) => {
    updateProgress(goalId, addValue);
  };

  // Marks a goal as complete
  const handleCompleteGoal = (goalId: string) => {
    completeGoal(goalId);
  };

  // Deletes a goal
  const handleDeleteGoal = (goalId: string) => {
    deleteGoal(goalId);
  };

  // ============================================
  // FILTERED GOALS BY TAB
  // ============================================
  const filteredGoals = getGoalsByStatus(activeTab);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
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

  // ============================================
  // GOAL CARD COMPONENT
  // ============================================
  const GoalCard = ({ goal }: { goal: Goal }) => {
    const progressPercentage = Math.round(
      (goal.currentValue / goal.targetValue) * 100,
    );

    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{goal.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {goal.description}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(goal.status)}>
                  {goal.status === "completed" && (
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                  )}
                  {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                </Badge>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="cursor-pointer hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
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
                <Calendar className="w-4 h-4" />
                <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
              </div>
            )}

            {/* Actions - only show for active goals */}
            {goal.status === "active" && (
              <div className="flex items-center space-x-2 pt-2">
                <Input
                  type="number"
                  placeholder="Add progress"
                  className="flex-1"
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
                    className="cursor-pointer"
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

  // ============================================
  // RENDER THE UI
  // ============================================
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Goals</h1>
          <p className="text-muted-foreground text-sm">
            Set and track your productivity goals
          </p>
        </div>

        {/* Add Goal Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
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

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
            <p className="text-sm text-muted-foreground mt-1">Total Goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {stats.active}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Active Goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {stats.completed}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Completed Goals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {stats.completionRate}%
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Completion Rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Goals List */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as any)}
      >
        <TabsList>
          <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({stats.completed})
          </TabsTrigger>
          <TabsTrigger value="paused">Paused ({stats.paused})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {filteredGoals.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
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
