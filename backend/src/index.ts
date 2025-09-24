import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

import authRoutes from "./controllers/auth";
import portfolioRoutes from "./controllers/portfolio";
import chatRoutes from "./controllers/chat";
import sodabotRoutes from "./routes/sodabot";
import marketplaceRoutes from "./controllers/marketplaceController";
import itemsRoutes from "./routes/items";
import leaderboardRoutes from "./controllers/leaderboard";
import eventRoutes from "./routes/events";
import marketDataRoutes from "./routes/marketData";
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
app.set("trust proxy", true);
app.use(cors());
app.use(express.json());

const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Health check
app.get("/healthz", (_req: Request, res: Response) => {
  res.status(200).send("ok");
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "OK" });
});

// (Optional) Hello endpoint
app.get("/api/hello", (_req: Request, res: Response) => {
  res.json({ message: "Hello from SodaPop backend!" });
});

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  console.log("Auth header received:", authHeader);
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

// File upload endpoint (unprotected)
app.use("/api/upload", uploadRoutes);

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

// Market data endpoint (unprotected)
app.use("/api", marketDataRoutes);

// Leaderboard endpoint (unprotected)
app.use("/api/leaderboard", leaderboardRoutes);

// SodaBot chat endpoint (unprotected)
app.use("/api/sodabot", sodabotRoutes);

const port = PORT;
const host = "0.0.0.0";

app.listen(port, host, () => {
  console.log(`🚀 Backend listening on port ${port}`);
});

// Start background cron jobs
startEventMonitor();
