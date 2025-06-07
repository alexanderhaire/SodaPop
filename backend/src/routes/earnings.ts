import express from "express";
const router = express.Router();

router.get("/earnings/:wallet", async (req, res) => {
  console.log("🔍 Earnings request received for:", req.params.wallet);

  return res.json([
    {
      id: "sodapop",
      name: "SodaPop",
      my_share: 2.5,
      total_earned: 13850,
      goal: 25000,
      progress_to_goal: (13850 / 25000) * 100,
    }
  ]);
});

export default router;
