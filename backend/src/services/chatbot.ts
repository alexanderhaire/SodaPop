import OpenAI from "openai";
import { OPENAI_API_KEY } from "../utils/config";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function getChatResponse(userId: string, message: string): Promise<string> {
  // For now we ignore userId but it can be used for personalization later
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful DeFi assistant." },
      { role: "user", content: message }
    ]
  });

  return completion.choices[0]?.message?.content || "";
}
