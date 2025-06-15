"use strict";
// src/services/aiService.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssistantReply = getAssistantReply;
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
async function getAssistantReply(message) {
    const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a helpful DeFi assistant." },
            { role: "user", content: message },
        ],
    });
    return chatCompletion.choices[0].message.content || "No response.";
}
