import {
  pgTable,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { user } from "./auth-schema.js"; // Better Auth owns the user table

// ─── Tasks ────────────────────────────────────────────────────────────────────
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),

  dueDate: timestamp("due_date"),
  scheduledFor: timestamp("scheduled_for"),
  priority: text("priority"), // 'low' | 'medium' | 'high'
  category: text("category"),
  estimatedMinutes: integer("estimated_minutes"),
  completedAt: timestamp("completed_at"),
  isRecurring: boolean("is_recurring").default(false),
  recurrenceRule: text("recurrence_rule"),
});

// ─── Goals ────────────────────────────────────────────────────────────────────
export const goals = pgTable("goals", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  targetValue: integer("target_value").notNull(),
  currentValue: integer("current_value").default(0),
  unit: text("unit").notNull(),
  deadline: timestamp("deadline"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ─── Habits ───────────────────────────────────────────────────────────────────
export const habits = pgTable("habits", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull().default("other"),
  frequency: text("frequency").notNull().default("daily"),
  streak: integer("streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  color: text("color"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ─── Habit Completions ────────────────────────────────────────────────────────
export const habitCompletions = pgTable("habit_completions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  habitId: varchar("habit_id")
    .notNull()
    .references(() => habits.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  completedDate: text("completed_date").notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────
export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(user, { fields: [tasks.userId], references: [user.id] }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(user, { fields: [goals.userId], references: [user.id] }),
}));

export const habitsRelations = relations(habits, ({ one, many }) => ({
  user: one(user, { fields: [habits.userId], references: [user.id] }),
  completions: many(habitCompletions),
}));

export const habitCompletionsRelations = relations(
  habitCompletions,
  ({ one }) => ({
    habit: one(habits, {
      fields: [habitCompletions.habitId],
      references: [habits.id],
    }),
    user: one(user, {
      fields: [habitCompletions.userId],
      references: [user.id],
    }),
  }),
);

// ── Enums ────────────────────────────────────────────────────────────────────

export const insightTypeEnum = pgEnum("insight_type", [
  "tip",
  "warning",
  "achievement",
  "pattern",
]);

export const priorityEnum = pgEnum("priority", ["high", "medium", "low"]);

export const relatedToEnum = pgEnum("related_to", [
  "Tasks",
  "Habits",
  "Goals",
  "Schedule",
]);

export const impactEnum = pgEnum("impact", ["high", "medium", "low"]);

export const effortEnum = pgEnum("effort", ["easy", "moderate", "hard"]);

// NOTE: renamed from categoryEnum → coachCategoryEnum to avoid collision
// with any "category" column type you may add later
export const coachCategoryEnum = pgEnum("coach_category", [
  "Tasks",
  "Habits",
  "Goals",
  "Schedule",
]);

// ── Tables ───────────────────────────────────────────────────────────────────

export const aiCoachInsights = pgTable(
  "ai_coach_insights",
  {
    // varchar to match the id style used everywhere else in this schema
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    type: insightTypeEnum("type").notNull(),
    priority: priorityEnum("priority").notNull(),
    relatedTo: relatedToEnum("related_to").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    actionLabel: text("action_label"),

    isDismissed: boolean("is_dismissed").notNull().default(false),
    dismissedAt: timestamp("dismissed_at", { withTimezone: true }),

    generatedAt: timestamp("generated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    index("ai_coach_insights_user_id_idx").on(t.userId),
    index("ai_coach_insights_expires_at_idx").on(t.expiresAt),
  ],
);

export const aiCoachRecommendations = pgTable(
  "ai_coach_recommendations",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    category: coachCategoryEnum("category").notNull(),
    impact: impactEnum("impact").notNull(),
    effort: effortEnum("effort").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),

    isApplied: boolean("is_applied").notNull().default(false),
    appliedAt: timestamp("applied_at", { withTimezone: true }),

    generatedAt: timestamp("generated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    index("ai_coach_recommendations_user_id_idx").on(t.userId),
    index("ai_coach_recommendations_expires_at_idx").on(t.expiresAt),
  ],
);

// ── AI Coach Relations ────────────────────────────────────────────────────────

export const aiCoachInsightsRelations = relations(
  aiCoachInsights,
  ({ one }) => ({
    user: one(user, {
      fields: [aiCoachInsights.userId],
      references: [user.id],
    }),
  }),
);

export const aiCoachRecommendationsRelations = relations(
  aiCoachRecommendations,
  ({ one }) => ({
    user: one(user, {
      fields: [aiCoachRecommendations.userId],
      references: [user.id],
    }),
  }),
);

// ─── Push Subscriptions ───────────────────────────────────────────────────────
export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    expirationTime: timestamp("expiration_time", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("push_subscriptions_user_id_idx").on(t.userId), // plain index for lookups, not unique
    // Unique per user+endpoint so upsert works cleanly and a user can
    // still have multiple devices/browsers subscribed simultaneously.
    uniqueIndex("push_subscriptions_user_endpoint_idx").on(
      t.userId,
      t.endpoint,
    ),
  ],
);

export const pushSubscriptionsRelations = relations(
  pushSubscriptions,
  ({ one }) => ({
    user: one(user, {
      fields: [pushSubscriptions.userId],
      references: [user.id],
    }),
  }),
);

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert;

// ── Types ────────────────────────────────────────────────────────────────────

export type AiCoachInsight = typeof aiCoachInsights.$inferSelect;
export type NewAiCoachInsight = typeof aiCoachInsights.$inferInsert;
export type AiCoachRecommendation = typeof aiCoachRecommendations.$inferSelect;
export type NewAiCoachRecommendation =
  typeof aiCoachRecommendations.$inferInsert;

// ─── Types ────────────────────────────────────────────────────────────────────
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;

export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;

export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type NewHabitCompletion = typeof habitCompletions.$inferInsert;
