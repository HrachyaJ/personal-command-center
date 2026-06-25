// server/routes/push.route.ts
import { Router } from "express";
import webpush from "web-push";
import { db } from "../db.js";
import { pushSubscriptions } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { getSession } from "../auth-session.js";

const router = Router();

// POST /api/push/subscribe
router.post("/subscribe", async (req, res) => {
  console.log("VAPID CHECK:", {
    pub: process.env.VAPID_PUBLIC_KEY?.slice(0, 15),
    priv: process.env.VAPID_PRIVATE_KEY?.slice(0, 15),
    mail: process.env.VAPID_MAILTO,
  });

  webpush.setVapidDetails(
    process.env.VAPID_MAILTO!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );

  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { endpoint, keys, expirationTime } = req.body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: "Invalid subscription object" });
  }

  const userId = session.user.id;

  try {
    // Upsert — replace if endpoint already exists for this user
    await db
      .insert(pushSubscriptions)
      .values({
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        expirationTime: expirationTime ? new Date(expirationTime) : null,
      })
      .onConflictDoNothing();

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

// POST /api/push/send — internal use by cron job
// Protected by CRON_SECRET header
router.post("/send", async (req, res) => {
  const secret = req.headers["x-cron-secret"];
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const allSubs = await db.select().from(pushSubscriptions);

    const results = await Promise.allSettled(
      allSubs.map(async (sub) => {
        const payload = JSON.stringify({
          title: "FocusFlow — Morning Briefing ☀️",
          body: "Check your habits, tasks, and AI Coach insights for today.",
          url: "/dashboard",
        });

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
