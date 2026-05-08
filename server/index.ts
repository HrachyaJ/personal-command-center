import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import taskRoutes from "./routes/tasks.js";
import goalRoutes from "./routes/goals.js";
import habitRoutes from "./routes/habits.js";
import { db } from "./db.js";
import { tasks } from "./db/schema.js";
import { exec } from "child_process";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://focus-flow-site.vercel.app"],
    credentials: true,
  }),
);

// Fix: use /* instead of /{*path}
app.all("/api/auth/*path", toNodeHandler(auth));

app.use(express.json());

app.use("/api/tasks", taskRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/habits", habitRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/ml-data", async (req, res) => {
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

app.get("/api/predict", (req, res) => {
  const hour = new Date().getHours();
  const day = new Date().getDay();

  exec(
    `py ml/model.py ${hour} ${day}`,
    (err: any, stdout: any, stderr: any) => {
      if (err) return res.status(500).send(err.message);
      res.send(stdout);
    },
  );
});

app.get("/api/ml-insights", (_req, res) => {
  exec("py ml/insights.py", (err, stdout, stderr) => {
    if (err) return res.status(500).send(err.message);
    res.json(JSON.parse(stdout));
  });
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => console.log(`Server running on :${PORT}`));

export default app;
