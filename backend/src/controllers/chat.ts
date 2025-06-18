// src/controllers/chat.ts

import { Router, Request, Response } from "express";
import OpenAI from "openai"; // using v4+ SDK
import { OPENAI_API_KEY } from "../utils/config";
<<<<<<< HEAD
import { buildPersonalizationPrompt } from "../ai/personalizationEngine";
=======
import { getWalletPreferences } from "../ai/personalizationEngine";
import ChatMessage from "../models/chatMessage";
>>>>>>> origin/4xtxcq-codex/modify-chat-controller-to-load-last-5-exchanges

const MAX_PROMPT_LENGTH = 2000;

function sanitize(text: string, max: number = MAX_PROMPT_LENGTH): string {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) : text;
}

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
      const pref = wallet ? await buildPersonalizationPrompt(wallet) : "";
      const systemPrompt = sanitize(
        pref || "You are a helpful DeFi assistant.",
        MAX_PROMPT_LENGTH
      );
      const userContent = sanitize(message.content, MAX_PROMPT_LENGTH);

      // Load last 5 exchanges for this wallet
      const historyDocs = wallet
        ? await ChatMessage.find({ wallet })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean()
        : [];
      const history = historyDocs
        .reverse()
        .map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: sanitize(m.content, MAX_PROMPT_LENGTH),
        }));

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: message.role, content: userContent } as any,
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

      if (wallet) {
        await ChatMessage.create({
          wallet,
          role: message.role,
          content: userContent,
        });
        await ChatMessage.create({
          wallet,
          role: "assistant",
          content: reply.content,
        });
      }

      res.json({ reply });
    } catch (err) {
      console.error("Chat controller error:", err);
      res.status(500).json({ error: "Failed to process chat message." });
    }
  }
);

export default router;
