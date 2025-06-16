import express from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

const DB_PATH = path.join(__dirname, "../data/horses.json");

app.get("/api/horses", (req, res) => {
  const horses = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  res.json(horses);
});

app.post("/api/horses", (req, res) => {
  const horses = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  horses.push(req.body);
  fs.writeFileSync(DB_PATH, JSON.stringify(horses, null, 2));
  res.status(201).json({ success: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend listening on http://localhost:${PORT}`);
});
