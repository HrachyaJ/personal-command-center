// server/routes/feedback.route.ts
import { Router } from "express";
import { and, count, eq, gte } from "drizzle-orm";
import { db } from "../db.js";
import { feedback, feedbackTypeEnum } from "../db/schema.js";
import { getSession } from "../auth-session.js";

const router = Router();

const VALID_TYPES = feedbackTypeEnum.enumValues; // ["bug", "feature", "general"]
const MAX_MESSAGE_LENGTH = 2000;

// Simple abuse guard: block a user from submitting more than 5 pieces of
// feedback in a rolling 10-minute window. Not meant to replace real rate
// limiting (e.g. at the proxy/middleware level) — just stops accidental
// double-submits and obvious spam from a single account.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

// POST /api/feedback
router.post("/", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { type, message, context } = req.body ?? {};

  if (typeof type !== "string" || !VALID_TYPES.includes(type as any)) {
    return res.status(400).json({
      error: `Invalid feedback type. Must be one of: ${VALID_TYPES.join(", ")}`,
    });
  }

  if (typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Message is required" });
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer`,
    });
  }

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const [{ recentCount }] = await db
    .select({ recentCount: count() })
    .from(feedback)
    .where(
      and(
        eq(feedback.userId, session.user.id),
        gte(feedback.createdAt, windowStart),
      ),
    );

  if (recentCount >= RATE_LIMIT_MAX) {
    return res.status(429).json({
      error: "Too much feedback submitted recently. Please try again later.",
    });
  }

  // Path/userAgent are just diagnostic context, so client-supplied values are
  // fine to keep. IP is trust-relevant, so it's read from the request itself
  // rather than anything in the body. Requires `app.set("trust proxy", ...)`
  // to be configured correctly if this runs behind a load balancer/proxy.
  const [created] = await db
    .insert(feedback)
    .values({
      userId: session.user.id,
      type: type as (typeof VALID_TYPES)[number],
      message: trimmedMessage,
      path: typeof context?.path === "string" ? context.path : null,
      userAgent:
        typeof context?.userAgent === "string"
          ? context.userAgent
          : (req.headers["user-agent"] ?? null),
      ipAddress: req.ip ?? null,
    })
    .returning();

  return res.status(201).json(created);
});

// GET /api/feedback — the current user's own submission history.
// Not currently used by the settings UI, but cheap to include and avoids
// a follow-up migration if a "your past feedback" view gets added later.
router.get("/", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const rows = await db
    .select()
    .from(feedback)
    .where(eq(feedback.userId, session.user.id))
    .orderBy(feedback.createdAt);

  return res.json(rows);
});

export default router;
