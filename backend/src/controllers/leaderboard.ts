import { Router, Request, Response } from "express";
import { ethers } from "ethers";
import { ALCHEMY_API_URL } from "../utils/config";

const router = Router();
const provider = ALCHEMY_API_URL ? new ethers.JsonRpcProvider(ALCHEMY_API_URL) : undefined;

const ERC1155_ABI = [
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
  "event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)",
  "function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])",
];

function getContracts(): string[] {
  const env = process.env.GREY_CONTRACTS || "";
  return env.split(",").map((a) => a.trim()).filter(Boolean);
}

async function fetchHolders(contractAddr: string) {
  const iface = new ethers.Interface(ERC1155_ABI);
  const transferSingle = iface.getEvent("TransferSingle");
  const transferBatch = iface.getEvent("TransferBatch");

  const filterSingle = {
    address: contractAddr,
    topics: [iface.getEventTopic(transferSingle)],
    fromBlock: 0n,
  } as ethers.Filter;
  const filterBatch = {
    address: contractAddr,
    topics: [iface.getEventTopic(transferBatch)],
    fromBlock: 0n,
  } as ethers.Filter;

  const logsSingle = provider ? await provider.getLogs(filterSingle) : [];
  const logsBatch = provider ? await provider.getLogs(filterBatch) : [];

  const holders = new Set<string>();
  const tokenIds = new Set<bigint>();

  for (const log of [...logsSingle, ...logsBatch]) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed.name === "TransferSingle") {
        const { from, to, id } = parsed.args as any;
        holders.add(from.toLowerCase());
        holders.add(to.toLowerCase());
        tokenIds.add(BigInt(id));
      } else if (parsed.name === "TransferBatch") {
        const { from, to, ids } = parsed.args as any;
        holders.add(from.toLowerCase());
        holders.add(to.toLowerCase());
        (ids as bigint[]).forEach((i) => tokenIds.add(BigInt(i)));
      }
    } catch (err) {
      console.error("Failed to parse log", err);
    }
  }

  return { holders: Array.from(holders), tokenIds: Array.from(tokenIds) };
}

async function computeLeaderboard() {
  const contracts = getContracts();
  const leaderboard: Record<string, { total: bigint; unique: number; topToken: bigint; topAmount: bigint }> = {};

  for (const addr of contracts) {
    const { holders, tokenIds } = await fetchHolders(addr);
    const contract = provider ? new ethers.Contract(addr, ERC1155_ABI, provider) : null;
    for (const holder of holders) {
      if (!contract) continue;
      const accounts = tokenIds.map(() => holder);
      const balances: bigint[] = await contract.balanceOfBatch(accounts, tokenIds);
      let total = 0n;
      let topToken = 0n;
      let topAmount = 0n;
      balances.forEach((b, idx) => {
        total += b;
        if (b > topAmount) {
          topAmount = b;
          topToken = tokenIds[idx];
        }
      });
      const entry = leaderboard[holder] || { total: 0n, unique: 0, topToken: 0n, topAmount: 0n };
      entry.total += total;
      entry.unique += balances.filter((b) => b > 0n).length;
      if (topAmount > entry.topAmount) {
        entry.topAmount = topAmount;
        entry.topToken = topToken;
      }
      leaderboard[holder] = entry;
    }
  }

  const entries = Object.entries(leaderboard).map(([address, stats]) => ({
    address,
    totalShares: Number(stats.total),
    uniqueAssets: stats.unique,
    topHolding: { tokenId: String(stats.topToken), amount: Number(stats.topAmount) },
  }));

  entries.sort((a, b) => b.totalShares - a.totalShares);
  return entries.slice(0, 5);
}

router.get("/leaderboard", async (_req: Request, res: Response) => {
  try {
    if (!provider) {
      res.status(500).json({ error: "Provider not configured" });
      return;
    }
    const data = await computeLeaderboard();
    res.json(data);
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ error: "Failed to build leaderboard" });
  }
});

router.get("/leaderboard/test", (_req: Request, res: Response) => {
  res.json([
    {
      address: "0x1111111111111111111111111111111111111111",
      totalShares: 150,
      uniqueAssets: 3,
      topHolding: { tokenId: "1", amount: 100 },
    },
    {
      address: "0x2222222222222222222222222222222222222222",
      totalShares: 120,
      uniqueAssets: 2,
      topHolding: { tokenId: "2", amount: 80 },
    },
    {
      address: "0x3333333333333333333333333333333333333333",
      totalShares: 90,
      uniqueAssets: 1,
      topHolding: { tokenId: "3", amount: 90 },
    },
    {
      address: "0x4444444444444444444444444444444444444444",
      totalShares: 75,
      uniqueAssets: 2,
      topHolding: { tokenId: "1", amount: 40 },
    },
    {
      address: "0x5555555555555555555555555555555555555555",
      totalShares: 60,
      uniqueAssets: 1,
      topHolding: { tokenId: "2", amount: 60 },
    },
  ]);
});

export default router;
