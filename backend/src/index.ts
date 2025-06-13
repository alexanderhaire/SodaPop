// File: backend/src/index.ts

import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import authRouter from "./routes/authRoutes";
import horseRouter from "./routes/horses";
import userRouter from "./routes/userRoutes";
import earningsRouter from "./routes/earnings";
import transactionRouter from "./routes/transactionRoutes";
import chatRouter from "./routes/chatRoutes";

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", earningsRouter);

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
app.use("/api/horses", horseRouter);

// Mount protected routes
app.use("/api/users", requireAuth, userRouter);
app.use("/api/transactions", requireAuth, transactionRouter);
app.use("/api/chat", requireAuth, chatRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 Backend listening on http://localhost:${PORT}`)
);
