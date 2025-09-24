"use strict";
// src/controllers/portfolio.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const web3_js_1 = require("@solana/web3.js");
const blockchainService_1 = require("../services/blockchainService");
const router = (0, express_1.Router)();
router.get("/portfolio/:address", async (req, res) => {
    const { address } = req.params;
    if (!address) {
        res.status(400).json({ error: "Invalid address." });
        return;
    }
    try {
        const pubkey = new web3_js_1.PublicKey(address);
        const connection = (0, blockchainService_1.getConnection)();
        const lamports = await connection.getBalance(pubkey);
        const solBalance = lamports / web3_js_1.LAMPORTS_PER_SOL;
        res.json({ solBalance: solBalance.toFixed(4) });
    }
    catch (err) {
        console.error("Portfolio controller error:", err);
        res.status(400).json({ error: "Invalid Solana address." });
    }
});
exports.default = router;
