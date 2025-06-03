// src/services/aiService.ts

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getAssistantReply(message: string): Promise<string> {
  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful DeFi assistant." },
      { role: "user", content: message },
    ],
  });

  return chatCompletion.choices[0].message.content || "No response.";
}
