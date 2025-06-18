import { Router, Request, Response } from "express";
import {
  getRankedItems,
  trackUserInteraction,
  getWalletAffinities,
} from "../ai/personalizationEngine";
import { getRecommendedItems } from "../ai/embeddingService";
import { searchItems } from "../ai/searchService";
import { generateItemInsights } from "../ai/insightsService";

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

// GET /api/marketplace/search?q=horse&wallet=0x123&top=5
router.get("/search", async (req: Request, res: Response) => {
  const wallet = (req.query.wallet as string) || "";
  const top = parseInt(req.query.top as string) || 5;
  const q = (req.query.q as string) || "";
  try {
    const items = await searchItems(q, wallet, top);
    res.json(items);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Failed to search items" });
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

// GET /api/marketplace/insights
router.get("/insights", async (_req: Request, res: Response) => {
  try {
    const insights = await generateItemInsights();
    res.json(insights);
  } catch (err) {
    console.error("Insights error:", err);
    res.status(500).json({ error: "Failed to generate insights" });
  }
});

export default router;
