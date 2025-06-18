import { Router, Request, Response } from "express";
import { ethers } from "ethers";
import { ALCHEMY_API_URL } from "../utils/config";
import { HORSE_TOKEN_ADDRESS, horseTokenABI } from "../utils/contractConfig";

interface LeaderboardEntry {
  address: string;
  totalShares: number;
  uniqueAssets: number;
  topHolding: string;
}

const router = Router();
const provider = new ethers.JsonRpcProvider(ALCHEMY_API_URL);
const contract = new ethers.Contract(HORSE_TOKEN_ADDRESS, horseTokenABI, provider);

const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
let cache: { timestamp: number; data: LeaderboardEntry[] } | null = null;

async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  // TODO: Replace with logic to discover relevant wallet addresses.
  // For demo purposes we use a fixed address list.
  const addresses = [
    "0x1a2b...3e9c",
    "0x4b8d...fa01",
  ];

  const tokenIds = [0, 1, 2, 3, 4];

  const entries: LeaderboardEntry[] = [];

  for (const addr of addresses) {
    let totalShares = 0;
    const holdings: { id: number; shares: number }[] = [];

    for (const id of tokenIds) {
      try {
        const bal = await contract.balanceOf(addr, id);
        const shares = Number(bal);
        if (shares > 0) {
          holdings.push({ id, shares });
          totalShares += shares;
        }
      } catch {
        // ignore errors for demo
      }
    }

    holdings.sort((a, b) => b.shares - a.shares);
    entries.push({
      address: addr,
      totalShares,
      uniqueAssets: holdings.length,
      topHolding: holdings[0]
        ? `Token ${holdings[0].id} (${holdings[0].shares} shares)`
        : "",
    });
  }

  entries.sort((a, b) => b.totalShares - a.totalShares);
  return entries.slice(0, 5);
}

router.get(
  "/",
  async (_req: Request, res: Response): Promise<void> => {
  try {
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION_MS) {
      res.json(cache.data);
      return;
    }

    const data = await fetchLeaderboard();
    cache = { timestamp: Date.now(), data };
    res.json(data);
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
});

export default router;
