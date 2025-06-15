"use strict";
// src/controllers/chat.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const openai_1 = __importDefault(require("openai")); // using v4+ SDK
const config_1 = require("../utils/config");
const router = (0, express_1.Router)();
const openai = new openai_1.default({ apiKey: config_1.OPENAI_API_KEY });
// Expecting body shape: { message: { role: string; content: string } }
router.post("/message", async (req, res) => {
    try {
        const { message } = req.body;
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
            role: choice.message.role,
            content: choice.message.content,
        };
        res.json({ reply });
    }
    catch (err) {
        console.error("Chat controller error:", err);
        res.status(500).json({ error: "Failed to process chat message." });
    }
});
exports.default = router;
