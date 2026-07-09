import {
  AlertCircle,
  BarChart3,
  ChevronRight,
  CheckCircle2,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Skeleton } from "../../shared/Skeletons";
import { insightColors, priorityColors } from "../../../lib/utils";
import { useTranslation } from "../../../hooks/useTranslation";
import type {
  AiCoachInsight,
  InsightType,
} from "../../../types/ai-coach.types";

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };
const MAX_ITEMS = 3;

interface DashboardInsightsProps {
  insights: AiCoachInsight[];
  isLoading: boolean;
}

function InsightIcon({ type }: { type: InsightType }) {
  switch (type) {
    case "tip":
      return <Lightbulb className="w-3.5 h-3.5" />;
    case "warning":
      return <AlertCircle className="w-3.5 h-3.5" />;
    case "achievement":
      return <CheckCircle2 className="w-3.5 h-3.5" />;
    case "pattern":
      return <BarChart3 className="w-3.5 h-3.5" />;
  }
}

export default function DashboardInsights({
  insights,
  isLoading,
}: DashboardInsightsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const visible = insights.filter((i) => !i.isDismissed);
  const top = [...visible]
    .sort(
      (a, b) =>
        (PRIORITY_RANK[a.priority] ?? 3) - (PRIORITY_RANK[b.priority] ?? 3),
    )
    .slice(0, MAX_ITEMS);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-start gap-3">
            <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (top.length === 0) {
    return (
      <div className="text-center py-4">
        <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          {t("dashboard.aiInsights.empty")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {top.map((insight) => {
        const colors = insightColors(insight.type);
        return (
          <button
            key={insight.id}
            onClick={() => navigate("/ai-coach")}
            className="w-full text-left flex items-start gap-3 rounded-lg p-2 -mx-2 hover:bg-muted/60 transition-colors cursor-pointer"
          >
            <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${colors.icon}`}>
              <InsightIcon type={insight.type} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-foreground truncate">
                  {insight.title}
                </p>
                <Badge
                  className={`text-[9px] shrink-0 ${priorityColors(insight.priority)}`}
                >
                  {t(`aiCoach.insights.priority.${insight.priority}`)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                {insight.description}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
          </button>
        );
      })}

      <Button
        variant="ghost"
        size="sm"
        className="w-full text-xs text-muted-foreground cursor-pointer mt-1"
        onClick={() => navigate("/ai-coach")}
      >
        {t("dashboard.aiInsights.viewAll")}
        <ChevronRight className="w-3 h-3 ml-1" />
      </Button>
    </div>
  );
}
