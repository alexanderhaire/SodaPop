import { Router, Request, Response } from "express";
import { ethers } from "ethers";
import { ALCHEMY_API_URL } from "../utils/config";

const router = Router();
const provider = new ethers.JsonRpcProvider(ALCHEMY_API_URL);

const TOKEN_ADDRESS = "0xaCC9a224F2607559E124FD37EA9E2973302033Eb";
const ERC1155_ABI = [
  "function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])",
];

const KNOWN_HOLDERS = [
  "0x1111111111111111111111111111111111111111",
  "0x2222222222222222222222222222222222222222",
  "0x3333333333333333333333333333333333333333",
  "0x4444444444444444444444444444444444444444",
  "0x5555555555555555555555555555555555555555",
  "0x6666666666666666666666666666666666666666",
];

router.get("/:tokenId", async (req: Request, res: Response) => {
  const tokenId = Number(req.params.tokenId);
  if (Number.isNaN(tokenId)) {
    res.status(400).json({ error: "Invalid tokenId" });
    return;
  }

  try {
    const contract = new ethers.Contract(TOKEN_ADDRESS, ERC1155_ABI, provider);
    const ids = KNOWN_HOLDERS.map(() => tokenId);
    const balances: bigint[] = await contract.balanceOfBatch(KNOWN_HOLDERS, ids);

    const leaderboard = KNOWN_HOLDERS.map((addr, i) => ({
      address: addr,
      shares: Number(balances[i] || 0n),
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
