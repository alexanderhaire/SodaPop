// File: backend/src/index.ts

import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import authRouter from "./routes/authRoutes";
import horseRoutes from "./routes/horseRoutes";
import userRoutes from "./routes/userRoutes";
import horseRoutes from "./routes/horses";
import horseRoutes from "./routes/horses";
import horseRoutes from "./routes/horses";
import earningsRoutes from "./routes/earnings";
import earningsRoutes from "./routes/earnings";
import transactionRoutes from "./routes/transactionRoutes";
import chatRoutes from "./routes/chatRoutes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", horseRoutes);
app.use("/api", horseRoutes);
app.use("/api", horseRoutes);
app.use("/api", earningsRoutes);
app.use("/api", earningsRoutes);

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "OK" });
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
    jwt.verify(token, process.env.JWT_SECRET!);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Mount unprotected auth routes
app.use("/api/auth", authRouter);

// Mount horse routes (public)
app.use("/api/horses", horseRoutes);

// Mount protected routes
app.use("/api/horses", requireAuth, horseRoutes);
app.use("/api/users", requireAuth, userRoutes);
app.use("/api/transactions", requireAuth, transactionRoutes);
app.use("/api/chat", requireAuth, chatRoutes);

const PORT = process.env.PORT || 4000;


app.get("/api/earnings/:address", (req, res) => {
  const { address } = req.params;
  if (address.toLowerCase() !== "0x1462...dbee") {
    return res.status(404).json([]);
  }

  return res.json([
    {
      id: "soda-pop",
      name: "SodaPop",
      my_share: 2.5,
      total_earned: 13850,
      goal: 25000,
      progress_to_goal: 55
    }
  ]);
});
app.listen(4000, () => console.log("🚀 Backend listening on http://localhost:4000"));
