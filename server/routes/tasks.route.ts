import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "../db.js";
import { tasks } from "../db/schema.js";
import { getSession } from "../auth-session.js";

const router = Router();

const VALID_PRIORITIES = new Set(["low", "medium", "high"]);
const VALID_CATEGORIES = new Set([
  "work",
  "health",
  "personal",
  "learning",
  "finance",
  "other",
]);

router.get("/", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const userTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, session.user.id))
    .orderBy(tasks.createdAt);

  res.json(userTasks);
});

router.post("/", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { title, dueDate, scheduledFor, priority, category, estimatedMinutes } =
    req.body;

  if (!title?.trim())
    return res.status(400).json({ error: "Title is required" });
  if (priority !== undefined && !VALID_PRIORITIES.has(priority))
    return res.status(400).json({ error: "Invalid priority" });
  if (category !== undefined && !VALID_CATEGORIES.has(category))
    return res.status(400).json({ error: "Invalid category" });

  const [task] = await db
    .insert(tasks)
    .values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      title: title.trim(),
      ...(dueDate !== undefined && {
        dueDate: dueDate ? new Date(dueDate) : null,
      }),
      ...(scheduledFor !== undefined && {
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      }),
      ...(priority !== undefined && { priority }),
      ...(category !== undefined && { category }),
      ...(estimatedMinutes !== undefined && { estimatedMinutes }),
    })
    .returning();

  res.status(201).json(task);
});

router.patch("/:id", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const {
    title,
    completed,
    completedAt,
    dueDate,
    scheduledFor,
    priority,
    category,
    estimatedMinutes,
  } = req.body;

  if (priority !== undefined && !VALID_PRIORITIES.has(priority))
    return res.status(400).json({ error: "Invalid priority" });
  if (category !== undefined && !VALID_CATEGORIES.has(category))
    return res.status(400).json({ error: "Invalid category" });

  const [task] = await db
    .update(tasks)
    .set({
      ...(title !== undefined && { title }),
      ...(completed !== undefined && { completed }),
      ...(completedAt !== undefined && {
        completedAt: completedAt ? new Date(completedAt) : null,
      }),
      ...(dueDate !== undefined && {
        dueDate: dueDate ? new Date(dueDate) : null,
      }),
      ...(scheduledFor !== undefined && {
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      }),
      ...(priority !== undefined && { priority }),
      ...(category !== undefined && { category }),
      ...(estimatedMinutes !== undefined && { estimatedMinutes }),
    })
    .where(and(eq(tasks.id, req.params.id), eq(tasks.userId, session.user.id)))
    .returning();

  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
});

router.delete("/:id", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  await db
    .delete(tasks)
    .where(and(eq(tasks.id, req.params.id), eq(tasks.userId, session.user.id)));
  res.status(204).send();
});

export default router;
