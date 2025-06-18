import OpenAI from "openai";
import { OPENAI_API_KEY } from "../utils/config";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function generateTitleAndDescription(image: string): Promise<{ title: string; description: string }> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Provide a short title and one sentence description for the item in this image. Format as: Title: <title>\nDescription: <description>" },
          { type: "image_url", image_url: { url: image } }
        ] as any,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content || "";
  const [first, ...rest] = text.split("\n");
  const title = first.replace(/^Title:\s*/i, "").trim();
  const descriptionLine = rest.join(" ") || "";
  const description = descriptionLine.replace(/^Description:\s*/i, "").trim();
  return { title, description };
}
