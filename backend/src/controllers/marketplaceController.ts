import { Router, Request, Response } from "express";
import { getRankedHorses, trackUserInteraction } from "../ai/personalizationEngine";

const router = Router();

// GET /api/marketplace/horses?wallet=0x123
router.get("/horses", async (req: Request, res: Response) => {
  const wallet = (req.query.wallet as string) || "";
  try {
    const horses = await getRankedHorses(wallet);
    res.json(horses);
  } catch (err) {
    console.error("Marketplace controller error:", err);
    res.status(500).json({ error: "Failed to fetch horses" });
  }
});

// POST /api/marketplace/interactions
router.post("/interactions", async (req: Request, res: Response) => {
  const { wallet, horseId, action } = req.body as {
    wallet: string;
    horseId: string;
    action: "viewed" | "favorited" | "purchased";
  };
  try {
    await trackUserInteraction(wallet, horseId, action);
    res.json({ status: "ok" });
  } catch (err) {
    console.error("Track interaction error:", err);
    res.status(500).json({ error: "Failed to track interaction" });
  }
});

export default router;
