// src/controllers/chat.ts

import { Router, Request, Response } from "express";
import OpenAI from "openai"; // using v4+ SDK
import { OPENAI_API_KEY } from "../utils/config";

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

      // Send the single user message to the OpenAI chat completion endpoint.
      // If you need full history, collect previous messages on the frontend and send them here.
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          // (Optional) a system prompt could be injected here:
          // { role: "system", content: "You are a helpful assistant." },
          { role: message.role, content: message.content },
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
