import { Router } from "express";
import { and, eq, gt } from "drizzle-orm";
import { db } from "../db.js";
import {
  aiCoachInsights,
  aiCoachRecommendations,
  type NewAiCoachInsight,
  type NewAiCoachRecommendation,
  type Habit,
  type Task,
  type Goal,
} from "../db/schema.js";
import { getSession } from "../auth-session.js";
import Groq from "groq-sdk";

const router = Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

const TTL_HOURS = 24;

function expiresAt(): Date {
  const d = new Date();
  d.setHours(d.getHours() + TTL_HOURS);
  return d;
}

function safeParseJson<T>(raw: string, fallback: T): T {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  if (!cleaned) return fallback;

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error("[ai-coach] failed to parse model JSON:", cleaned);
    return fallback;
  }
}

// ── Context builder ───────────────────────────────────────────────────────────

function buildUserContext(
  habits: Habit[],
  tasks: Task[],
  goals: Goal[],
): string {
  const completedTasks = tasks.filter((t) => t.completedAt);
  const completionRate =
    tasks.length > 0
      ? Math.round((completedTasks.length / tasks.length) * 100)
      : 0;

  const activeGoals = goals.filter((g) => g.status !== "completed");

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayCounts: Record<string, { total: number; completed: number }> = {};
  tasks.forEach((t) => {
    const day = dayNames[new Date(t.createdAt!).getDay()];
    if (!dayCounts[day]) dayCounts[day] = { total: 0, completed: 0 };
    dayCounts[day].total++;
  });
  completedTasks.forEach((t) => {
    const day = dayNames[new Date(t.completedAt!).getDay()];
    if (!dayCounts[day]) dayCounts[day] = { total: 0, completed: 0 };
    dayCounts[day].completed++;
  });
  const dayBreakdown = Object.entries(dayCounts)
    .map(
      ([d, v]) =>
        `${d}: ${v.completed}/${v.total} (${v.total > 0 ? Math.round((v.completed / v.total) * 100) : 0}%)`,
    )
    .join(", ");

  const hourCounts: Record<number, { total: number; completed: number }> = {};
  completedTasks.forEach((t) => {
    const h = new Date(t.completedAt!).getHours();
    if (!hourCounts[h]) hourCounts[h] = { total: 0, completed: 0 };
    hourCounts[h].completed++;
  });
  const peakEntry = Object.entries(hourCounts).sort(
    (a, b) => b[1].completed - a[1].completed,
  )[0];
  const peakHour = peakEntry ? `${peakEntry[0]}:00` : "unknown";

  return `
User productivity data summary:

TASKS (${tasks.length} total, ${completedTasks.length} completed — ${completionRate}% rate):
- Day breakdown: ${dayBreakdown || "no data"}
- Peak completion hour: ${peakHour}

HABITS (${habits.length} active):
${habits.map((h) => `- "${h.name}" [${h.category}] — streak: ${h.streak ?? 0}d, longest: ${h.longestStreak ?? 0}d`).join("\n") || "- none"}

GOALS (${activeGoals.length} active):
${
  activeGoals
    .map(
      (g) =>
        `- "${g.title}" — ${g.currentValue ?? 0}/${g.targetValue} ${g.unit}` +
        (g.deadline ? `, due ${new Date(g.deadline).toDateString()}` : ""),
    )
    .join("\n") || "- none"
}
`.trim();
}

// ── Prompts ───────────────────────────────────────────────────────────────────

const INSIGHTS_SYSTEM = `
You are an expert productivity coach. Analyze the user's task, habit, and goal data and return a JSON object.
Return ONLY valid JSON — no markdown, no code fences, no explanation.

Schema:
{
  "insights": [
    {
      "type": "tip" | "warning" | "achievement" | "pattern",
      "priority": "high" | "medium" | "low",
      "relatedTo": "Tasks" | "Habits" | "Goals" | "Schedule",
      "title": string,
      "description": string,
      "actionLabel": string | null
    }
  ]
}

Rules:
- Generate 4-6 insights. Mix types.
- Be specific — reference actual numbers from the data.
- If data is sparse, generate fewer insights rather than vague ones.
`.trim();

const RECS_SYSTEM = `
You are an expert productivity coach. Return a JSON object with actionable recommendations.
Return ONLY valid JSON — no markdown, no code fences, no explanation.

Schema:
{
  "recommendations": [
    {
      "category": "Tasks" | "Habits" | "Goals" | "Schedule",
      "impact": "high" | "medium" | "low",
      "effort": "easy" | "moderate" | "hard",
      "title": string,
      "description": string
    }
  ]
}

Rules:
- Generate 3-5 recommendations.
- Prioritize high-impact, low-effort wins first.
- Base recommendations on actual patterns in the data.
`.trim();

// ── AI generation ─────────────────────────────────────────────────────────────

async function callGroq(
  systemPrompt: string,
  contextText: string,
): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: contextText },
    ],
    max_tokens: 1024,
    temperature: 0.7,
  });
  return completion.choices[0]?.message?.content ?? "";
}

async function generateInsights(
  contextText: string,
  userId: string,
): Promise<NewAiCoachInsight[]> {
  const raw = await callGroq(INSIGHTS_SYSTEM, contextText);
  const parsed = safeParseJson<{
    insights: Pick<
      NewAiCoachInsight,
      | "type"
      | "priority"
      | "relatedTo"
      | "title"
      | "description"
      | "actionLabel"
    >[];
  }>(raw, { insights: [] });

  const now = new Date();
  return (parsed.insights ?? []).map((i) => ({
    ...i,
    userId,
    isDismissed: false,
    generatedAt: now,
    expiresAt: expiresAt(),
  }));
}

async function generateRecommendations(
  contextText: string,
  userId: string,
): Promise<NewAiCoachRecommendation[]> {
  const raw = await callGroq(RECS_SYSTEM, contextText);
  const parsed = safeParseJson<{
    recommendations: Pick<
      NewAiCoachRecommendation,
      "category" | "impact" | "effort" | "title" | "description"
    >[];
  }>(raw, { recommendations: [] });

  const now = new Date();
  return (parsed.recommendations ?? []).map((r) => ({
    ...r,
    userId,
    isApplied: false,
    generatedAt: now,
    expiresAt: expiresAt(),
  }));
}

// ── Routes ────────────────────────────────────────────────────────────────────

router.post("/", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const {
    force = false,
    habits = [],
    tasks = [],
    goals = [],
  }: {
    force?: boolean;
    habits: Habit[];
    tasks: Task[];
    goals: Goal[];
  } = req.body;

  try {
    const now = new Date();
    const userId = session.user.id;

    // 1. Insufficiency check FIRST and unconditionally — `force` (refresh button)
    //    must never bypass this, since generating from sparse data wastes the
    //    Groq call and produces low-quality, generic output.
    const hasEnoughData =
      tasks.length >= 3 || habits.length >= 1 || goals.length >= 1;

    if (!hasEnoughData) {
      return res.json({
        insights: [],
        recommendations: [],
        insufficient: true,
      });
    }

    // 2. Look for existing valid cache before calling the LLM
    if (!force) {
      const [cachedInsights, cachedRecs] = await Promise.all([
        db
          .select()
          .from(aiCoachInsights)
          .where(
            and(
              eq(aiCoachInsights.userId, userId),
              eq(aiCoachInsights.isDismissed, false),
              gt(aiCoachInsights.expiresAt, now),
            ),
          ),
        db
          .select()
          .from(aiCoachRecommendations)
          .where(
            and(
              eq(aiCoachRecommendations.userId, userId),
              gt(aiCoachRecommendations.expiresAt, now),
            ),
          ),
      ]);

      // ✅ FIX: If we have ANY unexpired insights or recommendations saved, return them!
      if (cachedInsights.length > 0 || cachedRecs.length > 0) {
        return res.json({
          insights: cachedInsights,
          recommendations: cachedRecs,
        });
      }
    }

    // 3. Clear old records and run the LLM generation step...
    await Promise.all([
      db.delete(aiCoachInsights).where(eq(aiCoachInsights.userId, userId)),
      db
        .delete(aiCoachRecommendations)
        .where(eq(aiCoachRecommendations.userId, userId)),
    ]);

    const context = buildUserContext(habits, tasks, goals);

    // Run sequentially to avoid hitting Groq's free tier rate limit
    const newInsights = await generateInsights(context, userId);
    const newRecs = await generateRecommendations(context, userId);

    const [insertedInsights, insertedRecs] = await Promise.all([
      newInsights.length > 0
        ? db.insert(aiCoachInsights).values(newInsights).returning()
        : Promise.resolve([]),
      newRecs.length > 0
        ? db.insert(aiCoachRecommendations).values(newRecs).returning()
        : Promise.resolve([]),
    ]);

    return res.json({
      insights: insertedInsights,
      recommendations: insertedRecs,
    });
  } catch (e) {
    console.error("[ai-coach] generation error:", e);
    return res.status(500).json({ error: "Failed to generate coach data" });
  }
});

router.patch("/insights/:id/dismiss", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const [updated] = await db
    .update(aiCoachInsights)
    .set({ isDismissed: true, dismissedAt: new Date() })
    .where(
      and(
        eq(aiCoachInsights.id, req.params.id),
        eq(aiCoachInsights.userId, session.user.id),
      ),
    )
    .returning();

  if (!updated) return res.status(404).json({ error: "Insight not found" });
  return res.json(updated);
});

router.patch("/recommendations/:id/apply", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const [updated] = await db
    .update(aiCoachRecommendations)
    .set({ isApplied: true, appliedAt: new Date() })
    .where(
      and(
        eq(aiCoachRecommendations.id, req.params.id),
        eq(aiCoachRecommendations.userId, session.user.id),
      ),
    )
    .returning();

  if (!updated)
    return res.status(404).json({ error: "Recommendation not found" });
  return res.json(updated);
});

export default router;
