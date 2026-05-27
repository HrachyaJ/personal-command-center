import { AlertCircle, BarChart3, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { TabsContent } from "../../ui/tabs";
import type { PatternData } from "../../../types/ai-coach";

const patternData: PatternData = {
  bestTimeOfDay: [
    { label: "6-9 AM", completionRate: 91 },
    { label: "9-12 PM", completionRate: 84 },
    { label: "12-3 PM", completionRate: 61 },
    { label: "3-6 PM", completionRate: 44 },
    { label: "6-9 PM", completionRate: 38 },
    { label: "9 PM+", completionRate: 22 },
  ],
  weakDays: [
    { label: "Sun", completionRate: 23 },
    { label: "Sat", completionRate: 41 },
    { label: "Fri", completionRate: 55 },
  ],
  avgTasksPerDay: 6.3,
  longestStreak: 14,
  currentStreak: 14,
};

export default function AiCoachPatterns() {
  return (
    <TabsContent value="patterns" className="space-y-4 mt-4">
      {/* Time of day */}
      <Card>
        <CardHeader className="pt-5">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Completion Rate by Time of Day
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pb-5">
          {patternData.bestTimeOfDay.map(({ label, completionRate }) => (
            <div key={label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span
                  className={`font-medium ${
                    completionRate >= 80
                      ? "text-green-600"
                      : completionRate >= 55
                        ? "text-yellow-600"
                        : "text-red-500"
                  }`}
                >
                  {completionRate}%
                </span>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    completionRate >= 80
                      ? "bg-green-500"
                      : completionRate >= 55
                        ? "bg-yellow-400"
                        : "bg-red-400"
                  }`}
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Weak days */}
      <Card>
        <CardHeader className="pt-5">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Days That Need Attention
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-5">
          <div className="grid grid-cols-3 gap-3">
            {patternData.weakDays.map(({ label, completionRate }) => (
              <div
                key={label}
                className="rounded-xl border bg-muted/30 p-4 text-center space-y-1"
              >
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-2xl font-bold text-red-500">
                  {completionRate}%
                </p>
                <p className="text-xs text-muted-foreground">completion</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Avoid scheduling critical tasks on these days, or reduce the number
            of tasks planned.
          </p>
        </CardContent>
      </Card>

      {/* Weekly heatmap placeholder */}
      <Card>
        <CardHeader className="pt-5">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Weekly Activity Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-7 gap-1.5">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
              const rates = [82, 79, 75, 71, 55, 41, 23];
              const rate = rates[i];
              const opacity =
                rate >= 75
                  ? "bg-primary"
                  : rate >= 55
                    ? "bg-primary/50"
                    : rate >= 35
                      ? "bg-primary/25"
                      : "bg-primary/10";
              return (
                <div key={day} className="text-center space-y-1.5">
                  <div
                    className={`h-10 rounded-md ${opacity} transition-all`}
                    title={`${day}: ${rate}% completion`}
                  />
                  <p className="text-[10px] text-muted-foreground">{day}</p>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-2 mt-3">
            <span className="text-[10px] text-muted-foreground">Less</span>
            {[
              "bg-primary/10",
              "bg-primary/25",
              "bg-primary/50",
              "bg-primary",
            ].map((c) => (
              <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
            ))}
            <span className="text-[10px] text-muted-foreground">More</span>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
