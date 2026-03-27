import TaskInput from "../TaskInput";
import TaskList from "../TaskList";
import { Button } from "../../ui/button";
import { useTasks } from "../../../hooks/task.hooks";
import { ListTodo } from "lucide-react";

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

function StatCardSkeleton() {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
      <Skeleton className="h-9 w-12 mx-auto mb-2" />
      <Skeleton className="h-3.5 w-20 mx-auto" />
    </div>
  );
}

function TaskListSkeleton() {
  return (
    <div className="py-4 space-y-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-2.5">
          <Skeleton className="w-5 h-5 rounded-full shrink-0" />
          <Skeleton
            className={`h-4 ${i % 3 === 0 ? "w-3/4" : i % 3 === 1 ? "w-1/2" : "w-2/3"}`}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

const Tasks = () => {
  const {
    tasks,
    addTask,
    removeTask,
    toggleTask,
    clearCompleted,
    countCompleted,
    editTask,
    loading,
  } = useTasks();

  const totalTasks = tasks.length;
  const completedCount = countCompleted();
  const activeCount = totalTasks - completedCount;
  const completionRate =
    totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const stats = [
    { label: "Total Tasks", value: totalTasks, color: "text-blue-600" },
    { label: "Active Tasks", value: activeCount, color: "text-amber-600" },
    { label: "Completed", value: completedCount, color: "text-emerald-600" },
    {
      label: "Completion",
      value: `${completionRate}%`,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-muted-foreground text-sm">
            Set and track your productivity goals
          </p>
        </div>
        {!loading && completedCount > 0 && (
          <Button
            onClick={clearCompleted}
            variant="destructive"
            size="sm"
            className="cursor-pointer"
          >
            Clear Completed ({completedCount})
          </Button>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center hover:shadow-md transition-shadow"
              >
                <span className={`block text-3xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </span>
                <span className="text-sm font-medium text-slate-600">
                  {stat.label}
                </span>
              </div>
            ))}
      </div>

      {/* Task Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-4 border-b bg-slate-50/50">
          <TaskInput onAdd={addTask} />
        </div>

        <div className="px-4 py-2">
          {loading ? (
            <TaskListSkeleton />
          ) : tasks.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400">
              <ListTodo
                className="w-16 h-16 mb-3 opacity-20"
                strokeWidth={1.5}
              />
              <p className="text-sm">No tasks found. Add one to get started!</p>
            </div>
          ) : (
            <TaskList
              tasks={tasks}
              onDelete={removeTask}
              onToggle={toggleTask}
              onClearCompleted={clearCompleted}
              onCountCompleted={countCompleted}
              onEdit={editTask}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
