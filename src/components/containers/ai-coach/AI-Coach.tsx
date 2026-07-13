import { useState, useEffect, useCallback, useRef } from "react";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import { Lightbulb, Target, BarChart3, Brain } from "lucide-react";
import AiCoachInsights from "./AiCoachInsights";
import AiCoachPatterns from "./AiCoachPatterns";
import AiCoachRecommendations from "./AiCoachRecommendations";
import AiCoachHeader from "./AiCoachHeader";
import { useHabits } from "../../../hooks/habit.hooks";
import { useTasks } from "../../../hooks/task.hooks";
import { useGoals } from "../../../hooks/goal.hooks";
import { useTranslation } from "../../../hooks/useTranslation";
import { useUserStore } from "../../../stores/useUserStore";
import type {
  AiCoachInsight,
  AiCoachRecommendation,
} from "../../../types/ai-coach.types";
import { API_BASE, authFetch } from "../../../lib/utils";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";

export default function AICoach() {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    "insights" | "patterns" | "recommendations"
  >("insights");

  const [insights, setInsights] = useState<AiCoachInsight[]>([]);
  const [recommendations, setRecommendations] = useState<
    AiCoachRecommendation[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { habits, error: habitsError, loading: habitsLoading } = useHabits();
  const { tasks, error: tasksError, loading: tasksLoading } = useTasks();
  const { goals, error: goalsError, loading: goalsLoading } = useGoals();
  const hookError = habitsError || tasksError || goalsError;
  const dataLoading = habitsLoading || tasksLoading || goalsLoading;

  const visibleInsights = insights.filter((i) => !i.isDismissed);

  const [insufficient, setInsufficient] = useState(false);

  // ── Load coach data ──────────────────────────────────────────────────────

  const loadCoachData = useCallback(
    async (force = false) => {
      if (!user?.id || !habits || !tasks || !goals) return;
      try {
        const res = await authFetch(`${API_BASE}/api/ai-coach`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ force, habits, tasks, goals }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setInsights(data.insights);
        setRecommendations(data.recommendations);
        setInsufficient(data.insufficient ?? false);
        setError(null);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : t("aiCoach.errors.loadFailed"),
        );
      }
    },
    [user?.id, habits, tasks, goals, t],
  );

  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!user?.id || dataLoading) return;
    if (hasLoaded.current) return; // prevent re-runs

    hasLoaded.current = true;
    setIsLoading(true);
    loadCoachData().finally(() => setIsLoading(false));
  }, [user?.id, dataLoading, loadCoachData]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleRefresh = async () => {
    if (insufficient) return; // belt-and-suspenders: never let refresh hit the LLM with sparse data
    setIsRefreshing(true);
    hasLoaded.current = false; // allow one more call
    await loadCoachData(true);
    setIsRefreshing(false);
  };

  const handleDismiss = async (id: string) => {
    // Optimistic update
    setInsights((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isDismissed: true } : i)),
    );
    try {
      await authFetch(`${API_BASE}/api/ai-coach/insights/${id}/dismiss`, {
        method: "PATCH",
      });
    } catch {
      // Roll back on failure
      setInsights((prev) =>
        prev.map((i) => (i.id === id ? { ...i, isDismissed: false } : i)),
      );
    }
  };

  const handleApplyRecommendation = async (id: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isApplied: true } : r)),
    );
    try {
      await authFetch(`${API_BASE}/api/ai-coach/recommendations/${id}/apply`, {
        method: "PATCH",
      });
    } catch {
      setRecommendations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isApplied: false } : r)),
      );
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-20 lg:pb-6">
      <AiCoachHeader
        habits={habits}
        tasks={tasks}
        goals={goals}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        insufficient={insufficient}
      />

      {(error || hookError) && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error || hookError}
        </div>
      )}

      {insufficient ? (
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="font-medium">{t("aiCoach.insufficient.title")}</p>
            <p className="text-sm text-muted-foreground">
              {t("aiCoach.insufficient.description")}
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/tasks")}
              >
                {t("aiCoach.insufficient.addTask")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/habits")}
              >
                {t("aiCoach.insufficient.addHabit")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/goals?create=true")}
              >
                {t("aiCoach.insufficient.setGoal")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        >
          <div className="overflow-x-auto">
            <TabsList className="flex-nowrap">
              <TabsTrigger
                value="insights"
                className="cursor-pointer gap-1.5 shrink-0 text-xs sm:text-sm"
              >
                <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                {t("aiCoach.tabs.insights", {
                  count: isLoading ? "..." : visibleInsights.length,
                })}
              </TabsTrigger>
              <TabsTrigger
                value="patterns"
                className="cursor-pointer gap-1.5 shrink-0 text-xs sm:text-sm"
              >
                <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                {t("aiCoach.tabs.patterns")}
              </TabsTrigger>
              <TabsTrigger
                value="recommendations"
                className="cursor-pointer gap-1.5 shrink-0 text-xs sm:text-sm"
              >
                <Target className="w-3.5 h-3.5 shrink-0" />
                {t("aiCoach.tabs.recommendations")}
              </TabsTrigger>
            </TabsList>
          </div>

          <AiCoachInsights
            insights={visibleInsights}
            isLoading={isLoading}
            onDismiss={handleDismiss}
          />

          <AiCoachPatterns tasks={tasks} />

          <AiCoachRecommendations
            recommendations={recommendations}
            isLoading={isLoading}
            onApply={handleApplyRecommendation}
          />
        </Tabs>
      )}
    </div>
  );
}
