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

// ─── Feedback ─────────────────────────────────────────────────────────────────

export const feedbackTypeEnum = pgEnum("feedback_type", [
  "bug",
  "feature",
  "general",
]);

export const feedbackStatusEnum = pgEnum("feedback_status", [
  "new",
  "triaged",
  "resolved",
  "wont_fix",
]);

export const feedback = pgTable(
  "feedback",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    type: feedbackTypeEnum("type").notNull(),
    message: text("message").notNull(),
    status: feedbackStatusEnum("status").notNull().default("new"),

    // Captured server-side (not trusted from the client body) for triage
    // context and lightweight abuse detection.
    path: text("path"),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (t) => [
    index("feedback_user_id_idx").on(t.userId),
    index("feedback_status_idx").on(t.status),
    index("feedback_created_at_idx").on(t.createdAt),
  ],
);

export const feedbackRelations = relations(feedback, ({ one }) => ({
  user: one(user, { fields: [feedback.userId], references: [user.id] }),
}));

export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;

// ─── Reminders (task/habit/goal) ──────────────────────────────────────────────
// These two tables already existed in the database, defined outside Drizzle's
// tracked schema. Added here verbatim to match what's live — do not change
// column defaults/constraints without a matching migration, since real data
// depends on this shape (user_notification_prefs currently has 1 row).

export const reminderTypeEnum = pgEnum("reminder_type", [
  "task_due",
  "goal_due",
  "habit_incomplete",
]);

// Per-user notification preferences. Note: timezone lives here (user-level),
// not on push_subscriptions — a user's reminder timing shouldn't depend on
// which device happened to send it.
export const userNotificationPrefs = pgTable("user_notification_prefs", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  timezone: text("timezone").notNull().default("UTC"),
  goalsReminderHour: integer("goals_reminder_hour").notNull().default(20),
  habitsReminderHour: integer("habits_reminder_hour").notNull().default(20),
  taskDefaultLeadMinutes: integer("task_default_lead_minutes")
    .notNull()
    .default(60),
  taskRemindersEnabled: boolean("task_reminders_enabled")
    .notNull()
    .default(true),
  habitRemindersEnabled: boolean("habit_reminders_enabled")
    .notNull()
    .default(true),
  goalRemindersEnabled: boolean("goal_reminders_enabled")
    .notNull()
    .default(true),
  weeklyDigestEnabled: boolean("weekly_digest_enabled")
    .notNull()
    .default(false),
});

// Dedup ledger — a (userId, type, entityId, bucketKey) row existing means
// that reminder has already been sent and should not be sent again. A cron
// can run as often as it wants; this is what makes repeated runs safe.
export const sentReminders = pgTable(
  "sent_reminders",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: reminderTypeEnum("type").notNull(),
    entityId: text("entity_id").notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
    bucketKey: text("bucket_key").notNull(),
  },
  (t) => [
    index("sent_reminders_user_id_idx").on(t.userId),
    uniqueIndex("sent_reminders_unique_idx").on(
      t.userId,
      t.type,
      t.entityId,
      t.bucketKey,
    ),
  ],
);

export const userNotificationPrefsRelations = relations(
  userNotificationPrefs,
  ({ one }) => ({
    user: one(user, {
      fields: [userNotificationPrefs.userId],
      references: [user.id],
    }),
  }),
);

export const sentRemindersRelations = relations(sentReminders, ({ one }) => ({
  user: one(user, {
    fields: [sentReminders.userId],
    references: [user.id],
  }),
}));

export type UserNotificationPrefs = typeof userNotificationPrefs.$inferSelect;
export type NewUserNotificationPrefs =
  typeof userNotificationPrefs.$inferInsert;
export type SentReminder = typeof sentReminders.$inferSelect;
export type NewSentReminder = typeof sentReminders.$inferInsert;

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
