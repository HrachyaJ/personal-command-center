import {
  AlertCircle,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import { insightColors, priorityColors } from "../../../lib/utils";
import type { Insight, InsightType } from "../../../types/ai-coach";
import { TabsContent } from "../../ui/tabs";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";

const insights: Insight[] = [
  {
    id: "1",
    type: "pattern",
    title: "You're a morning person",
    description:
      "87% of your completed tasks are created or worked on before 11 AM. Your focus drops sharply after 3 PM — consider front-loading your hardest work.",
    priority: "high",
    relatedTo: "Tasks",
    actionLabel: "Reschedule tasks",
  },
  {
    id: "2",
    type: "warning",
    title: "Sunday slump detected",
    description:
      "Your task completion rate on Sundays is 23% — the lowest of any day. Tasks added Sunday evening have a 78% chance of being abandoned.",
    priority: "high",
    relatedTo: "Tasks",
    actionLabel: "View Sunday tasks",
  },
  {
    id: "3",
    type: "achievement",
    title: "Goal momentum is strong",
    description:
      'Your "Read 12 books" goal is 3 weeks ahead of schedule. Based on your current pace, you\'ll complete it by September instead of December.',
    priority: "medium",
    relatedTo: "Goals",
  },
  {
    id: "4",
    type: "tip",
    title: "Habit stacking opportunity",
    description:
      'You consistently complete "Morning run" but skip "Journaling" on the same days. Attaching journaling right after your run could boost its completion by ~40%.',
    priority: "medium",
    relatedTo: "Habits",
    actionLabel: "Try habit stack",
  },
  {
    id: "5",
    type: "warning",
    title: "Task overload on Mondays",
    description:
      "You add an average of 11 tasks on Mondays but only complete 4. This gap might be causing stress and a false sense of falling behind.",
    priority: "medium",
    relatedTo: "Tasks",
    actionLabel: "Review Mondays",
  },
  {
    id: "6",
    type: "achievement",
    title: "14-day habit streak",
    description:
      'You\'ve maintained your "Morning run" habit for 14 consecutive days — your longest streak ever. Keep it going!',
    priority: "low",
    relatedTo: "Habits",
  },
];

interface AiCoachInsightsProps {
  dismissedInsights: string[];
  onDismiss: (id: string) => void;
}

export const totalInsightsCount = insights.length;

export default function AiCoachInsights({
  dismissedInsights,
  onDismiss,
}: AiCoachInsightsProps) {
  const visibleInsights = insights.filter(
    (i) => !dismissedInsights.includes(i.id),
  );

  const handleDismiss = (id: string) => {
    onDismiss(id);
  };

  function InsightIcon({ type }: { type: InsightType }) {
    switch (type) {
      case "tip":
        return <Lightbulb className="w-4 h-4" />;
      case "warning":
        return <AlertCircle className="w-4 h-4" />;
      case "achievement":
        return <CheckCircle2 className="w-4 h-4" />;
      case "pattern":
        return <BarChart3 className="w-4 h-4" />;
    }
  }

  return (
    <TabsContent value="insights" className="space-y-3 mt-4">
      {visibleInsights.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              All insights reviewed. Check back after more activity!
            </p>
          </CardContent>
        </Card>
      ) : (
        visibleInsights.map((insight) => {
          const colors = insightColors(insight.type);
          return (
            <Card key={insight.id} className={`border-l-4 ${colors.border}`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className={`mt-0.5 p-2 rounded-lg shrink-0 ${colors.icon}`}
                  >
                    <InsightIcon type={insight.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="font-semibold text-sm">{insight.title}</h3>
                      <Badge className={`text-[10px] ${colors.badge}`}>
                        {insight.type}
                      </Badge>
                      <Badge
                        className={`text-[10px] ${priorityColors(insight.priority)}`}
                      >
                        {insight.priority} priority
                      </Badge>
                      <Badge className="text-[10px]">{insight.relatedTo}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {insight.description}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      {insight.actionLabel && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="cursor-pointer h-7 text-xs gap-1"
                        >
                          {insight.actionLabel}
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="cursor-pointer h-7 text-xs text-muted-foreground"
                        onClick={() => handleDismiss(insight.id)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </TabsContent>
  );
}
