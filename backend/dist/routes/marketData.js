"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Simple in-memory last price per item
const lastPrices = {};
router.get("/asset/market-data/:itemId", (_req, res) => {
    const { itemId } = _req.params;
    const prev = lastPrices[itemId] || 5;
    const price = Math.max(0, prev + (Math.random() - 0.5));
    lastPrices[itemId] = price;
    res.json({ price: Number(price.toFixed(2)), timestamp: new Date().toISOString() });
});
exports.default = router;
