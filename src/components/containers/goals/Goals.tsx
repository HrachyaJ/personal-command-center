import { useEffect, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Plus, Target } from "lucide-react";
import { useGoals } from "../../../hooks/goal.hooks";
import { GoalCardSkeleton, GoalStatCardSkeleton } from "../../shared/Skeletons";
import { GoalCard } from "./GoalCard";
import { StatCard } from "../../shared/StatCard";
import { OnboardingDialog } from "../../shared/OnboardingPanel";
import { useOnboardingSeen } from "../../../hooks/onboarding.hooks";
import { useTranslation } from "../../../hooks/useTranslation";
import { useSearchParams } from "react-router-dom";

export default function Goals() {
  const {
    addGoal,
    updateProgress,
    completeGoal,
    deleteGoal,
    getGoalsByStatus,
    getStats,
    loading,
    error,
  } = useGoals();

  const stats = getStats();
  const [searchParams, setSearchParams] = useSearchParams();
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
  const { seen: onboardingSeen, markSeen: markOnboardingSeen } =
    useOnboardingSeen("goals");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setIsAddDialogOpen(true);
      setSearchParams({}, { replace: true }); // clean the URL after opening
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (loading || onboardingSeen) return;

    if (stats.total > 0) {
      // User already has data (e.g. seeded/legacy goals) — they're not new,
      // so retire the flag silently instead of waiting for an empty state.
      markOnboardingSeen();
      return;
    }

    setIsOnboardingOpen(true);
  }, [loading, stats.total, onboardingSeen]);

  const handleOnboardingOpenChange = (open: boolean) => {
    setIsOnboardingOpen(open);
    if (!open) {
      markOnboardingSeen();
    }
  };

  const handleStartGoalOnboarding = () => {
    markOnboardingSeen();
    setIsOnboardingOpen(false);
    setIsAddDialogOpen(true);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    addGoal({
      title: newGoal.title,
      description: newGoal.description,
      targetValue: parseInt(newGoal.targetValue, 10),
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
    <div className="p-4 space-y-4 sm:space-y-6 pb-20 sm:pb-20 md:pb-6 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">
            {t("goals.header")}
          </h1>
          <p className="text-muted-foreground text-sm">{t("goals.subtitle")}</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="cursor-pointer shrink-0" size="sm">
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t("goals.addButton")}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100vw-2rem)] max-w-lg sm:w-full rounded-xl">
            <DialogHeader>
              <DialogTitle>{t("goals.dialog.title")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t("goals.form.titleLabel")}</Label>
                <Input
                  id="title"
                  placeholder={t("goals.form.titlePlaceholder")}
                  value={newGoal.title}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">
                  {t("goals.form.descriptionLabel")}
                </Label>
                <Textarea
                  id="description"
                  placeholder={t("goals.form.descriptionPlaceholder")}
                  value={newGoal.description}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetValue">
                    {t("goals.form.targetValueLabel")}
                  </Label>
                  <Input
                    id="targetValue"
                    type="number"
                    placeholder={t("goals.form.targetValuePlaceholder")}
                    value={newGoal.targetValue}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, targetValue: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">{t("goals.form.unitLabel")}</Label>
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
                      <SelectItem value="tasks">
                        {t("goals.form.unit.tasks")}
                      </SelectItem>
                      <SelectItem value="hours">
                        {t("goals.form.unit.hours")}
                      </SelectItem>
                      <SelectItem value="sessions">
                        {t("goals.form.unit.sessions")}
                      </SelectItem>
                      <SelectItem value="days">
                        {t("goals.form.unit.days")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">
                  {t("goals.form.deadlineLabel")}
                </Label>
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
                  {t("goals.form.cancel")}
                </Button>
                <Button type="submit" className="cursor-pointer">
                  {t("goals.form.createGoal")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      <OnboardingDialog
        open={isOnboardingOpen}
        onOpenChange={handleOnboardingOpenChange}
        title={t("goals.onboarding.title")}
        subtitle={t("goals.onboarding.subtitle")}
        steps={[
          {
            title: t("goals.onboarding.step.frameOutcome"),
            description: t("goals.onboarding.step.frameOutcomeDesc"),
          },
          {
            title: t("goals.onboarding.step.pickTarget"),
            description: t("goals.onboarding.step.pickTargetDesc"),
          },
          {
            title: t("goals.onboarding.step.checkProgress"),
            description: t("goals.onboarding.step.checkProgressDesc"),
          },
        ]}
        primaryAction={{
          label: t("goals.onboarding.primaryAction"),
          onClick: handleStartGoalOnboarding,
        }}
        secondaryAction={{
          label: t("goals.onboarding.secondaryAction"),
          onClick: () => handleOnboardingOpenChange(false),
        }}
      />

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
              label={t("goals.stats.totalGoals")}
              color="text-primary"
            />
            <StatCard
              value={stats.active}
              label={t("goals.stats.activeGoals")}
              color="text-blue-600"
            />
            <StatCard
              value={stats.completed}
              label={t("goals.stats.completed")}
              color="text-green-600"
            />
            <StatCard
              value={`${stats.completionRate}%`}
              label={t("goals.stats.completionRate")}
              color="text-purple-600"
            />
          </>
        )}
      </div>

      {/* Tabs + Goal List */}
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "active" | "completed" | "paused")
        }
      >
        <TabsList className="bg-muted rounded-xl p-1 h-auto gap-1">
          <TabsTrigger
            value="active"
            className="cursor-pointer flex-1 sm:flex-none text-xs sm:text-sm rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:font-semibold"
          >
            {t("goals.tabs.active", { count: loading ? "…" : stats.active })}
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="cursor-pointer flex-1 sm:flex-none text-xs sm:text-sm rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:font-semibold"
          >
            {t("goals.tabs.completed", {
              count: loading ? "…" : stats.completed,
            })}
          </TabsTrigger>
          <TabsTrigger
            value="paused"
            className="cursor-pointer flex-1 sm:flex-none text-xs sm:text-sm rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:font-semibold"
          >
            {t("goals.tabs.paused", { count: loading ? "…" : stats.paused })}
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
                  {t(`goals.empty.${activeTab}`)}
                </p>
                <Button
                  className="cursor-pointer"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  {t("goals.empty.createFirstGoal")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onUpdateProgress={updateProgress}
                onCompleteGoal={completeGoal}
                onDeleteGoal={deleteGoal}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
