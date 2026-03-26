import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { goals } from "../db/schema";
import { auth } from "../auth";

const router = Router();

async function getSession(req: any) {
  return auth.api.getSession({ headers: req.headers as any });
}

// GET /api/goals
router.get("/", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const userGoals = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, session.user.id))
    .orderBy(goals.createdAt);

  res.json(userGoals);
});

// POST /api/goals
router.post("/", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { title, description, targetValue, unit, deadline } = req.body;

  if (!title?.trim())
    return res.status(400).json({ error: "Title is required" });
  if (!targetValue)
    return res.status(400).json({ error: "Target value is required" });
  if (!unit?.trim()) return res.status(400).json({ error: "Unit is required" });

  const [goal] = await db
    .insert(goals)
    .values({
      userId: session.user.id,
      title: title.trim(),
      description: description?.trim() ?? null,
      targetValue,
      unit: unit.trim(),
      deadline: deadline ? new Date(deadline) : null,
    })
    .returning();

  res.status(201).json(goal);
});

// PATCH /api/goals/:id
router.patch("/:id", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const {
    title,
    description,
    targetValue,
    currentValue,
    unit,
    deadline,
    status,
  } = req.body;

  const [goal] = await db
    .update(goals)
    .set({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(targetValue !== undefined && { targetValue }),
      ...(currentValue !== undefined && { currentValue }),
      ...(unit !== undefined && { unit }),
      ...(deadline !== undefined && { deadline: new Date(deadline) }),
      ...(status !== undefined && { status }),
    })
    .where(and(eq(goals.id, req.params.id), eq(goals.userId, session.user.id)))
    .returning();

  if (!goal) return res.status(404).json({ error: "Goal not found" });
  res.json(goal);
});

// DELETE /api/goals/:id
router.delete("/:id", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  await db
    .delete(goals)
    .where(and(eq(goals.id, req.params.id), eq(goals.userId, session.user.id)));

  res.status(204).send();
});

export default router;
