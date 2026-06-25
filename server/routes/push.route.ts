// server/routes/push.route.ts
import { Router } from "express";
import crypto from "crypto";
import webpush from "web-push";
import { db } from "../db.js";
import { pushSubscriptions, tasks, habits, goals } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { getSession } from "../auth-session.js";

// Set once at module load — not inside a request handler — so it's
// guaranteed to be configured before any send, including cron-triggered
// sends on a fresh server instance.
webpush.setVapidDetails(
  process.env.VAPID_MAILTO!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

const router = Router();

function timingSafeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// POST /api/push/subscribe
router.post("/subscribe", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { endpoint, keys, expirationTime } = req.body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: "Invalid subscription object" });
  }

  const userId = session.user.id;

  try {
    // Upsert — if the endpoint already exists, refresh the keys instead of
    // silently keeping stale ones (browsers can reissue keys for the same
    // endpoint on resubscribe, which would otherwise break future sends).
    await db
      .insert(pushSubscriptions)
      .values({
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        expirationTime: expirationTime ? new Date(expirationTime) : null,
      })
      .onConflictDoUpdate({
        target: [pushSubscriptions.userId, pushSubscriptions.endpoint],
        set: {
          p256dh: keys.p256dh,
          auth: keys.auth,
          expirationTime: expirationTime ? new Date(expirationTime) : null,
        },
      });

    return res.json({ ok: true });
  } catch (e) {
    console.error("[push] subscribe error:", e);
    return res.status(500).json({ error: "Failed to save subscription" });
  }
});

// POST /api/push/unsubscribe
router.post("/unsubscribe", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { endpoint } = req.body;
  if (!endpoint) return res.status(400).json({ error: "Missing endpoint" });

  await db
    .delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.userId, session.user.id),
        eq(pushSubscriptions.endpoint, endpoint),
      ),
    );

  return res.json({ ok: true });
});

// Build a short, personalized briefing line from a user's live data.
async function buildBriefing(userId: string) {
  const [userTasks, userHabits, userGoals] = await Promise.all([
    db.select().from(tasks).where(eq(tasks.userId, userId)),
    db.select().from(habits).where(eq(habits.userId, userId)),
    db.select().from(goals).where(eq(goals.userId, userId)),
  ]);

  const dueToday = userTasks.filter((t) => !t.completed && t.dueDate).length;
  const activeStreaks = userHabits.filter((h) => (h.streak ?? 0) > 0).length;
  const inProgressGoals = userGoals.filter(
    (g) => g.status === "in_progress" || g.status === "active",
  ).length;

  const parts: string[] = [];
  if (dueToday > 0)
    parts.push(`${dueToday} task${dueToday === 1 ? "" : "s"} due`);
  if (activeStreaks > 0)
    parts.push(
      `${activeStreaks} habit streak${activeStreaks === 1 ? "" : "s"} to keep alive`,
    );
  if (inProgressGoals > 0)
    parts.push(
      `${inProgressGoals} goal${inProgressGoals === 1 ? "" : "s"} in progress`,
    );

  const body =
    parts.length > 0
      ? `You have ${parts.join(" and ")}. Check your AI Coach insights for today.`
      : "Check your habits, tasks, and AI Coach insights for today.";

  return {
    title: "FocusFlow — Morning Briefing ☀️",
    body,
    url: "/dashboard",
  };
}

// POST /api/push/send — internal use by cron job
// Protected by CRON_SECRET header
router.post("/send", async (req, res) => {
  const secret = req.headers["x-cron-secret"];
  if (
    typeof secret !== "string" ||
    !process.env.CRON_SECRET ||
    !timingSafeEqual(secret, process.env.CRON_SECRET)
  ) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const allSubs = await db.select().from(pushSubscriptions);

    const results = await Promise.allSettled(
      allSubs.map(async (sub) => {
        const briefing = await buildBriefing(sub.userId);
        const payload = JSON.stringify(briefing);

        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload,
          );
        } catch (err: any) {
          console.error(
            "❌ WEB-PUSH ERROR DETAILS:",
            err.statusCode,
            err.body || err.message,
          );
          // 410 Gone = subscription expired, clean it up
          if (err.statusCode === 410) {
            await db
              .delete(pushSubscriptions)
              .where(eq(pushSubscriptions.id, sub.id));
          }
          throw err;
        }
      }),
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return res.json({ ok: true, sent, failed });
  } catch (e) {
    console.error("[push] send error:", e);
    return res.status(500).json({ error: "Failed to send notifications" });
  }
});

export default router;
