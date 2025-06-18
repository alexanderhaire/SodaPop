import express from "express";
import Event from "../models/event";

const router = express.Router();

router.get("/events", async (_req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 }).limit(20).lean();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to load events" });
  }
});

export default router;
