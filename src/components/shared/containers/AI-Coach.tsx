import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Progress } from "../../ui/progress";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Target,
  Clock,
  Flame,
  ChevronRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Calendar,
  Zap,
  RefreshCw,
} from "lucide-react";

type InsightType = "tip" | "warning" | "achievement" | "pattern";
type Priority = "high" | "medium" | "low";

interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  priority: Priority;
  relatedTo: string;
  actionLabel?: string;
}

interface ProductivityScore {
  overall: number;
  tasks: number;
  habits: number;
  goals: number;
  trend: "up" | "down" | "stable";
  trendValue: number;
}

interface WeakSlot {
  label: string;
  completionRate: number;
}

interface BestSlot {
  label: string;
  completionRate: number;
}

interface PatternData {
  bestTimeOfDay: BestSlot[];
  weakDays: WeakSlot[];
  avgTasksPerDay: number;
  longestStreak: number;
  currentStreak: number;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "easy" | "moderate" | "hard";
  category: string;
}

// ─── Hardcoded Data ───────────────────────────────────────────────────────────

const productivityScore: ProductivityScore = {
  overall: 74,
  tasks: 81,
  habits: 63,
  goals: 78,
  trend: "up",
  trendValue: 6,
};

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

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function insightColors(type: InsightType) {
  switch (type) {
    case "tip":
      return {
        badge: "bg-blue-100 text-blue-800 border-blue-200",
        icon: "text-blue-600 bg-blue-50",
        border: "border-l-blue-400",
      };
    case "warning":
      return {
        badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: "text-yellow-600 bg-yellow-50",
        border: "border-l-yellow-400",
      };
    case "achievement":
      return {
        badge: "bg-green-100 text-green-800 border-green-200",
        icon: "text-green-600 bg-green-50",
        border: "border-l-green-400",
      };
    case "pattern":
      return {
        badge: "bg-purple-100 text-purple-800 border-purple-200",
        icon: "text-purple-600 bg-purple-50",
        border: "border-l-purple-400",
      };
  }
}

function priorityColors(priority: Priority) {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700 border-red-200";
    case "medium":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "low":
      return "bg-muted text-muted-foreground border-border";
  }
}

function impactColors(impact: "high" | "medium" | "low") {
  switch (impact) {
    case "high":
      return "bg-green-100 text-green-700 border-green-200";
    case "medium":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "low":
      return "bg-muted text-muted-foreground border-border";
  }
}

function effortColors(effort: "easy" | "moderate" | "hard") {
  switch (effort) {
    case "easy":
      return "bg-green-100 text-green-700 border-green-200";
    case "moderate":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "hard":
      return "bg-red-100 text-red-700 border-red-200";
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AICoach() {
  const [activeTab, setActiveTab] = useState<
    "insights" | "patterns" | "recommendations"
  >("insights");
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const visibleInsights = insights.filter(
    (i) => !dismissedInsights.includes(i.id),
  );

  const handleDismiss = (id: string) => {
    setDismissedInsights((prev) => [...prev, id]);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            AI Coach
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Personalized insights based on your activity
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="cursor-pointer gap-2"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Productivity Score Banner */}
      <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-primary/10 overflow-hidden relative">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Score circle */}
            <div className="shrink-0 flex items-center gap-5">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-primary/10"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - productivityScore.overall / 100)}`}
                    className="text-primary transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-primary leading-none">
                    {productivityScore.overall}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    / 100
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Productivity Score
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  {productivityScore.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${productivityScore.trend === "up" ? "text-green-600" : "text-red-500"}`}
                  >
                    {productivityScore.trend === "up" ? "+" : "-"}
                    {productivityScore.trendValue}% this week
                  </span>
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="flex-1 grid grid-cols-3 gap-4 sm:border-l sm:pl-6 border-primary/10">
              {[
                {
                  label: "Tasks",
                  value: productivityScore.tasks,
                  icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                },
                {
                  label: "Habits",
                  value: productivityScore.habits,
                  icon: <Flame className="w-3.5 h-3.5" />,
                },
                {
                  label: "Goals",
                  value: productivityScore.goals,
                  icon: <Target className="w-3.5 h-3.5" />,
                },
              ].map(({ label, value, icon }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                    {icon}
                    {label}
                  </div>
                  <div className="text-xl font-bold">{value}</div>
                  <Progress value={value} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>

          {/* Decorative sparkle */}
          <Sparkles className="absolute top-4 right-4 w-5 h-5 text-primary/20" />
        </CardContent>
      </Card>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Current Streak",
            value: `${patternData.currentStreak}d`,
            sub: "morning run",
            icon: <Flame className="w-4 h-4 text-orange-500" />,
            color: "text-orange-600",
          },
          {
            label: "Best Streak",
            value: `${patternData.longestStreak}d`,
            sub: "all time",
            icon: <Zap className="w-4 h-4 text-yellow-500" />,
            color: "text-yellow-600",
          },
          {
            label: "Avg Tasks / Day",
            value: patternData.avgTasksPerDay,
            sub: "last 30 days",
            icon: <BarChart3 className="w-4 h-4 bg-primary" />,
            color: "text-blue-600",
          },
          {
            label: "Peak Hours",
            value: "6–9 AM",
            sub: "91% completion",
            icon: <Clock className="w-4 h-4 text-green-500" />,
            color: "text-green-600",
          },
        ].map(({ label, value, sub, icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {label}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                </div>
                <div className="mt-0.5">{icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
      >
        <TabsList>
          <TabsTrigger value="insights" className="cursor-pointer gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            Insights ({visibleInsights.length})
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
                <Card
                  key={insight.id}
                  className={`border-l-4 ${colors.border}`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-0.5 p-2 rounded-lg shrink-0 ${colors.icon}`}
                      >
                        <InsightIcon type={insight.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h3 className="font-semibold text-sm">
                            {insight.title}
                          </h3>
                          <Badge className={`text-[10px] ${colors.badge}`}>
                            {insight.type}
                          </Badge>
                          <Badge
                            className={`text-[10px] ${priorityColors(insight.priority)}`}
                          >
                            {insight.priority} priority
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {insight.relatedTo}
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

        {/* ── Patterns ── */}
        <TabsContent value="patterns" className="space-y-4 mt-4">
          {/* Time of day */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Completion Rate by Time of Day
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Days That Need Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                Avoid scheduling critical tasks on these days, or reduce the
                number of tasks planned.
              </p>
            </CardContent>
          </Card>

          {/* Weekly heatmap placeholder */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Weekly Activity Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1.5">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day, i) => {
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
                        <p className="text-[10px] text-muted-foreground">
                          {day}
                        </p>
                      </div>
                    );
                  },
                )}
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

        {/* ── Recommendations ── */}
        <TabsContent value="recommendations" className="space-y-3 mt-4">
          {recommendations.map((rec) => (
            <Card key={rec.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-sm">{rec.title}</h3>
                      <Badge variant="outline" className="text-[10px]">
                        {rec.category}
                      </Badge>
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
      </Tabs>
    </div>
  );
}
