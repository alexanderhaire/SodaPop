import { Router, Request, Response } from "express";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getConnection } from "../services/blockchainService";

const router = Router();

const KNOWN_HOLDERS = [
  "7xKXtg8Xf5gYvEPq6Z9erjRzCQXDpUe1koXSPoaqe7iH",
  "8YJc6Uxhk1k4LwWXcncxUx7fTT1YwoMvV7bgidhra9X6",
  "5Fh3LwT1Muv7P9dQqN5KMK9eDpjXGZUp3NEPoPFcQpQv",
  "H3U4p1LBXjg5eQqr8RP4eAbQeXtfqUfAfeU3uVAk1tZB",
  "Fz9S8UQGiVHtV6nRvWmvMRGsiE9zraFMvx6bMpiKFFta",
  "Eq9E5iADG7n2D1LDPZWS9Vyuk3F7S3Uz7Dnk3a1JpN96",
];

router.get("/:mint", async (_req: Request, res: Response) => {
  try {
    const connection = getConnection();
    const balances = await Promise.all(
      KNOWN_HOLDERS.map(async (addr) => {
        const pubkey = new PublicKey(addr);
        const lamports = await connection.getBalance(pubkey);
        return { address: addr, lamports };
      })
    );

    const leaderboard = balances
      .map(({ address, lamports }) => ({
        address,
        shares: Number((lamports / LAMPORTS_PER_SOL).toFixed(3)),
      }))
      .sort((a, b) => b.shares - a.shares)
      .slice(0, 5);

    res.json(leaderboard);
  } catch (err) {
    console.error("Leaderboard route error:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

export default router;
