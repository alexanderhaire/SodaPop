import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRouter from "./controllers/chat";

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  return res.json({ status: "OK" });
});

// Hello route (optional)
app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from SodaPop backend!" });
});

// Mount the chat router
app.use("/api/chat", chatRouter);

app.listen(PORT, () => {
  console.log(\`🚀 Backend listening on http://localhost:\${PORT}\`);
});
