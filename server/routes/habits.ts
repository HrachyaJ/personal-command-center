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

  const result = userHabits.map((habit) => ({
    ...habit,
    completedDates: completions
      .filter((c) => c.habitId === habit.id)
      .map((c) => c.completedDate),
  }));

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

  const dates = allCompletions
    .map((c) => c.completedDate)
    .sort()
    .reverse();

  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);

  for (const d of dates) {
    const day = new Date(d);
    day.setHours(0, 0, 0, 0);
    const diff = Math.round((current.getTime() - day.getTime()) / 86400000);
    if (diff === 0 || diff === 1) {
      streak++;
      current = day;
    } else {
      break;
    }
  }

  const newLongest = Math.max(streak, habit.longestStreak ?? 0);

  const [updated] = await db
    .update(habits)
    .set({ streak, longestStreak: newLongest })
    .where(eq(habits.id, req.params.id))
    .returning();

  res.json({ ...updated, completedDates: dates });
});

router.delete("/:id/complete", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { date } = req.body;
  if (!date) return res.status(400).json({ error: "Date is required" });

  await db
    .delete(habitCompletions)
    .where(
      and(
        eq(habitCompletions.habitId, req.params.id),
        eq(habitCompletions.completedDate, date),
      ),
    );

  res.status(204).send();
});

export default router;
