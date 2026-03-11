import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import postRoutes from "./routes/posts";
import eventRoutes from "./routes/events";
import matchingRoutes from "./routes/matching";

const app = express();

// ─── SECURITY & MIDDLEWARE ───────────────────────────────────

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// ─── ROUTES ──────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/matching", matchingRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── ERROR HANDLING ──────────────────────────────────────────

app.use(errorHandler);

// ─── START ───────────────────────────────────────────────────

app.listen(env.PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   🏠 Back Home API                  ║
  ║   Running on port ${env.PORT}             ║
  ║   Environment: ${env.NODE_ENV}      ║
  ╚══════════════════════════════════════╝
  `);
});

export default app;
