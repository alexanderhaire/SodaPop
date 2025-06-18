import { Router, Request, Response } from "express";
import {
  getRankedItems,
  trackUserInteraction,
  getWalletAffinities,
} from "../ai/personalizationEngine";

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

// GET /api/marketplace/affinities?wallet=0x123
router.get("/affinities", async (req: Request, res: Response) => {
  const wallet = (req.query.wallet as string) || "";
  try {
    const scores = await getWalletAffinities(wallet);
    res.json(scores);
  } catch (err) {
    console.error("Wallet affinities error:", err);
    res.status(500).json({ error: "Failed to fetch affinities" });
  }
});

export default router;
