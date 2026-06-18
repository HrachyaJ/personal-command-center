import { ChevronRight, Target } from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { TabsContent } from "../../ui/tabs";
import { effortColors, impactColors } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { useTranslation } from "../../../hooks/useTranslation";
import { useNavigate } from "react-router-dom";
import type { AiCoachRecommendation } from "../../../types/ai-coach.types";

const CATEGORY_TO_ROUTE: Record<AiCoachRecommendation["category"], string> = {
  Tasks: "/tasks",
  Habits: "/habits",
  Goals: "/goals",
  Schedule: "/tasks",
};

interface AiCoachRecommendationsProps {
  recommendations: AiCoachRecommendation[];
  isLoading: boolean;
  onApply: (id: string) => Promise<void>;
}

export default function AiCoachRecommendations({
  recommendations,
  isLoading,
  onApply,
}: AiCoachRecommendationsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <TabsContent value="recommendations" className="space-y-3 mt-4">
        {[1, 2].map((n) => (
          <Card key={n}>
            <CardContent className="p-5 h-24 animate-pulse bg-muted/20" />
          </Card>
        ))}
      </TabsContent>
    );
  }

  const activeRecs = recommendations.filter((r) => !r.isApplied);

  return (
    <TabsContent value="recommendations" className="space-y-3 mt-4">
      {activeRecs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              All caught up! No new recommendations right now.
            </p>
          </CardContent>
        </Card>
      ) : (
        activeRecs.map((rec) => (
          <Card key={rec.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-sm">{rec.title}</h3>
                    <Badge className="text-[10px]">{rec.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {rec.description}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">
                        Impact
                      </span>
                      <Badge
                        className={`text-[10px] ${impactColors(rec.impact)}`}
                      >
                        {rec.impact}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">
                        Effort
                      </span>
                      <Badge
                        className={`text-[10px] ${effortColors(rec.effort)}`}
                      >
                        {rec.effort}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await onApply(rec.id);
                    navigate(CATEGORY_TO_ROUTE[rec.category]);
                  }}
                  className="cursor-pointer shrink-0 gap-1 text-xs"
                >
                  {t("aiCoach.recommendations.tryThis")}
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </TabsContent>
  );
}
