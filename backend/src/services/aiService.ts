import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";
import { OPENAI_API_KEY } from "../utils/config";

// Initialize the OpenAI client
const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

export type Message = {
  role: "user" | "assistant";
  content: string;
};

/**
 * sendToOpenAI: Sends a single user message to OpenAI and returns the assistant's reply.
 * In production you’d keep full conversation history; here we send just one turn.
 */
export async function sendToOpenAI(userMessage: Message): Promise<Message> {
  const messages: ChatCompletionRequestMessage[] = [
    { role: "system", content: "You are a helpful DeFi investment advisor." },
    { role: userMessage.role, content: userMessage.content }
  ];

  const completion = await openai.createChatCompletion({
    model: "gpt-4o-mini", // or "gpt-4"
    messages,
    temperature: 0.7
  });

  const aiContent =
    completion.data.choices[0].message?.content ??
    "Sorry, I didn’t understand.";
  return { role: "assistant", content: aiContent };
}
