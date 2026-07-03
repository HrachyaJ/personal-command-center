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

  const { endpoint, keys, expirationTime, timezone } = req.body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: "Invalid subscription object" });
  }

  // Best-effort validation of the IANA timezone string the client sent.
  // Falls back to UTC rather than rejecting the subscribe request outright.
  let tz = "UTC";
  if (typeof timezone === "string") {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      tz = timezone;
    } catch {
      // invalid timezone string — keep UTC fallback
    }
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
        timezone: tz,
      })
      .onConflictDoUpdate({
        target: [pushSubscriptions.userId, pushSubscriptions.endpoint],
        set: {
          p256dh: keys.p256dh,
          auth: keys.auth,
          expirationTime: expirationTime ? new Date(expirationTime) : null,
          timezone: tz,
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

// GET /api/push/status
// Lets the frontend reconcile local pushManager state with what the server
// actually has on file — a local subscription can outlive the server-side
// row (e.g. after a 410 cleanup), which otherwise shows as silently "on"
// with nothing actually being sent.
router.get("/status", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const subs = await db
    .select({ endpoint: pushSubscriptions.endpoint })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, session.user.id));

  return res.json({
    subscribed: subs.length > 0,
    endpoints: subs.map((s) => s.endpoint),
  });
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
    title: "Morning Briefing ☀️",
    body,
    url: "/dashboard",
  };
}

// Push-service errors that mean "this subscription is dead, stop trying."
// 410 (Gone) is the standard signal; some services (older Safari/Apple
// endpoints in particular) return 404 instead for the same condition.
const SUBSCRIPTION_GONE_CODES = new Set([404, 410]);

// Returns the current hour (0-23) and date string in the given IANA
// timezone, used to decide whether "now" is this subscription's morning.
function localHourAndDate(tz: string, now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const hour = parseInt(get("hour"), 10) % 24; // "24" at midnight in en-US -> normalize
  const dateKey = `${get("year")}-${get("month")}-${get("day")}`;
  return { hour, dateKey };
}

// POST /api/push/send — internal use by cron job.
// Intended to be triggered HOURLY, not once daily — each subscription only
// receives a briefing when it's currently within its own preferredHour in
// its own timezone. Protected by CRON_SECRET header.
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
    const now = new Date();
    const allSubs = await db.select().from(pushSubscriptions);

    // Only subscriptions whose local time is currently within their
    // preferred hour, and that haven't already been sent today (local date).
    const dueSubs = allSubs.filter((sub) => {
      const { hour, dateKey } = localHourAndDate(sub.timezone, now);
      if (hour !== sub.preferredHour) return false;

      if (sub.lastBriefingSentAt) {
        const { dateKey: lastSentDateKey } = localHourAndDate(
          sub.timezone,
          sub.lastBriefingSentAt,
        );
        if (lastSentDateKey === dateKey) return false; // already sent today
      }
      return true;
    });

    // Build each user's briefing once, not once per device/subscription.
    const uniqueUserIds = [...new Set(dueSubs.map((s) => s.userId))];
    const briefingEntries = await Promise.all(
      uniqueUserIds.map(
        async (userId) => [userId, await buildBriefing(userId)] as const,
      ),
    );
    const briefingByUser = new Map(briefingEntries);

    const results = await Promise.allSettled(
      dueSubs.map(async (sub) => {
        const subData = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        const briefing = { ...briefingByUser.get(sub.userId)! };

        // Detect Apple Web Push subscriptions
        const isIOS = sub.endpoint.includes("web.push.apple.com");

        briefing.title = isIOS
          ? "Morning Briefing ☀️"
          : "FocusFlow - Morning Briefing ☀️";

        console.log(
          `[push] endpoint=${sub.endpoint.slice(0, 60)}... ios=${isIOS}`,
        );

        const payload = JSON.stringify(briefing);

        try {
          await webpush.sendNotification(subData, payload);
          await db
            .update(pushSubscriptions)
            .set({ lastBriefingSentAt: new Date() })
            .where(eq(pushSubscriptions.id, sub.id));
        } catch (err: any) {
          console.error(
            "❌ WEB-PUSH ERROR DETAILS:",
            err.statusCode,
            err.body || err.message,
          );

          if (SUBSCRIPTION_GONE_CODES.has(err.statusCode)) {
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

    return res.json({
      ok: true,
      evaluated: allSubs.length,
      due: dueSubs.length,
      sent,
      failed,
    });
  } catch (e) {
    console.error("[push] send error:", e);
    return res.status(500).json({ error: "Failed to send notifications" });
  }
});

export default router;
