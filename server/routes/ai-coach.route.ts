import { Router } from "express";
import { and, eq, gt } from "drizzle-orm";
import { db } from "../db.js";
import {
  aiCoachInsights,
  aiCoachRecommendations,
  type NewAiCoachInsight,
  type NewAiCoachRecommendation,
} from "../db/schema.js";
import { type Habit } from "../types/habit.types.js";
import { type Task } from "../types/task.types.js";
import { type Goal } from "../types/goal.types.js";
import { getSession } from "../auth-session.js";
import { buildBehaviorProfile } from "../services/behaviorProfile.js";
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

const ALLOWED_INSIGHT_TYPES = [
  "tip",
  "warning",
  "achievement",
  "pattern",
] as const;
const ALLOWED_INSIGHT_PRIORITIES = ["high", "medium", "low"] as const;
const ALLOWED_RELATED_TO = ["Tasks", "Habits", "Goals", "Schedule"] as const;
const ALLOWED_RECOMMENDATION_CATEGORIES = [
  "Tasks",
  "Habits",
  "Goals",
  "Schedule",
] as const;
const ALLOWED_IMPACTS = ["high", "medium", "low"] as const;
const ALLOWED_EFFORTS = ["easy", "moderate", "hard"] as const;

type ParsedInsight = Pick<
  NewAiCoachInsight,
  "type" | "priority" | "relatedTo" | "title" | "description" | "actionLabel"
>;

type ParsedRecommendation = Pick<
  NewAiCoachRecommendation,
  "category" | "impact" | "effort" | "title" | "description"
>;

function normalizeInsight(raw: Partial<ParsedInsight>): ParsedInsight {
  return {
    type: ALLOWED_INSIGHT_TYPES.includes(raw.type as any)
      ? (raw.type as ParsedInsight["type"])
      : "tip",
    priority: ALLOWED_INSIGHT_PRIORITIES.includes(raw.priority as any)
      ? (raw.priority as ParsedInsight["priority"])
      : "medium",
    relatedTo: ALLOWED_RELATED_TO.includes(raw.relatedTo as any)
      ? (raw.relatedTo as ParsedInsight["relatedTo"])
      : "Tasks",
    title: typeof raw.title === "string" ? raw.title : "AI coach insight",
    description:
      typeof raw.description === "string"
        ? raw.description
        : "Review this trend and consider what to improve.",
    actionLabel:
      raw.actionLabel === null || raw.actionLabel === undefined
        ? null
        : String(raw.actionLabel),
  };
}

function normalizeRecommendation(
  raw: Partial<ParsedRecommendation>,
): ParsedRecommendation {
  return {
    category: ALLOWED_RECOMMENDATION_CATEGORIES.includes(raw.category as any)
      ? (raw.category as ParsedRecommendation["category"])
      : "Tasks",
    impact: ALLOWED_IMPACTS.includes(raw.impact as any)
      ? (raw.impact as ParsedRecommendation["impact"])
      : "medium",
    effort: ALLOWED_EFFORTS.includes(raw.effort as any)
      ? (raw.effort as ParsedRecommendation["effort"])
      : "moderate",
    title:
      typeof raw.title === "string" ? raw.title : "AI coach recommendation",
    description:
      typeof raw.description === "string"
        ? raw.description
        : "Try this action to improve your routine.",
  };
}

// ── Context builder ───────────────────────────────────────────────────────────

function buildUserContext(
  habits: Habit[],
  tasks: Task[],
  goals: Goal[],
  profile: ReturnType<typeof buildBehaviorProfile>,
): string {
  const recentGoals =
    goals
      .slice(-5)
      .map(
        (goal) =>
          `- "${goal.title}" — ${goal.currentValue ?? 0}/${goal.targetValue} ${goal.unit}` +
          (goal.deadline
            ? `, due ${new Date(goal.deadline).toDateString()}`
            : ""),
      )
      .join("\n") || "- none";

  const recentHabits =
    habits
      .slice(-5)
      .map(
        (habit) =>
          `- "${habit.name}" [${habit.category}] — streak: ${habit.streak ?? 0}d, longest: ${habit.longestStreak ?? 0}d`,
      )
      .join("\n") || "- none";

  const recentTasks =
    tasks
      .slice(-5)
      .map(
        (task) =>
          `- "${task.title}" [${task.category}] (${task.priority}) — ${
            task.completedAt ? "completed" : "pending"
          }`,
      )
      .join("\n") || "- none";

  return `
BEHAVIOR PROFILE

Task completion rate:
${profile.taskCompletionRate}%

Avg tasks per day:
${profile.avgTasksPerDay}

Current streak:
${profile.currentStreak}

Longest streak:
${profile.longestStreak}

Habit consistency:
${profile.habitConsistency}%

Focus score:
${profile.focusScore}

Consistency score:
${profile.consistencyScore}

Strongest day:
${profile.strongestDay}

Weakest day:
${profile.weakestDay}

Strongest time block:
${profile.strongestTimeBlock}

Weakest time block:
${profile.weakestTimeBlock}

Overcommitment risk:
${profile.overcommitmentRisk}

Active goals:
${profile.activeGoals}

Goals with progress:
${profile.goalsWithProgress}

Momentum:
${profile.momentum}

Weekly trend:
${profile.weeklyTrend}

Neglected goals:
${
  profile.neglectedGoals
    .slice(0, 5)
    .map(
      (g) => `${g.goalTitle} (${g.daysWithoutProgress} days without progress)`,
    )
    .join(", ") || "none"
}

RECENT GOALS:
${recentGoals}

RECENT HABITS:
${recentHabits}

RECENT TASKS:
${recentTasks}
`.trim();
}

// ── Prompts ───────────────────────────────────────────────────────────────────

const INSIGHTS_SYSTEM = `
You are a behavioral analyst and productivity coach.

Your job is NOT to repeat statistics.
Your job is to identify patterns, trends, risks, opportunities, and behavioral observations.

Return ONLY valid JSON.

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

- Generate 3-5 high quality insights.
- Prefer fewer insights over generic insights.
- Never restate raw statistics that are already visible in the UI.
- Never say things like:
  - "You completed X tasks"
  - "Your streak is X days"
  - "You have Y goals"
  - "Your deadline is on Z date"
- Only mention numbers when comparing, predicting, or explaining behavior.

Generate insights in one of these categories:

1. Patterns
   Example:
   "Most of your completed work happens before noon."

2. Risks
   Example:
   "You are actively pursuing multiple goals but progress is concentrated in only one."

3. Trends
   Example:
   "Your consistency is improving week over week."

4. Opportunities
   Example:
   "Your strongest productivity window appears to be mornings."

5. Behavioral observations
   Example:
   "You tend to maintain learning habits more consistently than fitness habits."

Good insights reveal something the user may not notice themselves.

Bad insights repeat information already displayed elsewhere in the product.

If there is insufficient data to support an insight, do not invent one.
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
    ...normalizeInsight(i),
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
    ...normalizeRecommendation(r),
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

    const profile = buildBehaviorProfile(habits, tasks, goals);
    const context = buildUserContext(habits, tasks, goals, profile);

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
