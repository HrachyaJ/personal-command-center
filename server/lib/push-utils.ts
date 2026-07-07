// server/lib/push-utils.ts
import crypto from "crypto";
import webpush from "web-push";
import { db } from "../db.js";
import { pushSubscriptions } from "../db/schema.js";
import { eq } from "drizzle-orm";

// Set once at module load — not inside a request handler — so it's
// guaranteed to be configured before any send, including cron-triggered
// sends on a fresh server instance.
webpush.setVapidDetails(
  process.env.VAPID_MAILTO!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

function timingSafeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function checkCronSecret(headerValue: unknown): boolean {
  return (
    typeof headerValue === "string" &&
    !!process.env.CRON_SECRET &&
    timingSafeEqual(headerValue, process.env.CRON_SECRET)
  );
}

// Push-service errors that mean "this subscription is dead, stop trying."
// 410 (Gone) is the standard signal; some services (older Safari/Apple
// endpoints in particular) return 404 instead for the same condition.
const SUBSCRIPTION_GONE_CODES = new Set([404, 410]);

// Sends one payload to every device a user is subscribed on. Cleans up
// dead subscriptions as it goes. Returns counts, never throws.
export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string },
): Promise<{ sent: number; failed: number }> {
  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));

  let sent = 0;
  let failed = 0;

  await Promise.allSettled(
    subs.map(async (sub) => {
      const subData = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };
      try {
        await webpush.sendNotification(subData, JSON.stringify(payload));
        sent++;
      } catch (err: any) {
        failed++;
        console.error(
          "[push] send error:",
          err.statusCode,
          err.body || err.message,
        );
        if (SUBSCRIPTION_GONE_CODES.has(err.statusCode)) {
          await db
            .delete(pushSubscriptions)
            .where(eq(pushSubscriptions.id, sub.id));
        }
      }
    }),
  );

  return { sent, failed };
}

// Returns the current local hour (0-23) and a YYYY-MM-DD date key for the
// given IANA timezone. The date key format matches habitCompletions'
// completedDate column so they can be compared directly.
export function localHourAndDate(tz: string, now: Date) {
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
