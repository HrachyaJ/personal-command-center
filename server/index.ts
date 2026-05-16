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
import { tasks } from "./db/schema.js";
import { user as userTable } from "./db/auth-schema.js";
import { eq } from "drizzle-orm";
import { exec } from "child_process";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

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
    .filter((t) => t.createdAt !== null)
    .map((t) => ({
      hour: new Date(t.createdAt!).getHours(),
      day: new Date(t.createdAt!).getDay(),
      completed: t.completed ? 1 : 0,
    }));
  res.json(formatted);
});

app.get("/api/predict", (_req, res) => {
  const hour = new Date().getHours();
  const day = new Date().getDay();
  exec(`py ml/model.py ${hour} ${day}`, (err, stdout) => {
    if (err) return res.status(500).send(err.message);
    res.send(stdout);
  });
});

app.get("/api/ml-insights", (_req, res) => {
  exec("py ml/insights.py", (err, stdout) => {
    if (err) return res.status(500).send(err.message);
    res.json(JSON.parse(stdout));
  });
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => console.log(`Server running on :${PORT}`));

export default app;
