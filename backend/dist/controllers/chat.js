"use strict";
// src/controllers/chat.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const openai_1 = __importDefault(require("openai")); // using v4+ SDK
const config_1 = require("../utils/config");
const personalizationEngine_1 = require("../ai/personalizationEngine");
const chatMessage_1 = __importDefault(require("../models/chatMessage"));
const MAX_PROMPT_LENGTH = 2000;
function sanitize(text, max = MAX_PROMPT_LENGTH) {
    if (!text)
        return "";
    return text.length > max ? text.slice(0, max) : text;
}
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
        const wallet = req.query.wallet ||
            req.headers["x-wallet-address"] ||
            "";
        const pref = wallet ? await (0, personalizationEngine_1.getWalletPreferences)(wallet) : "";
        const systemPrompt = sanitize(pref || "You are a helpful DeFi assistant.", MAX_PROMPT_LENGTH);
        const userContent = sanitize(message.content, MAX_PROMPT_LENGTH);
        // Load last 5 exchanges for this wallet
        const historyDocs = wallet
            ? await chatMessage_1.default.find({ wallet })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean()
            : [];
        const history = historyDocs
            .reverse()
            .map((m) => ({
            role: m.role,
            content: sanitize(m.content, MAX_PROMPT_LENGTH),
        }));
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                ...history,
                { role: message.role, content: userContent },
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
        if (wallet) {
            await chatMessage_1.default.create({
                wallet,
                role: message.role,
                content: userContent,
            });
            await chatMessage_1.default.create({
                wallet,
                role: "assistant",
                content: reply.content,
            });
        }
        res.json({ reply });
    }
    catch (err) {
        console.error("Chat controller error:", err);
        res.status(500).json({ error: "Failed to process chat message." });
    }
});
exports.default = router;
