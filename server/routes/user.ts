import { Router, Request } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db.js";
import {
  user as userTable,
  session as sessionTable,
  account as accountTable,
} from "../db/auth-schema.js";
import { tasks } from "../db/schema.js";
import { auth } from "../auth.js";

const router = Router();

async function getSession(req: Request) {
  return auth.api.getSession({
    headers: new Headers(req.headers as Record<string, string>),
  });
}

router.get("/", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const [currentUser] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, session.user.id));

  res.json(currentUser);
});

// PATCH /api/user/profile — update name and/or email
router.patch("/profile", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { name, email } = req.body;

  if (!name?.trim() && !email?.trim())
    return res.status(400).json({ error: "Nothing to update" });

  const [updated] = await db
    .update(userTable)
    .set({
      ...(name !== undefined && { name: name.trim() }),
      ...(email !== undefined && { email: email.trim() }),
    })
    .where(eq(userTable.id, session.user.id))
    .returning();

  res.json(updated);
});

// POST /api/user/password — change password via Better Auth
router.post("/password", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: "Both passwords are required" });

  try {
    await auth.api.changePassword({
      body: { currentPassword, newPassword, revokeOtherSessions: false },
      headers: req.headers as any,
    });
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: "Current password is incorrect" });
  }
});

// DELETE /api/user/account — permanently delete account and all data
router.delete("/account", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { password } = req.body as { password?: string };
  if (!password) return res.status(400).json({ error: "Password is required" });

  const [currentUser] = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      image: userTable.image,
    })
    .from(userTable)
    .where(eq(userTable.id, session.user.id));

  try {
    await auth.api.signInEmail({
      body: { email: currentUser.email, password },
    });
  } catch {
    return res.status(400).json({ error: "Invalid password" });
  }

  const userId = session.user.id;

  await db.delete(tasks).where(eq(tasks.userId, userId));
  // await db.delete(goals).where(eq(goals.userId, userId));
  // await db.delete(habits).where(eq(habits.userId, userId));

  await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
  await db.delete(accountTable).where(eq(accountTable.userId, userId));
  await db.delete(userTable).where(eq(userTable.id, userId));

  res.json({ ok: true });
});

export default router;
