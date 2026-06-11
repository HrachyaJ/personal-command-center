import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "../db.js";
import { tasks } from "../db/schema.js";
import { getSession } from "../auth-session.js";

const router = Router();

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

  const {
    title,
    dueDate,
    scheduledFor,
    priority,
    category,
    estimatedMinutes,
    isRecurring,
    recurrenceRule,
  } = req.body;

  if (!title?.trim())
    return res.status(400).json({ error: "Title is required" });

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
      ...(isRecurring !== undefined && { isRecurring }),
      ...(recurrenceRule !== undefined && { recurrenceRule }),
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
    isRecurring,
    recurrenceRule,
  } = req.body;

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
      ...(isRecurring !== undefined && { isRecurring }),
      ...(recurrenceRule !== undefined && { recurrenceRule }),
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
