import { Router, Request } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db.js";
import { user as userTable } from "../db/auth-schema.js"; // adjust to your actual users table name
import { auth } from "../auth.js";

const router = Router();

async function getSession(req: Request) {
  return auth.api.getSession({ headers: req.headers as any });
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

export default router;
