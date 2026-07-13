import {
  AlertCircle,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import { insightColors, priorityColors } from "../../../lib/utils";
import type {
  AiCoachInsight,
  InsightType,
} from "../../../types/ai-coach.types";
import { TabsContent } from "../../ui/tabs";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { useTranslation } from "../../../hooks/useTranslation";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "../../shared/Skeletons";

const RELATED_TO_ROUTE: Record<AiCoachInsight["relatedTo"], string> = {
  Tasks: "/tasks",
  Habits: "/habits",
  Goals: "/goals?create=true",
  Schedule: "/tasks", // fallback
};

interface AiCoachInsightsProps {
  insights: AiCoachInsight[];
  isLoading: boolean;
  onDismiss: (id: string) => void;
}

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

function InsightSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-7 w-28 mt-3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AiCoachInsights({
  insights,
  isLoading,
  onDismiss,
}: AiCoachInsightsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <TabsContent value="insights" className="space-y-3 mt-4">
        {[1, 2, 3].map((n) => (
          <InsightSkeleton key={n} />
        ))}
      </TabsContent>
    );
  }

  return (
    <TabsContent value="insights" className="space-y-3 mt-4">
      {insights.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {t("aiCoach.insights.emptyMessage")}
            </p>
          </CardContent>
        </Card>
      ) : (
        insights.map((insight) => {
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
                        {t(`aiCoach.insights.type.${insight.type}`)}
                      </Badge>
                      <Badge
                        className={`text-[10px] ${priorityColors(insight.priority)}`}
                      >
                        {t(`aiCoach.insights.priority.${insight.priority}`)}{" "}
                        {t("aiCoach.insights.labels.priority")}
                      </Badge>
                      <Badge className="text-[10px]">
                        {t(
                          `aiCoach.insights.relatedTo.${insight.relatedTo.toLowerCase()}`,
                        )}
                      </Badge>
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
                          onClick={() =>
                            navigate(RELATED_TO_ROUTE[insight.relatedTo])
                          }
                        >
                          {insight.actionLabel}
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="cursor-pointer h-7 text-xs text-muted-foreground"
                        onClick={() => onDismiss(insight.id)}
                      >
                        {t("aiCoach.insights.dismiss")}
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
