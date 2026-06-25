// api/cron/daily-push.ts
// Vercel serverless function — called by Vercel Cron at 8am UTC daily
// Deploy this file at the path: /api/cron/daily-push.ts in your project root

/// <reference types="node" />
import type { IncomingMessage, ServerResponse } from "http";

export default async function handler(
  req: IncomingMessage & { headers: Record<string, string> },
  res: ServerResponse & { status: (c: number) => any; json: (d: any) => any },
) {
  // Vercel cron jobs send this header automatically
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const backendUrl = process.env.BACKEND_URL; // e.g. https://your-app.onrender.com
    if (!backendUrl) throw new Error("BACKEND_URL env var not set");

    const response = await fetch(`${backendUrl}/api/push/send`, {
      method: "POST",
      headers: {
        "x-cron-secret": process.env.CRON_SECRET!,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log("[cron] daily-push result:", data);

    return res.json({ ok: true, ...data });
  } catch (e) {
    console.error("[cron] daily-push error:", e);
    return res.status(500).json({ error: "Cron job failed" });
  }
}
