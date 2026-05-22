import express from "express";
import cors from "cors";
import multer from "multer";
import { toNodeHandler } from "better-auth/node";
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

// ── Cloudinary config (set these in your .env) ────────────────────────────────
// CLOUDINARY_CLOUD_NAME=your_cloud_name
// CLOUDINARY_API_KEY=your_api_key
// CLOUDINARY_API_SECRET=your_api_secret
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://focus-flow-site.vercel.app"],
    credentials: true,
  }),
);

app.all("/api/auth/*path", toNodeHandler(auth));
app.use(express.json());

app.use("/api/tasks", taskRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/user", userRouter);

// ── Avatar upload ──────────────────────────────────────────────────────────────

// Use memory storage — we're streaming straight to Cloudinary, no disk needed
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

/** Upload a buffer to Cloudinary and return the secure URL. */
function uploadToCloudinary(buffer: Buffer, publicId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "avatars",
        public_id: publicId, // e.g. "avatars/userId" — overwrites on re-upload
        overwrite: true,
        transformation: [
          { width: 256, height: 256, crop: "fill", gravity: "face" },
          { fetch_format: "auto", quality: "auto" },
        ],
      },
      (error, result) => {
        if (error || !result)
          return reject(error ?? new Error("Upload failed"));
        resolve(result.secure_url); // always https://res.cloudinary.com/...
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
        headers: req.headers as any,
      });
      if (!session?.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      // Upload buffer → Cloudinary → get back a permanent https URL
      const imageUrl = await uploadToCloudinary(
        req.file.buffer,
        session.user.id,
      );

      // Persist the full URL in the DB
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
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session?.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Delete from Cloudinary too so you don't accumulate orphaned files
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

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/ml-data", async (_req, res) => {
  const getTasks = await db.select().from(tasks);
  const formatted = getTasks
    // Use createdAt as timestamp source (completedAt may be null for incomplete tasks)
    .filter((t) => t.createdAt !== null)
    .map((t) => ({
      hour: new Date(t.createdAt!).getHours(),
      day: new Date(t.createdAt!).getDay(),
      priority: t.priority ?? "low",
      category: t.category ?? "other",
      estimated_minutes: t.estimatedMinutes ?? 0,
      has_due_date: t.dueDate ? 1 : 0,
      is_recurring: t.isRecurring ? 1 : 0,
      completed: t.completed ? 1 : 0,
    }));
  res.json(formatted);
});

app.get("/api/predict", (req, res) => {
  const hour = req.query.hour ?? new Date().getHours();
  const day = req.query.day ?? new Date().getDay();
  const priority = req.query.priority ?? "low";
  const category = req.query.category ?? "other";
  const estMinutes = req.query.estimatedMinutes ?? "0";
  const hasDueDate = req.query.has_dueDate ?? "0";
  const isRecurring = req.query.isRecurring ?? "0";

  const cmd = `py ml/predict.py ${hour} ${day} ${priority} ${category} ${estMinutes} ${hasDueDate} ${isRecurring}`;

  exec(cmd, (err, stdout) => {
    if (err) return res.status(500).send(err.message);
    const output = stdout.trim();
    if (output === "MODEL_NOT_TRAINED") {
      // No model yet — return a neutral 0.5 so the UI doesn't break
      return res.send("0.5");
    }
    res.send(output);
  });
});

// Trigger model retraining manually (run this after you've collected enough data)
app.post("/api/ml-train", (_req, res) => {
  exec("py ml/train.py", (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: stderr || err.message });
    res.json({ ok: true, output: stdout });
  });
});

app.get("/api/ml-insights", (_req, res) => {
  exec("py ml/insights.py", (err, stdout) => {
    if (err) return res.status(500).send(err.message);
    res.json(JSON.parse(stdout));
  });
});

app.get("/api/user/export", async (req: any, res) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
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

    // Header
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

    // Tasks
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

    // Goals
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

    // Habits
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
    const session = await auth.api.getSession({ headers: req.headers as any });
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

// Revoke a specific session
app.delete("/api/user/sessions/:id", async (req: any, res) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session?.user) return res.status(401).json({ error: "Unauthorized" });

    // Make sure the session belongs to this user before deleting
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
