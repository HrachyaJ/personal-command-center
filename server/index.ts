import "dotenv/config";

import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import taskRoutes from "./routes/tasks.js";
import goalRoutes from "./routes/goals.js";
import habitRoutes from "./routes/habits.js";
import { LOCALHOST_ORIGIN } from "./constants.js";

const app = express();

app.use(
  cors({
    origin: [
      LOCALHOST_ORIGIN,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
    ],
    credentials: true,
  }),
);

app.all("/api/auth/{*path}", toNodeHandler(auth));

app.use(express.json());

app.use("/api/tasks", taskRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/habits", habitRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => console.log(`Server running on :${PORT}`));

export default app;
