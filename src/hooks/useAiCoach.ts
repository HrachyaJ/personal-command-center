import { useState, useEffect, useCallback, useRef } from "react";
import { useHabits } from "./habit.hooks";
import { useTasks } from "./task.hooks";
import { useGoals } from "./goal.hooks";
import { useUserStore } from "../stores/useUserStore";
import { API_BASE, authFetch } from "../lib/utils";
import type {
  AiCoachInsight,
  AiCoachRecommendation,
} from "../types/ai-coach.types";

export function useAiCoach() {
  const { user } = useUserStore();
  const { habits, loading: habitsLoading } = useHabits();
  const { tasks, loading: tasksLoading } = useTasks();
  const { goals, loading: goalsLoading } = useGoals();
  const dataLoading = habitsLoading || tasksLoading || goalsLoading;

  const [insights, setInsights] = useState<AiCoachInsight[]>([]);
  const [recommendations, setRecommendations] = useState<
    AiCoachRecommendation[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [insufficient, setInsufficient] = useState(false);

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
      } catch (e) {
        console.error(e);
      }
    },
    [user?.id, habits, tasks, goals],
  );

  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!user?.id || dataLoading) return;
    if (hasLoaded.current) return;

    hasLoaded.current = true;
    setIsLoading(true);
    loadCoachData().finally(() => setIsLoading(false));
  }, [user?.id, dataLoading, loadCoachData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    hasLoaded.current = false;
    await loadCoachData(true);
    setIsRefreshing(false);
  };

  const visibleInsights = insights.filter((i) => !i.isDismissed);

  return {
    insights: visibleInsights,
    recommendations: recommendations.filter((r) => !r.isApplied),
    isLoading,
    isRefreshing,
    insufficient,
    handleRefresh,
  };
}
