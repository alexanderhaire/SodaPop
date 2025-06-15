"use strict";
// src/controllers/portfolio.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ethers_1 = require("ethers");
const config_1 = require("../utils/config");
const router = (0, express_1.Router)();
const provider = new ethers_1.ethers.JsonRpcProvider(config_1.ALCHEMY_API_URL);
router.get("/portfolio/:address", async (req, res) => {
    const { address } = req.params;
    if (!address || !ethers_1.ethers.isAddress(address)) {
        res.status(400).json({ error: "Invalid address." });
        return;
    }
    try {
        const balance = await provider.getBalance(address);
        const ethBalance = ethers_1.ethers.formatEther(balance);
        res.json({ ethBalance });
    }
    catch (err) {
        console.error("Portfolio controller error:", err);
        res.status(500).json({ error: "Failed to fetch balance" });
    }
});
exports.default = router;
