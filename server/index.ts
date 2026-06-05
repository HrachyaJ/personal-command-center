import express from "express";
import cors from "cors";
import multer from "multer";
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth.js";
import taskRoutes from "./routes/tasks.js";
import goalRoutes from "./routes/goals.js";
import habitRoutes from "./routes/habits.js";
import userRouter from "./routes/user.js";
import { db } from "./db.js";
import { goals, habits, tasks } from "./db/schema.js";
import { user as userTable } from "./db/auth-schema.js";
import { eq } from "drizzle-orm";
import { exec } from "child_process";
import { v2 as cloudinary } from "cloudinary";
import { session as sessionTable } from "./db/auth-schema.js";
import streamifier from "streamifier";
import PDFDocument from "pdfkit";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: ["http://localhost:5173", "https://focus-flow-site.vercel.app"],
    credentials: true,
    exposedHeaders: ["set-cookie", "Authorization"],
  }),
);

app.all("/api/auth/*path", toNodeHandler(auth));
app.use(express.json());

app.use("/api/tasks", taskRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/user", userRouter);

app.get("/api/auth/jwt-redirect", async (req: any, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.redirect("https://focus-flow-site.vercel.app/sign-in");
    }

    // Get JWT token server-side where cookie works fine
    const tokenResponse = await auth.api.getToken({
      headers: fromNodeHeaders(req.headers),
    });

    const token = (tokenResponse as any)?.token;
    const redirectBase =
      "https://focus-flow-site.vercel.app/auth/callback/google";

    if (token) {
      res.redirect(`${redirectBase}?token=${token}`);
    } else {
      res.redirect("https://focus-flow-site.vercel.app/sign-in");
    }
  } catch (err) {
    console.error("[jwt-redirect]", err);
    res.redirect("https://focus-flow-site.vercel.app/sign-in");
  }
});

// ── Shared helper: converts Express headers → Headers instance ────────────────

// ── Avatar upload ──────────────────────────────────────────────────────────────
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

function uploadToCloudinary(buffer: Buffer, publicId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "avatars",
        public_id: publicId,
        overwrite: true,
        transformation: [
          { width: 256, height: 256, crop: "fill", gravity: "face" },
          { fetch_format: "auto", quality: "auto" },
        ],
      },
      (error, result) => {
        if (error || !result)
          return reject(error ?? new Error("Upload failed"));
        resolve(result.secure_url);
      },
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

app.post(
  "/api/user/avatar",
  avatarUpload.single("avatar"),
  async (req: any, res) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      if (!session?.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const imageUrl = await uploadToCloudinary(
        req.file.buffer,
        session.user.id,
      );

      await db
        .update(userTable)
        .set({ image: imageUrl, updatedAt: new Date() })
        .where(eq(userTable.id, session.user.id));

      res.json({ image: imageUrl });
    } catch (err: any) {
      res.status(500).json({ error: err.message ?? "Upload failed" });
    }
  },
);

app.delete("/api/user/avatar", async (req: any, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session?.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    await cloudinary.uploader.destroy(`avatars/${session.user.id}`);

    await db
      .update(userTable)
      .set({ image: null, updatedAt: new Date() })
      .where(eq(userTable.id, session.user.id));

    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to remove avatar" });
  }
});

// ── Misc routes ────────────────────────────────────────────────────────────────

// ── Internal ML data endpoint — called by Python scripts only, not the browser
// Bound to localhost in production so it's never exposed publicly
app.get("/api/ml-data-internal", async (req, res) => {
  const userId = req.query.userId as string | undefined;
  if (!userId) {
    res.status(400).json({ error: "userId required" });
    return;
  }
  try {
    const userTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId));

    const formatted = userTasks
      .filter((t) => t.completedAt !== null)
      .map((t) => ({
        hour: new Date(t.completedAt!).getHours(),
        day: new Date(t.completedAt!).getDay(),
        priority: t.priority ?? "low",
        category: t.category ?? "other",
        estimated_minutes: t.estimatedMinutes ?? 0,
        has_due_date: t.dueDate ? 1 : 0,
        is_recurring: t.isRecurring ? 1 : 0,
        completed: t.completed ? 1 : 0,
      }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/api/ml-data", async (req: any, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session?.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const userId = session.user.id;
    const userTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId));

    const formatted = userTasks
      // Only include completed tasks for pattern analysis — we want to know
      // *when completions happen*, not when tasks were created
      .filter((t) => t.completedAt !== null)
      .map((t) => ({
        hour: new Date(t.completedAt!).getHours(),
        day: new Date(t.completedAt!).getDay(),
        priority: t.priority ?? "low",
        category: t.category ?? "other",
        estimated_minutes: t.estimatedMinutes ?? 0,
        has_due_date: t.dueDate ? 1 : 0,
        is_recurring: t.isRecurring ? 1 : 0,
        completed: t.completed ? 1 : 0,
      }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to fetch ML data" });
  }
});

app.get("/api/predict", async (req: any, res) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://focus-flow-site.vercel.app",
  );
  res.header("Access-Control-Allow-Credentials", "true");

  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session?.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const hour = req.query.hour ?? new Date().getHours();
  const day = req.query.day ?? new Date().getDay();
  const priority = req.query.priority ?? "low";
  const category = req.query.category ?? "other";
  const estMinutes = req.query.estimatedMinutes ?? "0";
  const hasDueDate = req.query.has_dueDate ?? "0";
  const isRecurring = req.query.isRecurring ?? "0";

  const cmd = `python3 ml/predict.py ${hour} ${day} ${priority} ${category} ${estMinutes} ${hasDueDate} ${isRecurring}`;

  const env = { ...process.env, ML_USER_ID: session.user.id };

  exec(cmd, { env }, (err, stdout) => {
    if (err) return res.send("0.5");
    const output = stdout.trim();
    if (output === "MODEL_NOT_TRAINED") return res.send("0.5");
    res.send(output);
  });
});

app.post("/api/ml-train", async (req: any, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session?.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const env = {
      ...process.env,
      ML_USER_ID: session.user.id,
    };

    exec("python3 ml/train.py", { env }, (err, stdout, stderr) => {
      if (err) return res.status(500).json({ error: stderr || err.message });
      res.json({ ok: true, output: stdout });
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to train model" });
  }
});

app.get("/api/ml-insights", async (req: any, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session?.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const userId = session.user.id;
    const userTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId));

    const formatted = userTasks
      .filter((t) => t.completedAt !== null)
      .map((t) => ({
        hour: new Date(t.completedAt!).getHours(),
        day: new Date(t.completedAt!).getDay(),
        priority: t.priority ?? "low",
        category: t.category ?? "other",
        estimated_minutes: t.estimatedMinutes ?? 0,
        has_due_date: t.dueDate ? 1 : 0,
        is_recurring: t.isRecurring ? 1 : 0,
        completed: t.completed ? 1 : 0,
      }));

    const child = exec(
      "python3 ml/insights.py",
      { env: process.env },
      (err, stdout, stderr) => {
        if (err) {
          console.error("insights stderr:", stderr);
          return res.status(500).json({ error: err.message });
        }
        try {
          res.json(JSON.parse(stdout));
        } catch {
          res.status(500).send("Failed to parse insights output");
        }
      },
    );

    // Pass task data via stdin instead of HTTP
    child.stdin?.write(JSON.stringify(formatted));
    child.stdin?.end();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/user/export", async (req: any, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session?.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const userId = session.user.id;

    const [userTasks, userGoals, userHabits] = await Promise.all([
      db.select().from(tasks).where(eq(tasks.userId, userId)),
      db.select().from(goals).where(eq(goals.userId, userId)),
      db.select().from(habits).where(eq(habits.userId, userId)),
    ]);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=focusflow-export.pdf",
    );

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("FocusFlow Export", { align: "center" });
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("gray")
      .text(`Exported on ${new Date().toLocaleDateString()}`, {
        align: "center",
      });
    doc.moveDown(2);

    doc.fontSize(16).font("Helvetica-Bold").fillColor("black").text("Tasks");
    doc.moveTo(40, doc.y).lineTo(570, doc.y).stroke();
    doc.moveDown(0.5);
    if (userTasks.length === 0) {
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("gray")
        .text("No tasks found.");
    } else {
      for (const task of userTasks) {
        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor("black")
          .text(`${task.completed ? "✓" : "○"} ${task.title}`, {
            continued: false,
          });
        doc
          .fontSize(9)
          .font("Helvetica")
          .fillColor("gray")
          .text(
            `Priority: ${task.priority ?? "—"}  |  Category: ${task.category ?? "—"}  |  Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}`,
          );
        doc.moveDown(0.4);
      }
    }
    doc.moveDown(1);

    doc.fontSize(16).font("Helvetica-Bold").fillColor("black").text("Goals");
    doc.moveTo(40, doc.y).lineTo(570, doc.y).stroke();
    doc.moveDown(0.5);
    if (userGoals.length === 0) {
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("gray")
        .text("No goals found.");
    } else {
      for (const goal of userGoals) {
        const progress =
          goal.targetValue > 0
            ? Math.round(((goal.currentValue ?? 0) / goal.targetValue) * 100)
            : 0;
        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor("black")
          .text(goal.title);
        doc
          .fontSize(9)
          .font("Helvetica")
          .fillColor("gray")
          .text(
            `Progress: ${progress}%  |  ${goal.currentValue ?? 0} / ${goal.targetValue} ${goal.unit}  |  Status: ${goal.status}`,
          );
        doc.moveDown(0.4);
      }
    }
    doc.moveDown(1);

    doc.fontSize(16).font("Helvetica-Bold").fillColor("black").text("Habits");
    doc.moveTo(40, doc.y).lineTo(570, doc.y).stroke();
    doc.moveDown(0.5);
    if (userHabits.length === 0) {
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("gray")
        .text("No habits found.");
    } else {
      for (const habit of userHabits) {
        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor("black")
          .text(habit.name);
        doc
          .fontSize(9)
          .font("Helvetica")
          .fillColor("gray")
          .text(
            `Streak: ${habit.streak ?? 0} days  |  Longest: ${habit.longestStreak ?? 0} days  |  Frequency: ${habit.frequency}  |  Category: ${habit.category}`,
          );
        doc.moveDown(0.4);
      }
    }

    doc.end();
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Export failed" });
  }
});

app.get("/api/user/sessions", async (req: any, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session?.user) return res.status(401).json({ error: "Unauthorized" });

    const sessions = await db
      .select()
      .from(sessionTable)
      .where(eq(sessionTable.userId, session.user.id));

    res.json(
      sessions.map((s) => ({
        id: s.id,
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        isCurrent: s.token === session.session.token,
      })),
    );
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/user/sessions/:id", async (req: any, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session?.user) return res.status(401).json({ error: "Unauthorized" });

    const [target] = await db
      .select()
      .from(sessionTable)
      .where(eq(sessionTable.id, req.params.id));

    if (!target || target.userId !== session.user.id)
      return res.status(403).json({ error: "Forbidden" });

    await db.delete(sessionTable).where(eq(sessionTable.id, req.params.id));
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => console.log(`Server running on :${PORT}`));

export default app;
