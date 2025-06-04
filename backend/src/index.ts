// File: backend/src/index.ts

import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import authRouter from "./routes/authRoutes";
import horseRoutes from "./routes/horseRoutes";
import userRoutes from "./routes/userRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import chatRoutes from "./routes/chatRoutes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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

// Connect to MongoDB then start the server
mongoose
  .connect(process.env.MONGO_URI!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as mongoose.ConnectOptions)
  .then(() => {
    console.log("🚀 Connected to MongoDB");
    app.listen(PORT, () =>
      console.log(`🚀 Backend listening on http://localhost:${PORT}`)
    );
  })
  .catch((err: Error) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
