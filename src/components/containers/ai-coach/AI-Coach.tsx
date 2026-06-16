import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import { Lightbulb, Target, BarChart3 } from "lucide-react";
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

export default function AICoach() {
  const { t } = useTranslation();
  const { user } = useUserStore();

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

  const { habits, error: habitsError } = useHabits();
  const { tasks, error: tasksError } = useTasks();
  const { goals, error: goalsError } = useGoals();
  const hookError = habitsError || tasksError || goalsError;

  const visibleInsights = insights.filter((i) => !i.isDismissed);

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
        setError(null);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Failed to load AI Coach data",
        );
      }
    },
    [user?.id, habits, tasks, goals],
  );

  useEffect(() => {
    setIsLoading(true);
    loadCoachData().finally(() => setIsLoading(false));
  }, [loadCoachData]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleRefresh = async () => {
    setIsRefreshing(true);
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
    <div className="p-6 space-y-6">
      <AiCoachHeader
        habits={habits}
        tasks={tasks}
        goals={goals}
        // isRefreshing={isRefreshing}
        // onRefresh={handleRefresh}
      />

      {(error || hookError) && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error || hookError}
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
      >
        <TabsList>
          <TabsTrigger value="insights" className="cursor-pointer gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            {t("aiCoach.tabs.insights", { count: visibleInsights.length })}
          </TabsTrigger>
          <TabsTrigger value="patterns" className="cursor-pointer gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            {t("aiCoach.tabs.patterns")}
          </TabsTrigger>
          <TabsTrigger
            value="recommendations"
            className="cursor-pointer gap-1.5"
          >
            <Target className="w-3.5 h-3.5" />
            {t("aiCoach.tabs.recommendations")}
          </TabsTrigger>
        </TabsList>

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
    </div>
  );
}
