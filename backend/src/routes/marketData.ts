import express from "express";

const router = express.Router();

// Simple in-memory last price per item
const lastPrices: Record<string, number> = {};

router.get("/asset/market-data/:itemId", (_req, res) => {
  const { itemId } = _req.params;
  const prev = lastPrices[itemId] || 5;
  const price = Math.max(0, prev + (Math.random() - 0.5));
  lastPrices[itemId] = price;
  res.json({ price: Number(price.toFixed(2)), timestamp: new Date().toISOString() });
});

export default router;
