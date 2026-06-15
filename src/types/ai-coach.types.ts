// ai-coach.types.ts

export type InsightType = "tip" | "warning" | "achievement" | "pattern";
export type Priority = "high" | "medium" | "low";

/**
 * Matches database inferred schema for aiCoachInsights
 */
export interface AiCoachInsight {
  id: string;
  userId: string;
  type: InsightType;
  title: string;
  description: string;
  priority: Priority;
  relatedTo: "Tasks" | "Habits" | "Goals" | "Schedule";
  actionLabel: string | null;
  isDismissed: boolean;
  dismissedAt: string | Date | null;
  expiresAt: string | Date;
  generatedAt: string | Date;
}

/**
 * Matches database inferred schema for aiCoachRecommendations
 */
export interface AiCoachRecommendation {
  id: string;
  userId: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "easy" | "moderate" | "hard";
  category: "Tasks" | "Habits" | "Goals" | "Schedule";
  isApplied: boolean;
  appliedAt: string | Date | null;
  expiresAt: string | Date;
  generatedAt: string | Date;
}

// ── Pattern / Stats Layout Types ─────────────────────────────────────────────

export interface WeakSlot {
  label: string; // e.g., "Mon", "Tue"
  completionRate: number;
}

export interface BestSlot {
  label: string; // e.g., "9to12"
  completionRate: number;
}

export interface PatternData {
  bestTimeOfDay: BestSlot[];
  weakDays: WeakSlot[];
  avgTasksPerDay: number;
  longestStreak: number;
  currentStreak: number;
}

export interface ProductivityScore {
  overall: number;
  tasks: number;
  habits: number;
  goals: number;
  trend: "up" | "down";
  trendValue: number;
}
