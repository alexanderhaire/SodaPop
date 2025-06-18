import { Router, Request, Response } from "express";
import {
  getRankedItems,
  trackUserInteraction,
} from "../ai/personalizationEngine";
import { getRecommendedItems } from "../ai/embeddingService";

const router = Router();

// GET /api/marketplace/items?wallet=0x123
router.get("/items", async (req: Request, res: Response) => {
  const wallet = (req.query.wallet as string) || "";
  try {
    const items = await getRankedItems(wallet);
    res.json(items);
  } catch (err) {
    console.error("Marketplace controller error:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// POST /api/marketplace/interactions
router.post("/interactions", async (req: Request, res: Response) => {
  const { wallet, itemId, action } = req.body as {
    wallet: string;
    itemId: string;
    action: "viewed" | "favorited" | "purchased";
  };
  try {
    await trackUserInteraction(wallet, itemId, action);
    res.json({ status: "ok" });
  } catch (err) {
    console.error("Track interaction error:", err);
    res.status(500).json({ error: "Failed to track interaction" });
  }
});

// GET /api/marketplace/recommendations?wallet=0x123&top=5
router.get("/recommendations", async (req: Request, res: Response) => {
  const wallet = (req.query.wallet as string) || "";
  const top = parseInt(req.query.top as string) || 5;
  try {
    const items = await getRecommendedItems(wallet, top);
    res.json(items);
  } catch (err) {
    console.error("Recommendation error:", err);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

export default router;
