import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
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
import {
  Plus,
  Target,
  Calendar,
  Clock,
  TrendingUp,
  Edit,
  Trash2,
  CheckCircle2,
} from "lucide-react";

export default function Goals() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

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

  const GoalCard = () => {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">GOAL title</h3>

                <p className="text-sm text-muted-foreground mt-1">
                  GOAL DESCTIPTION
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Badge
                // className={getStatusColor(goal.status)}
                // data-testid={`goal-status-${goal.id}`}
                >
                  {/* {goal.status === "completed" && ( */}
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {/* )} */}
                  {/* {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)} */}
                </Badge>

                <Button
                  variant="ghost"
                  size="sm"
                  // data-testid={`button-edit-goal-${goal.id}`}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {/* {goal.currentValue} / {goal.targetValue} {goal.unit} */}
                </span>
                <span className="text-muted-foreground">125%</span>
              </div>
              <Progress
                value={100}
                // data-testid={`goal-progress-bar-${goal.id}`}
              />
            </div>

            {/* Deadline */}
            {/* {goal.deadline && ( */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Due</span>
            </div>
            {/* )} */}

            {/* Actions */}
            {/* {goal.status === "active" && !isCompleted && ( */}
            <div className="flex items-center space-x-2 pt-2">
              <Input
                type="number"
                placeholder="Update progress"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const value = parseInt(
                      (e.target as HTMLInputElement).value,
                    );
                    if (value >= 0) {
                      // handleUpdateProgress(goal.id, value);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }
                }}
                // data-testid={`input-update-progress-${goal.id}`}
              />

              {/* {progressPercentage >= 100 && ( */}
              <Button
                size="sm"
                // onClick={() => handleCompleteGoal(goal.id)}
                // data-testid={`button-complete-goal-${goal.id}`}
              >
                Mark Complete
              </Button>
              {/* )} */}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // if (isLoading) {
  //   return (
  //     <div className="p-6">
  //       <div className="animate-pulse space-y-4">
  //         <div className="h-8 bg-muted rounded w-1/4"></div>
  //         <div className="h-4 bg-muted rounded w-1/2"></div>
  //         <div className="grid grid-cols-2 gap-4">
  //           {[...Array(4)].map((_, i) => (
  //             <div key={i} className="h-48 bg-muted rounded"></div>
  //           ))}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="p-6 space-y-6" data-testid="goals-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Goals</h1>
          <p className="text-muted-foreground">
            Set and track your productivity goals
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-goal">
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>

            <form
              // onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter goal title"
                  // {...form.register("title")}
                  data-testid="input-goal-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter goal description"
                  // {...form.register("description")}
                  data-testid="input-goal-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetValue">Target Value *</Label>
                  <Input
                    id="targetValue"
                    type="number"
                    placeholder="100"
                    // {...form.register("targetValue")}
                    data-testid="input-goal-target"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    // onValueChange={(value) => form.setValue("unit", value)}
                    defaultValue="tasks"
                  >
                    <SelectTrigger data-testid="select-goal-unit">
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
                  // {...form.register("deadline")}
                  data-testid="input-goal-deadline"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  // disabled={createGoalMutation.isPending}
                  data-testid="button-create-goal"
                >
                  Create a goal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goal Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card data-testid="total-goals-stat">
          <CardContent className="p-6 text-center">
            <div
              className="text-3xl font-bold text-primary"
              data-testid="total-goals-count"
            >
              0
            </div>
            <p className="text-sm text-muted-foreground mt-1">Total Goals</p>
          </CardContent>
        </Card>

        <Card data-testid="active-goals-stat">
          <CardContent className="p-6 text-center">
            <div
              className="text-3xl font-bold text-blue-600"
              data-testid="active-goals-count"
            >
              0
            </div>
            <p className="text-sm text-muted-foreground mt-1">Active Goals</p>
          </CardContent>
        </Card>

        <Card data-testid="completed-goals-stat">
          <CardContent className="p-6 text-center">
            <div
              className="text-3xl font-bold text-green-600"
              data-testid="completed-goals-count"
            >
              0
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Completed Goals
            </p>
          </CardContent>
        </Card>

        <Card data-testid="completion-rate-stat">
          <CardContent className="p-6 text-center">
            <div
              className="text-3xl font-bold text-purple-600"
              data-testid="completion-rate-percentage"
            >
              0
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Completion Rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active" data-testid="tab-active-goals">
            Active 0
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed-goals">
            Completed 0
          </TabsTrigger>
          <TabsTrigger value="paused" data-testid="tab-paused-goals">
            Paused 0
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
