import express from "express";
const router = express.Router();

// POST /api/horses
router.post("/", async (req, res) => {
  console.log("📩 New horse submitted:", req.body);
  res.status(201).json({ message: "Horse received", data: req.body });
});

export default router;
