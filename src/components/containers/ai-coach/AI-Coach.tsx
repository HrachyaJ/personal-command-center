import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import { Lightbulb, Target, BarChart3 } from "lucide-react";
import AiCoachInsights, { totalInsightsCount } from "./AiCoachInsights";
import AiCoachPatterns from "./AiCoachPatterns";
import AiCoachRecommendations from "./AiCoachRecommendations";
import AiCoachHeader from "./AiCoachHeader";
import { useHabits } from "../../../hooks/habit.hooks";
import { useTasks } from "../../../hooks/task.hooks";
import { useGoals } from "../../../hooks/goal.hooks";

export default function AICoach() {
  const [activeTab, setActiveTab] = useState<
    "insights" | "patterns" | "recommendations"
  >("insights");
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);

  const visibleCount = totalInsightsCount - dismissedInsights.length;

  const { habits, error: habitsError } = useHabits();
  const { tasks, error: tasksError } = useTasks();
  const { goals, error: goalsError } = useGoals();
  const error = habitsError || tasksError || goalsError;

  return (
    <div className="p-6 space-y-6">
      <AiCoachHeader habits={habits} tasks={tasks} goals={goals} />
      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
      >
        <TabsList>
          <TabsTrigger value="insights" className="cursor-pointer gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            Insights ({visibleCount})
          </TabsTrigger>
          <TabsTrigger value="patterns" className="cursor-pointer gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            Patterns
          </TabsTrigger>
          <TabsTrigger
            value="recommendations"
            className="cursor-pointer gap-1.5"
          >
            <Target className="w-3.5 h-3.5" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        {/* ── Insights ── */}
        <AiCoachInsights
          dismissedInsights={dismissedInsights}
          onDismiss={(id) => setDismissedInsights((prev) => [...prev, id])}
        />

        {/* ── Patterns ── */}
        <AiCoachPatterns tasks={tasks} />

        {/* ── Recommendations ── */}
        <AiCoachRecommendations />
      </Tabs>
    </div>
  );
}
