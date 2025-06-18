import express from "express";
import OpenAI from "openai";

const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body as { prompt?: string };

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are SodaBot, a helpful assistant for horse trading and NFT data.",
        },
        { role: "user", content: prompt ?? "" },
      ],
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "I couldn't generate a response.";
    res.json({ reply });
  } catch (err) {
    console.error("SodaBot error:", err);
    res.status(500).json({ error: "Failed to respond." });
  }
});

export default router;
