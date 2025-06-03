// src/controllers/portfolio.ts

import { Router, Request, Response } from "express";
import { ethers } from "ethers";
import { ALCHEMY_API_URL } from "../utils/config";

const router = Router();
const provider = new ethers.JsonRpcProvider(ALCHEMY_API_URL);

router.get(
  "/portfolio/:address",
  async (req: Request, res: Response): Promise<void> => {
    const { address } = req.params;
    if (!address || !ethers.isAddress(address)) {
      res.status(400).json({ error: "Invalid address." });
      return;
    }
    try {
      const balance = await provider.getBalance(address);
      const ethBalance = ethers.formatEther(balance);
      res.json({ ethBalance });
    } catch (err) {
      console.error("Portfolio controller error:", err);
      res.status(500).json({ error: "Failed to fetch balance" });
    }
  }
);

export default router;
