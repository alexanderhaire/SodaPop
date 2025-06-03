// src/index.ts

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import authRouter from "./controllers/auth";
import portfolioRouter from "./controllers/portfolio";
import chatRouter from "./controllers/chat";
import { PORT, JWT_SECRET } from "./utils/config";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "OK" });
});

// (Optional) Hello endpoint
app.get("/api/hello", (_req: Request, res: Response) => {
  res.json({ message: "Hello from SodaPop backend!" });
});

// Middleware to protect routes with JWT
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
app.use("/api/auth", authRouter);

// Mount portfolio routes (protected)
app.use("/api/portfolio", requireAuth, portfolioRouter);

// Mount chat routes (protected)
app.use("/api/chat", requireAuth, chatRouter);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend listening on http://localhost:${PORT}`);
});
