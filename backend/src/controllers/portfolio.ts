import { Router, Request, Response } from "express";
import { getEthBalance } from "../services/defi";

const router = Router();

router.get("/portfolio/:address", async (req: Request, res: Response) => {
  const username = (req as any).user.username;
  console.log(\`User \${username} fetching portfolio for \${req.params.address}\`);
  try {
    const { address } = req.params;
    const ethBalance = await getEthBalance(address);
    return res.json({ ethBalance });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch portfolio" });
  }
});

export default router;
