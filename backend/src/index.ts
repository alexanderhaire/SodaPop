import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import authRoutes from "./controllers/auth";
import portfolioRoutes from "./controllers/portfolio";
import chatRoutes from "./controllers/chat";
import sodabotRoutes from "./routes/sodabot";
import marketplaceRoutes from "./controllers/marketplaceController";
import itemsRoutes from "./routes/items";
import leaderboardRoutes from "./controllers/leaderboard";
import eventRoutes from "./routes/events";
import uploadRoutes from "./routes/upload";
import { PORT, JWT_SECRET, MONGO_URI } from "./utils/config";
import { startEventMonitor } from "./jobs/eventMonitor";

dotenv.config();

// Connect to MongoDB if a URI is provided
if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("Mongo connection error:", err));
}

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "OK" });
});

// (Optional) Hello endpoint
app.get("/api/hello", (_req: Request, res: Response) => {
  res.json({ message: "Hello from SodaPop backend!" });
});

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Mount auth routes (unprotected)
app.use("/api/auth", authRoutes);

// Mount portfolio routes (protected)
app.use("/api", requireAuth, portfolioRoutes);

// Mount chat routes (protected)
app.use("/api/chat", requireAuth, chatRoutes);

// Item creation routes (protected)
app.use("/api/items", requireAuth, itemsRoutes);

// Marketplace endpoints (protected)
app.use("/api/marketplace", requireAuth, marketplaceRoutes);

// Events endpoint (protected)
app.use("/api", requireAuth, eventRoutes);

// Leaderboard endpoint (unprotected)
app.use("/api/leaderboard", leaderboardRoutes);

// SodaBot chat endpoint (unprotected)
app.use("/api/sodabot", sodabotRoutes);

// File upload endpoint (unprotected)
app.use("/api/upload", uploadRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Backend listening on http://localhost:${PORT}`);
});

// Start background cron jobs
startEventMonitor();
