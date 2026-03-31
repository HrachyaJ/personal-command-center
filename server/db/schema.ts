import {
  pgTable,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { user } from "./auth-schema.js"; // Better Auth owns the user table

// ─── Tasks ────────────────────────────────────────────────────────────────────
export const tasks = pgTable("tasks", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
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

// ─── Types ────────────────────────────────────────────────────────────────────
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;

export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;

export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type NewHabitCompletion = typeof habitCompletions.$inferInsert;
