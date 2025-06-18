// src/controllers/chat.ts

import { Router, Request, Response } from "express";
import OpenAI from "openai"; // using v4+ SDK
import { OPENAI_API_KEY } from "../utils/config";
import { getWalletPreferences } from "../ai/personalizationEngine";

const router = Router();
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Expecting body shape: { message: { role: string; content: string } }
router.post(
  "/message",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { message } = req.body as {
        message: { role: "user" | "assistant" | "system"; content: string };
      };
      if (!message || typeof message.content !== "string") {
        res.status(400).json({ error: "Invalid request body." });
        return;
      }

      const wallet =
        (req.query.wallet as string) ||
        (req.headers["x-wallet-address"] as string) ||
        "";
      const pref = wallet ? await getWalletPreferences(wallet) : "";

      const systemPrompt = pref
        ? `User interactions: ${pref}`
        : "You are a knowledgeable DeFi assistant.";
      const trimmed = systemPrompt.slice(-1000); // cap to avoid huge prompts

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: trimmed },
          { role: message.role, content: message.content } as any,
        ],
      });

      const choice = completion.choices?.[0];
      if (!choice || !choice.message?.content) {
        res
          .status(500)
          .json({ error: "OpenAI did not return a valid response." });
        return;
      }

      const reply = {
        role: choice.message.role as "assistant",
        content: choice.message.content,
      };

      res.json({ reply });
    } catch (err) {
      console.error("Chat controller error:", err);
      res.status(500).json({ error: "Failed to process chat message." });
    }
  }
);

export default router;
