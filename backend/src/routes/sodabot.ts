import express, { Request, Response } from "express";
import OpenAI from "openai";

// Import JS models with require to avoid typing issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Item = require("../models/item");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Transaction = require("../models/transaction");

const router: express.Router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

router.post("/", async (req: Request, res: Response) => {
  try {
    const { prompt, userAddress } = req.body as {
      prompt?: string;
      userAddress?: string;
    };

    if (!prompt || !userAddress) {
      res.status(400).json({ error: "Missing prompt or user address." });
      return;
    }

    // Look up items the user has interacted with
    let boughtItems: any[] = [];
    let soldItems: any[] = [];

    try {
      const userModel = require("../models/user");
      const user = await userModel
        .findOne({ walletAddress: userAddress.toLowerCase() })
        .lean();
      if (user) {
        const boughtIds = await Transaction.find({ userId: user._id }).distinct(
          "itemId"
        );
        boughtItems = await Item.find({ _id: { $in: boughtIds } }).lean();
      }
    } catch (err) {
      console.error("Failed to fetch bought items", err);
    }

    try {
      soldItems = await Item.find({ seller: userAddress.toLowerCase() }).lean();
    } catch (err) {
      console.error("Failed to fetch sold items", err);
    }

    const insight = {
      boughtCount: boughtItems.length,
      soldCount: soldItems.length,
      topPerformer: soldItems.sort((a, b) => (b.wins || 0) - (a.wins || 0))[0]?.
        name,
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are SodaBot, an intelligent assistant for users of Grey MarketPlace. You summarize sales, ownership history, performance stats, and make helpful suggestions.",
        },
        {
          role: "user",
          content: `${prompt}\n\nUser Address: ${userAddress}\nItems Bought: ${boughtItems
            .map((i) => i.name)
            .join(", ")}\nItems Sold: ${soldItems
            .map((i) => i.name)
            .join(", ")}\nTop Performer: ${insight.topPerformer}`,
        },
      ],
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "I couldn't generate a response.";
    res.json({ reply });
  } catch (err) {
    console.error("SodaBot error:", err);
    res.status(500).json({ error: "SodaBot failed to respond." });
  }
});

export default router;
