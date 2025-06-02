import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRouter from "./controllers/auth";
import portfolioRouter from "./controllers/portfolio";
import chatRouter from "./controllers/chat";
import { requireAuth } from "./middleware/authMiddleware";

import { PORT } from "./utils/config";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "OK" });
});

app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from SodaPop backend!" });
});

app.use("/api", requireAuth, portfolioRouter);
app.use("/api/chat", requireAuth, chatRouter);

app.listen(PORT, () => {
  console.log(\`🚀 Backend listening on http://localhost:\${PORT}\`);
});
