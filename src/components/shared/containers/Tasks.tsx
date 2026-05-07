import TaskInput from "../TaskInput";
import TaskList from "../TaskList";
import { Button } from "../../ui/button";
import { useTasks } from "../../../hooks/task.hooks";
import { ListTodo } from "lucide-react";
import type { TaskFormData } from "../../../types/task.types";

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

function StatCardSkeleton() {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm text-center">
      <Skeleton className="h-8 sm:h-9 w-12 mx-auto mb-2" />
      <Skeleton className="h-3.5 w-20 mx-auto" />
    </div>
  );
}

function TaskListSkeleton() {
  return (
    <div className="py-4 space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-slate-200 px-3 py-3 flex items-center gap-3"
        >
          <Skeleton className="w-4 h-4 rounded shrink-0" />
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

  function handleAdd(data: TaskFormData) {
    addTask(data);
  }

  function handleEdit(id: string, data: Partial<TaskFormData>) {
    editTask(id, data);
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Tasks</h1>
          <p className="text-muted-foreground text-sm">
            Set and track your productivity goals
          </p>
        </div>
        {!loading && completedCount > 0 && (
          <Button
            onClick={clearCompleted}
            variant="destructive"
            size="sm"
            className="cursor-pointer shrink-0 text-xs sm:text-sm"
          >
            Clear ({completedCount})
          </Button>
        )}
      </div>

      {/* Stat Cards — 2 cols on mobile, 4 on sm+ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm text-center hover:shadow-md transition-shadow"
              >
                <span
                  className={`block text-2xl sm:text-3xl font-bold ${stat.color} mb-1`}
                >
                  {stat.value}
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-600">
                  {stat.label}
                </span>
              </div>
            ))}
      </div>

      {/* Task Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-3 sm:px-4 py-3 sm:py-4 border-b bg-slate-50/50">
          <TaskInput onAdd={handleAdd} />
        </div>

        <div className="px-3 sm:px-4 py-2">
          {loading ? (
            <TaskListSkeleton />
          ) : tasks.length === 0 ? (
            <div className="py-12 sm:py-16 flex flex-col items-center justify-center text-slate-400">
              <ListTodo
                className="w-12 h-12 sm:w-16 sm:h-16 mb-3 opacity-20"
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
              onEdit={handleEdit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
