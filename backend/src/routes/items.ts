import express from "express";
const router = express.Router();

// POST /api/items
router.post("/", async (req, res) => {
  console.log("📩 New item submitted:", req.body);
  res.status(201).json({ message: "Item received", data: req.body });
});

export default router;
