import { AlertCircle, BarChart3, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { TabsContent } from "../../ui/tabs";
import type { Task } from "../../../types/task.types";
import { useTranslation } from "../../../hooks/useTranslation";

interface AiCoachPatternsProps {
  tasks: Task[];
}

const TIME_BUCKETS = [
  { key: "6", label: "aiCoach.patterns.timeBucket.6to9", min: 6, max: 9 },
  { key: "9", label: "aiCoach.patterns.timeBucket.9to12", min: 9, max: 12 },
  { key: "12", label: "aiCoach.patterns.timeBucket.12to3", min: 12, max: 15 },
  { key: "15", label: "aiCoach.patterns.timeBucket.3to6", min: 15, max: 18 },
  { key: "18", label: "aiCoach.patterns.timeBucket.6to9", min: 18, max: 21 },
  { key: "21", label: "aiCoach.patterns.timeBucket.9pm", min: 21, max: 24 },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// JS getDay(): 0=Sun,1=Mon,...,6=Sat — remap to Mon-first
const JS_DAY_TO_INDEX: Record<number, number> = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
  0: 6,
};

export function computePatterns(tasks: Task[]) {
  const completedTasks = tasks.filter((t) => t.completedAt);

  // ── Time of day ──
  const bucketCounts: Record<string, { completed: number; total: number }> = {};
  TIME_BUCKETS.forEach((b) => {
    bucketCounts[b.key] = { completed: 0, total: 0 };
  });

  // Count all tasks created per bucket (total), completed per bucket
  tasks.forEach((t) => {
    const created = new Date(t.createdAt).getHours();
    const bucket = TIME_BUCKETS.find(
      (b) => created >= b.min && created < b.max,
    );
    if (bucket) bucketCounts[bucket.key].total++;
  });
  completedTasks.forEach((t) => {
    const hour = new Date(t.completedAt!).getHours();
    const bucket = TIME_BUCKETS.find((b) => hour >= b.min && hour < b.max);
    if (bucket) bucketCounts[bucket.key].completed++;
  });

  const bestTimeOfDay = TIME_BUCKETS.map((b) => {
    const { completed, total } = bucketCounts[b.key];
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { label: b.label, completionRate: rate };
  });

  // ── Day of week ──
  const dayCounts: { completed: number; total: number }[] = DAYS.map(() => ({
    completed: 0,
    total: 0,
  }));

  tasks.forEach((t) => {
    const idx = JS_DAY_TO_INDEX[new Date(t.createdAt).getDay()];
    dayCounts[idx].total++;
  });
  completedTasks.forEach((t) => {
    const idx = JS_DAY_TO_INDEX[new Date(t.completedAt!).getDay()];
    dayCounts[idx].completed++;
  });

  const dayRates = DAYS.map((label, i) => {
    const { completed, total } = dayCounts[i];
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { label, completionRate: rate };
  });

  const weakDays = [...dayRates]
    .filter((d) => d.completionRate > 0)
    .sort((a, b) => a.completionRate - b.completionRate)
    .slice(0, 3);

  return { bestTimeOfDay, dayRates, weakDays };
}

export default function AiCoachPatterns({ tasks }: AiCoachPatternsProps) {
  const { t } = useTranslation();
  const hasData = tasks.some((t) => t.completedAt);
  const { bestTimeOfDay, dayRates, weakDays } = computePatterns(tasks);

  return (
    <TabsContent value="patterns" className="space-y-4 mt-4">
      {/* Time of day */}
      <Card>
        <CardHeader className="pt-5">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            {t("aiCoach.patterns.timeOfDayTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pb-5">
          {!hasData ? (
            <p className="text-sm text-muted-foreground">
              {t("aiCoach.patterns.noPatternsMessage")}
            </p>
          ) : (
            bestTimeOfDay.map(({ label, completionRate }) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t(label)}</span>
                  <span
                    className={`font-medium ${
                      completionRate >= 80
                        ? "text-green-600"
                        : completionRate >= 55
                          ? "text-yellow-600"
                          : completionRate > 0
                            ? "text-red-500"
                            : "text-muted-foreground"
                    }`}
                  >
                    {completionRate > 0 ? `${completionRate}%` : "—"}
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
            ))
          )}
        </CardContent>
      </Card>

      {/* Weak days */}
      <Card>
        <CardHeader className="pt-5">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            {t("aiCoach.patterns.weakDaysTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-5">
          {!hasData || weakDays.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("aiCoach.patterns.noWeakDaysMessage")}
            </p>
          ) : (
            <>
              <div
                className={`grid gap-3 grid-cols-${Math.min(weakDays.length, 3)}`}
              >
                {weakDays.map(({ label, completionRate }) => (
                  <div
                    key={label}
                    className="rounded-xl border bg-muted/30 p-4 text-center space-y-1"
                  >
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-2xl font-bold text-red-500">
                      {completionRate}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("aiCoach.patterns.completionLabel")}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {t("aiCoach.patterns.weakDaysAdvice")}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Weekly heatmap */}
      <Card>
        <CardHeader className="pt-5">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            {t("aiCoach.patterns.weeklyOverviewTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          {!hasData ? (
            <p className="text-sm text-muted-foreground">
              {t("aiCoach.patterns.noWeeklyOverviewMessage")}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-1.5">
                {dayRates.map(({ label, completionRate }) => {
                  const opacity =
                    completionRate >= 75
                      ? "bg-primary"
                      : completionRate >= 55
                        ? "bg-primary/50"
                        : completionRate >= 35
                          ? "bg-primary/25"
                          : "bg-primary/10";
                  return (
                    <div key={label} className="text-center space-y-1.5">
                      <div
                        className={`h-10 rounded-md ${opacity} transition-all`}
                        title={t("aiCoach.patterns.heatmapTooltip", {
                          label: t(label),
                          rate: completionRate,
                        })}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        {t(`aiCoach.patterns.day.${label.toLowerCase()}`)}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-end gap-2 mt-3">
                <span className="text-[10px] text-muted-foreground">
                  {t("aiCoach.patterns.less")}
                </span>
                {[
                  "bg-primary/10",
                  "bg-primary/25",
                  "bg-primary/50",
                  "bg-primary",
                ].map((c) => (
                  <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
                ))}
                <span className="text-[10px] text-muted-foreground">
                  {t("aiCoach.patterns.more")}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
