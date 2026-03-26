import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import taskRoutes from "./routes/tasks";
import goalRoutes from "./routes/goals";
import habitRoutes from "./routes/habits";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// Better Auth must come before express.json()
// Express v5 requires {0,} instead of * for wildcards
app.all("/api/auth/{*path}", toNodeHandler(auth));

app.use(express.json());

app.use("/api/tasks", taskRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/habits", habitRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => console.log(`Server running on :${PORT}`));
