import { useState } from "react";
import { Card, CardContent } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import { Plus, Target } from "lucide-react";
import { useGoals } from "../../../../hooks/goal.hooks";
import { GoalCardSkeleton, GoalStatCardSkeleton } from "../../Skeletons";
import { GoalCard } from "./GoalCard";
import { StatCard } from "../../StatCard";

export default function Goals() {
  const { addGoal, getGoalsByStatus, getStats, loading } = useGoals();

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

  const filteredGoals = getGoalsByStatus(activeTab);

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
          Array.from({ length: 4 }).map((_, i) => (
            <GoalStatCardSkeleton key={i} />
          ))
        ) : (
          <>
            <StatCard
              value={stats.total}
              label="Total Goals"
              color="text-primary"
            />
            <StatCard
              value={stats.active}
              label="Active Goals"
              color="text-blue-600"
            />
            <StatCard
              value={stats.completed}
              label="Completed"
              color="text-green-600"
            />
            <StatCard
              value={`${stats.completionRate}%`}
              label="Completion Rate"
              color="text-purple-600"
            />
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
