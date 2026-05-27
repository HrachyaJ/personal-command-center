import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { TabsContent } from "../../ui/tabs";
import { effortColors, impactColors } from "../../../lib/utils";
import { Button } from "../../ui/button";
import type { Recommendation } from "../../../types/ai-coach";
import { Badge } from "../../ui/badge";

const recommendations: Recommendation[] = [
  {
    id: "1",
    title: "Cap your daily task list at 5",
    description:
      "Your data shows you complete more when you plan less. Users who limit daily tasks to 5 have a 34% higher completion rate on average.",
    impact: "high",
    effort: "easy",
    category: "Tasks",
  },
  {
    id: "2",
    title: "Block 6–10 AM for deep work",
    description:
      "Your completion probability is nearly double during morning hours. Protecting this window with a recurring block could be your biggest productivity lever.",
    impact: "high",
    effort: "easy",
    category: "Schedule",
  },
  {
    id: "3",
    title: "Add a midweek goal check-in",
    description:
      "Users who review goal progress on Wednesdays are 2× more likely to stay on track. A 5-minute review each Wednesday could significantly improve your goal completion rate.",
    impact: "medium",
    effort: "easy",
    category: "Goals",
  },
  {
    id: "4",
    title: "Stack journaling after your morning run",
    description:
      "You already have a strong morning run habit. Adding journaling immediately after takes advantage of existing momentum and requires no extra willpower.",
    impact: "medium",
    effort: "moderate",
    category: "Habits",
  },
];

export default function AiCoachRecommendations() {
  return (
    <TabsContent value="recommendations" className="space-y-3 mt-4">
      {recommendations.map((rec) => (
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
                      Impact:
                    </span>
                    <Badge
                      className={`text-[10px] ${impactColors(rec.impact)}`}
                    >
                      {rec.impact}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      Effort:
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
                className="cursor-pointer shrink-0 gap-1 text-xs"
              >
                Try this
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </TabsContent>
  );
}
