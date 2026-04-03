import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import taskRoutes from "./routes/tasks.js";
import goalRoutes from "./routes/goals.js";
import habitRoutes from "./routes/habits.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://focus-flow-site.vercel.app"],
    credentials: true,
  }),
);

// Fix: use /* instead of /{*path}
app.all("/api/auth/*", toNodeHandler(auth));

app.use(express.json());

app.use("/api/tasks", taskRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/habits", habitRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Only listen locally, not on Vercel
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT ?? 3001;
  app.listen(PORT, () => console.log(`Server running on :${PORT}`));
}

export default app;
