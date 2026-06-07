import { Router, Request } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "../db.js";
import { auth } from "../auth.js";
import { habitCompletions, habits } from "../db/schema.js";

const router = Router();

function toHeaders(req: Request): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      value.forEach((v) => headers.append(key, v));
    } else if (value) {
      headers.set(key, value);
    }
  }
  return headers;
}

async function getSession(req: Request) {
  return auth.api.getSession({ headers: toHeaders(req) });
}

router.get("/", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const userHabits = await db
    .select()
    .from(habits)
    .where(eq(habits.userId, session.user.id))
    .orderBy(habits.createdAt);

  const completions = await db
    .select()
    .from(habitCompletions)
    .where(eq(habitCompletions.userId, session.user.id));

  const result = userHabits.map((habit) => {
    const completedDates = completions
      .filter((c) => c.habitId === habit.id)
      .map((c) => c.completedDate);

    const streak = calcStreak(completedDates);

    return {
      ...habit,
      streak,
      completedDates,
    };
  });

  res.json(result);
});

router.post("/", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { name, description, category, frequency, color } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Name is required" });

  const [habit] = await db
    .insert(habits)
    .values({
      userId: session.user.id,
      name: name.trim(),
      description: description?.trim() ?? null,
      category: category ?? "other",
      frequency: frequency ?? "daily",
      color: color ?? null,
    })
    .returning();

  res.status(201).json({ ...habit, completedDates: [] });
});

router.patch("/:id", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { name, description, category, frequency, color } = req.body;

  const [habit] = await db
    .update(habits)
    .set({
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(frequency !== undefined && { frequency }),
      ...(color !== undefined && { color }),
    })
    .where(
      and(eq(habits.id, req.params.id), eq(habits.userId, session.user.id)),
    )
    .returning();

  if (!habit) return res.status(404).json({ error: "Habit not found" });
  res.json(habit);
});

router.delete("/:id", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  await db
    .delete(habits)
    .where(
      and(eq(habits.id, req.params.id), eq(habits.userId, session.user.id)),
    );
  res.status(204).send();
});

/** Calculates current streak from a list of completion date strings (YYYY-MM-DD). */
function calcStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;

  const dates = [...completedDates].sort().reverse(); // most recent first

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mostRecent = new Date(dates[0] + "T00:00");
  mostRecent.setHours(0, 0, 0, 0);

  const diffFromToday = Math.round(
    (today.getTime() - mostRecent.getTime()) / 86400000,
  );

  // If the last completion was more than 1 day ago, streak is broken
  if (diffFromToday > 1) return 0;

  let streak = 0;
  let current = mostRecent;

  for (const d of dates) {
    const day = new Date(d + "T00:00");
    day.setHours(0, 0, 0, 0);
    const diff = Math.round((current.getTime() - day.getTime()) / 86400000);
    if (diff === 0 || diff === 1) {
      streak++;
      current = day;
    } else {
      break;
    }
  }

  return streak;
}

router.post("/:id/complete", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { date } = req.body;
  if (!date) return res.status(400).json({ error: "Date is required" });

  const [habit] = await db
    .select()
    .from(habits)
    .where(
      and(eq(habits.id, req.params.id), eq(habits.userId, session.user.id)),
    );

  if (!habit) return res.status(404).json({ error: "Habit not found" });

  const existing = await db
    .select()
    .from(habitCompletions)
    .where(
      and(
        eq(habitCompletions.habitId, req.params.id),
        eq(habitCompletions.completedDate, date),
      ),
    );

  if (existing.length > 0)
    return res.status(409).json({ error: "Already completed for this date" });

  await db.insert(habitCompletions).values({
    habitId: req.params.id,
    userId: session.user.id,
    completedDate: date,
  });

  const allCompletions = await db
    .select()
    .from(habitCompletions)
    .where(eq(habitCompletions.habitId, req.params.id));

  const dates = allCompletions.map((c) => c.completedDate);
  const streak = calcStreak(dates);
  const newLongest = Math.max(streak, habit.longestStreak ?? 0);

  const [updated] = await db
    .update(habits)
    .set({ streak, longestStreak: newLongest })
    .where(eq(habits.id, req.params.id))
    .returning();

  res.json({ ...updated, completedDates: dates.sort().reverse() });
});

router.delete("/:id/complete", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { date } = req.body;
  if (!date) return res.status(400).json({ error: "Date is required" });

  const [habit] = await db
    .select()
    .from(habits)
    .where(
      and(eq(habits.id, req.params.id), eq(habits.userId, session.user.id)),
    );

  if (!habit) return res.status(404).json({ error: "Habit not found" });

  await db
    .delete(habitCompletions)
    .where(
      and(
        eq(habitCompletions.habitId, req.params.id),
        eq(habitCompletions.completedDate, date),
      ),
    );

  const remaining = await db
    .select()
    .from(habitCompletions)
    .where(eq(habitCompletions.habitId, req.params.id));

  const dates = remaining.map((c) => c.completedDate);
  const streak = calcStreak(dates);

  const [updated] = await db
    .update(habits)
    .set({ streak })
    .where(eq(habits.id, req.params.id))
    .returning();

  res.json({ ...updated, completedDates: dates.sort().reverse() });
});

export default router;
