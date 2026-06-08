import TaskInput from "./TaskInput";
import TaskList from "./TaskList";
import { Button } from "../../ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../ui/tabs";
import { useTasks } from "../../../hooks/task.hooks";
import { ListTodo } from "lucide-react";
import { useState } from "react";
import {
  TaskListSkeleton,
  TasksStatCardSkeleton,
} from "../../shared/Skeletons";
import { StatCard } from "../../shared/StatCard";

const Tasks = () => {
  const {
    tasks,
    addTask,
    removeTask,
    toggleTask,
    clearCompleted,
    countCompleted,
    editTask,
    getStats,
    loading,
    error,
  } = useTasks();

  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const stats = getStats();

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const visibleTasks = activeTab === "active" ? activeTasks : completedTasks;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Tasks</h1>
          <p className="text-muted-foreground text-sm">
            Manage and complete your tasks
          </p>
        </div>
        {!loading && countCompleted() > 0 && activeTab === "completed" && (
          <Button
            onClick={clearCompleted}
            variant="destructive"
            size="sm"
            className="cursor-pointer shrink-0 text-xs sm:text-sm"
          >
            Clear ({countCompleted()})
          </Button>
        )}
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <TasksStatCardSkeleton key={i} />
            ))
          : stats.map((stat) => (
              <StatCard
                key={stat.label}
                value={stat.value}
                label={stat.label}
                color={stat.color}
              />
            ))}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "active" | "completed")}
      >
        {/* Tabs outside the card */}
        <TabsList className="mb-3">
          <TabsTrigger
            value="active"
            className="cursor-pointer text-xs sm:text-sm"
          >
            Active ({loading ? "…" : activeTasks.length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="cursor-pointer text-xs sm:text-sm"
          >
            Completed ({loading ? "…" : completedTasks.length})
          </TabsTrigger>
        </TabsList>

        {/* Task Panel */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-3 sm:px-4 py-3 sm:py-4 border-b bg-muted">
            <TaskInput onAdd={addTask} />
          </div>

          <div className="px-3 sm:px-4 pt-3 pb-2">
            <TabsContent value={activeTab}>
              {loading ? (
                <TaskListSkeleton />
              ) : visibleTasks.length === 0 ? (
                <div className="py-12 sm:py-16 flex flex-col items-center justify-center text-muted-foreground">
                  <ListTodo
                    className="w-12 h-12 sm:w-16 sm:h-16 mb-3 opacity-20"
                    strokeWidth={1.5}
                  />
                  <p className="text-sm">
                    {activeTab === "active"
                      ? "No active tasks. Add one above!"
                      : "No completed tasks yet."}
                  </p>
                </div>
              ) : (
                <TaskList
                  tasks={visibleTasks}
                  onDelete={removeTask}
                  onToggle={toggleTask}
                  onClearCompleted={clearCompleted}
                  onCountCompleted={countCompleted}
                  onEdit={editTask}
                />
              )}
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default Tasks;
