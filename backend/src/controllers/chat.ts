import { Router, Request, Response } from "express";
import { Configuration, OpenAIApi } from "openai";
import { OPENAI_API_KEY } from "../utils/config";

const router = Router();
const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));

router.post("/message", async (req: Request, res: Response) => {
  const username = (req as any).user.username;
  console.log(\`User \${username} sent chat message:\`, req.body.message);
  const userMessage = req.body.message as { role: "user"; content: string };
  const messages = [{ role: "system", content: "You are a knowledgeable DeFi assistant." }, userMessage];
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 512,
    });
    const aiReply = completion.data.choices[0].message!;
    return res.json({ reply: aiReply });
  } catch {
    return res.status(500).json({ reply: { role: "assistant", content: "Sorry, I couldn’t reach the AI right now." } });
  }
});

export default router;
