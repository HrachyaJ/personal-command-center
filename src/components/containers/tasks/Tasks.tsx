import TaskInput from "./TaskInput";
import TaskList from "./TaskList";
import { Button } from "../../ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../ui/tabs";
import { useTasks } from "../../../hooks/task.hooks";
import { ListTodo } from "lucide-react";
import { useEffect, useState } from "react";
import {
  TaskListSkeleton,
  TasksStatCardSkeleton,
} from "../../shared/Skeletons";
import { StatCard } from "../../shared/StatCard";
import { OnboardingDialog } from "../../shared/OnboardingPanel";
import { useOnboardingSeen } from "../../../hooks/onboarding.hooks";
import { useTranslation } from "../../../hooks/useTranslation";

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
  } = useTasks();

  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const stats = getStats();

  // Wraps removeTask so the row can show a skeleton while the delete
  // request is in flight, instead of either freezing or vanishing
  // instantly on click. Assumes removeTask resolves once the server call
  // (and local state removal) completes — check task.hooks.ts if this
  // needs to be adjusted to actually await the request.
  const handleDeleteTask = async (id: string) => {
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await removeTask(id);
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };
  const { seen: onboardingSeen, markSeen: markOnboardingSeen } =
    useOnboardingSeen("tasks");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (loading || onboardingSeen) return;

    if (tasks.length > 0) {
      // User already has data (e.g. seeded/legacy tasks) — they're not new,
      // so retire the flag silently instead of waiting for an empty state.
      markOnboardingSeen();
      return;
    }

    if (activeTab === "active") {
      setIsOnboardingOpen(true);
    }
  }, [loading, tasks.length, activeTab, onboardingSeen]);

  const handleOnboardingOpenChange = (open: boolean) => {
    setIsOnboardingOpen(open);
    if (!open) {
      markOnboardingSeen();
    }
  };

  const handleStartTaskOnboarding = () => {
    markOnboardingSeen();
    setIsOnboardingOpen(false);
    scrollToTaskInput();
  };

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const visibleTasks = activeTab === "active" ? activeTasks : completedTasks;

  const scrollToTaskInput = () => {
    document.getElementById("task-input")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">
            {t("tasks.header")}
          </h1>
          <p className="text-muted-foreground text-sm">{t("tasks.subtitle")}</p>
        </div>
        {!loading && countCompleted() > 0 && activeTab === "completed" && (
          <Button
            onClick={clearCompleted}
            variant="destructive"
            size="sm"
            className="cursor-pointer shrink-0 text-xs sm:text-sm"
          >
            {t("tasks.clearCompleted", { count: countCompleted() })}
          </Button>
        )}
      </div>

      <OnboardingDialog
        open={isOnboardingOpen}
        onOpenChange={handleOnboardingOpenChange}
        title={t("tasks.onboarding.title")}
        subtitle={t("tasks.onboarding.subtitle")}
        steps={[
          {
            title: t("tasks.onboarding.step.captureTask"),
            description: t("tasks.onboarding.step.captureTaskDesc"),
          },
          {
            title: t("tasks.onboarding.step.addContext"),
            description: t("tasks.onboarding.step.addContextDesc"),
          },
          {
            title: t("tasks.onboarding.step.completeReview"),
            description: t("tasks.onboarding.step.completeReviewDesc"),
          },
        ]}
        primaryAction={{
          label: t("tasks.onboarding.primaryAction"),
          onClick: handleStartTaskOnboarding,
        }}
        secondaryAction={{
          label: t("tasks.onboarding.secondaryAction"),
          onClick: () => handleOnboardingOpenChange(false),
        }}
      />

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
        <TabsList className="mb-3 bg-muted rounded-xl p-1 h-auto gap-1">
          <TabsTrigger
            value="active"
            className="cursor-pointer text-xs sm:text-sm rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:font-semibold"
          >
            {t("tasks.tabs.active", {
              count: loading ? "…" : activeTasks.length,
            })}
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="cursor-pointer text-xs sm:text-sm rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:font-semibold"
          >
            {t("tasks.tabs.completed", {
              count: loading ? "…" : completedTasks.length,
            })}
          </TabsTrigger>
        </TabsList>

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
                      ? t("tasks.empty.active")
                      : t("tasks.empty.completed")}
                  </p>
                </div>
              ) : (
                <TaskList
                  tasks={visibleTasks}
                  onDelete={handleDeleteTask}
                  onToggle={toggleTask}
                  onClearCompleted={clearCompleted}
                  onCountCompleted={countCompleted}
                  onEdit={editTask}
                  deletingIds={deletingIds}
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
