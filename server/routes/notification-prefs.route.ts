// server/routes/notification-prefs.route.ts
import { Router } from "express";
import { db } from "../db.js";
import { userNotificationPrefs } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { getSession } from "../auth-session.js";

const router = Router();

const DEFAULTS = {
  timezone: "UTC",
  goalsReminderHour: 20,
  habitsReminderHour: 20,
  taskDefaultLeadMinutes: 60,
  taskRemindersEnabled: true,
  habitRemindersEnabled: true,
  goalRemindersEnabled: true,
  weeklyDigestEnabled: false,
};

const ALLOWED_KEYS = Object.keys(DEFAULTS) as (keyof typeof DEFAULTS)[];

// GET /api/notifications/preferences
router.get("/", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const [existing] = await db
    .select()
    .from(userNotificationPrefs)
    .where(eq(userNotificationPrefs.userId, session.user.id));

  if (existing) return res.json(existing);

  // No row yet for this user — create one with defaults rather than making
  // the frontend special-case a missing-prefs state.
  const [created] = await db
    .insert(userNotificationPrefs)
    .values({ userId: session.user.id, ...DEFAULTS })
    .returning();

  return res.json(created);
});

// PATCH /api/notifications/preferences
router.patch("/", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const updates: Record<string, unknown> = {};
  for (const key of ALLOWED_KEYS) {
    if (key in req.body) updates[key] = req.body[key];
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  await db
    .insert(userNotificationPrefs)
    .values({ userId: session.user.id, ...DEFAULTS, ...updates })
    .onConflictDoUpdate({
      target: userNotificationPrefs.userId,
      set: updates,
    });

  const [updated] = await db
    .select()
    .from(userNotificationPrefs)
    .where(eq(userNotificationPrefs.userId, session.user.id));

  return res.json(updated);
});

export default router;
