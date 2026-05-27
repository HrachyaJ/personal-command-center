export type InsightType = "tip" | "warning" | "achievement" | "pattern";
export type Priority = "high" | "medium" | "low";

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  priority: Priority;
  relatedTo: string;
  actionLabel?: string;
}

export interface ProductivityScore {
  overall: number;
  tasks: number;
  habits: number;
  goals: number;
  trend: "up" | "down" | "stable";
  trendValue: number;
}

export interface WeakSlot {
  label: string;
  completionRate: number;
}

export interface BestSlot {
  label: string;
  completionRate: number;
}

export interface PatternData {
  bestTimeOfDay: BestSlot[];
  weakDays: WeakSlot[];
  avgTasksPerDay: number;
  longestStreak: number;
  currentStreak: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "easy" | "moderate" | "hard";
  category: string;
}
