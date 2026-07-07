// server/routes/push.route.ts
import { Router } from "express";
import { db } from "../db.js";
import { pushSubscriptions } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { getSession } from "../auth-session.js";

const router = Router();

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

// GET /api/push/status
// Lets the frontend reconcile local pushManager state with what the server
// actually has on file — a local subscription can outlive the server-side
// row (e.g. after a dead-subscription cleanup), which otherwise shows as
// silently "on" with nothing actually being sent.
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

export default router;
