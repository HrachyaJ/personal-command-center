// server/routes/reminders.route.ts
import { Router } from "express";
import { db } from "../db.js";
import {
  tasks,
  habits,
  goals,
  habitCompletions,
  userNotificationPrefs,
  sentReminders,
} from "../db/schema.js";
import { eq, and, isNotNull } from "drizzle-orm";
import {
  checkCronSecret,
  localHourAndDate,
  sendPushToUser,
} from "../lib/push-utils.js";

const router = Router();

type ReminderType = "task_due" | "goal_due" | "habit_incomplete";

// Attempts to record a reminder as sent. The unique index on
// (user_id, type, entity_id, bucket_key) means a second attempt at the same
// bucket throws — that's what makes running this cron as often as we want
// safe. Returns false (send nothing) if this bucket was already claimed.
async function claimReminder(
  userId: string,
  type: ReminderType,
  entityId: string,
  bucketKey: string,
): Promise<boolean> {
  try {
    await db
      .insert(sentReminders)
      .values({ userId, type, entityId, bucketKey });
    return true;
  } catch {
    // unique violation — already sent for this bucket, not a real error
    return false;
  }
}

// POST /api/reminders/send — internal use by cron.
// Intended to run frequently (every 5-10 minutes). Task reminders fire on a
// lead-time window before their due date, so they need finer granularity
// than once a day; habit/goal reminders are hour-precision but the dedup
// ledger makes repeated runs within that hour harmless.
router.post("/send", async (req, res) => {
  if (!checkCronSecret(req.headers["x-cron-secret"])) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const now = new Date();
  const stats = { taskDue: 0, habitIncomplete: 0, goalDue: 0, failedSends: 0 };

  try {
    const allPrefs = await db.select().from(userNotificationPrefs);
    const prefsByUser = new Map(allPrefs.map((p) => [p.userId, p]));

    // ── Task reminders: fire once per task, `taskDefaultLeadMinutes` before
    // its due date. bucketKey is the due date itself, so if a task's due
    // date changes, it's treated as a new reminder rather than suppressed.
    const openTasks = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.completed, false), isNotNull(tasks.dueDate)));

    for (const task of openTasks) {
      const prefs = prefsByUser.get(task.userId);
      if (!prefs || !prefs.taskRemindersEnabled) continue;

      const due = new Date(task.dueDate!);
      const windowStart = new Date(
        due.getTime() - prefs.taskDefaultLeadMinutes * 60_000,
      );
      if (now < windowStart || now >= due) continue;

      const claimed = await claimReminder(
        task.userId,
        "task_due",
        task.id,
        due.toISOString(),
      );
      if (!claimed) continue;

      const { failed } = await sendPushToUser(task.userId, {
        title: "Task due soon",
        body: `"${task.title}" is due soon.`,
        url: "/tasks",
      });
      stats.taskDue++;
      stats.failedSends += failed;
    }

    // ── Habit reminders: fire once per local day, at the user's configured
    // hour, only if today's completion is missing.
    const allHabits = await db.select().from(habits);
    for (const habit of allHabits) {
      const prefs = prefsByUser.get(habit.userId);
      if (!prefs || !prefs.habitRemindersEnabled) continue;

      const { hour, dateKey } = localHourAndDate(prefs.timezone, now);
      if (hour !== prefs.habitsReminderHour) continue;

      const [completedToday] = await db
        .select()
        .from(habitCompletions)
        .where(
          and(
            eq(habitCompletions.habitId, habit.id),
            eq(habitCompletions.completedDate, dateKey),
          ),
        );
      if (completedToday) continue;

      const claimed = await claimReminder(
        habit.userId,
        "habit_incomplete",
        habit.id,
        dateKey,
      );
      if (!claimed) continue;

      const { failed } = await sendPushToUser(habit.userId, {
        title: "Habit check-in",
        body: `Don't forget "${habit.name}" today.`,
        url: "/habits",
      });
      stats.habitIncomplete++;
      stats.failedSends += failed;
    }

    // ── Goal reminders: fire once per local day, at the user's configured
    // hour, for goals that are still active/in progress.
    const allGoals = await db.select().from(goals);
    for (const goal of allGoals) {
      if (goal.status !== "active" && goal.status !== "in_progress") continue;

      const prefs = prefsByUser.get(goal.userId);
      if (!prefs || !prefs.goalRemindersEnabled) continue;

      const { hour, dateKey } = localHourAndDate(prefs.timezone, now);
      if (hour !== prefs.goalsReminderHour) continue;

      const claimed = await claimReminder(
        goal.userId,
        "goal_due",
        goal.id,
        dateKey,
      );
      if (!claimed) continue;

      const { failed } = await sendPushToUser(goal.userId, {
        title: "Goal check-in",
        body: `Keep pushing on "${goal.title}".`,
        url: "/goals",
      });
      stats.goalDue++;
      stats.failedSends += failed;
    }

    return res.json({ ok: true, ...stats });
  } catch (e: any) {
    console.error("[reminders] send error:", e);
    return res
      .status(500)
      .json({ error: e.message ?? "Failed to send reminders" });
  }
});

export default router;
