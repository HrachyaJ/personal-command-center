import { Card, CardContent, CardHeader } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  BarChart3,
  Bell,
  CheckCircle,
  Clock,
  Flame,
  Settings,
  Shield,
} from "lucide-react";
import { useTasks } from "../../../hooks/task.hooks";

export default function Dashboard({}: {}) {
  const { countCompleted, getTasksLeft } = useTasks();

  const completedTasks = countCompleted();
  const tasksLeft = getTasksLeft();

  const stats = [
    {
      title: "Tasks Completed",
      value: completedTasks,
      unit: "",
      change: `${tasksLeft === 0 ? "All tasks completed!" : `${tasksLeft} tasks left`}`,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    // {
    //   title: "Focus Streak",
    //   // value: analytics?.focusStreak || 0,
    //   unit: " days",
    //   change: "Personal best!",
    //   icon: Flame,
    //   color: "text-purple-600",
    //   bgColor: "bg-purple-100 dark:bg-purple-900",
    // },
  ];

  return (
    <div data-testid="dashboard-page">
      <header className="bg-card border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold" data-testid="greeting">
              Good morning, John Doe!
              {/* We get the users name and show that name */}
            </h2>
            <p className="text-muted-foreground mt-1">
              Ready to tackle your goals today?
              {/* This phrase should change daily  */}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* AI Coach Status */}
            <Badge className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
              <Shield className="w-3 h-3 mr-1" />
              AI Coach Active
            </Badge>

            {/* Notification Bell */}
            <Button
              variant="ghost"
              size="icon"
              data-testid="button-notifications"
              className="cursor-pointer"
            >
              <div className="relative">
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></div>
              </div>
            </Button>

            {/* Settings */}
            <Button
              className="cursor-pointer"
              variant="ghost"
              size="icon"
              data-testid="button-settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Tasks Card */}
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                data-testid={`stat-${stat.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.title}
                      </p>
                      <p
                        className="text-2xl font-semibold mt-1"
                        data-testid={`stat-value-${stat.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                      >
                        {stat.value}
                        {stat.unit}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {stat.change}
                      </p>
                    </div>
                    <div
                      className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}
                    >
                      <Icon className={`${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Tasks and Time Tracking */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI-Prioritized Tasks */}
          </div>

          {/* Right Column: Pomodoro and AI Coach */}
          <div className="space-y-6">
            {/* Pomodoro Timer */}

            {/* AI Productivity Coach */}

            {/* Focus Mode Status */}
          </div>
        </div>

        {/* Goals Progress Section */}
      </div>
    </div>
  );
}
