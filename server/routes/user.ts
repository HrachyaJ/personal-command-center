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
import { fromNodeHeaders } from "better-auth/node";
import { createRemoteJWKSet, jwtVerify } from "jose";

const router = Router();

const JWKS = createRemoteJWKSet(
  new URL(
    `${process.env.BETTER_AUTH_URL ?? "http://localhost:3001"}/api/auth/jwks`,
  ),
);

async function getSession(req: Request) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.slice(7);
      const { payload } = await jwtVerify(token, JWKS);
      return {
        user: {
          id: payload.sub as string,
          email: payload.email as string,
          name: payload.name as string,
          image: (payload.image as string) ?? null,
        },
        session: null,
      };
    } catch (err) {
      console.error("JWT verification failed:", err);
      return null;
    }
  }
  return auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
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

router.post("/password", async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: "Both passwords are required" });

  try {
    await auth.api.changePassword({
      body: { currentPassword, newPassword, revokeOtherSessions: false },
      headers: fromNodeHeaders(req.headers),
    });
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: "Current password is incorrect" });
  }
});

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

  await db.transaction(async (tx) => {
    await tx.delete(tasks).where(eq(tasks.userId, userId));
    await tx.delete(sessionTable).where(eq(sessionTable.userId, userId));
    await tx.delete(accountTable).where(eq(accountTable.userId, userId));
    await tx.delete(userTable).where(eq(userTable.id, userId));
  });

  res.json({ ok: true });
});

export default router;
