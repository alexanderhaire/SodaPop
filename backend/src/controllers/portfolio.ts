// src/controllers/portfolio.ts

import { Router, Request, Response } from "express";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getConnection } from "../services/blockchainService";

const router = Router();

router.get(
  "/portfolio/:address",
  async (req: Request, res: Response): Promise<void> => {
    const { address } = req.params;
    if (!address) {
      res.status(400).json({ error: "Invalid address." });
      return;
    }
    try {
      const pubkey = new PublicKey(address);
      const connection = getConnection();
      const lamports = await connection.getBalance(pubkey);
      const solBalance = lamports / LAMPORTS_PER_SOL;
      res.json({ solBalance: solBalance.toFixed(4) });
    } catch (err) {
      console.error("Portfolio controller error:", err);
      res.status(400).json({ error: "Invalid Solana address." });
    }
  }
);

export default router;
