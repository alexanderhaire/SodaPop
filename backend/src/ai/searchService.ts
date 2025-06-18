import OpenAI from "openai";
import { OPENAI_API_KEY } from "../utils/config";
// Import JS models with require to avoid typing issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Item = require("../models/item");
import { cosineSimilarity } from "../utils/vectorMath";
import { getWalletAffinities } from "./personalizationEngine";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function searchItems(
  query: string,
  wallet = "",
  top = 10
): Promise<any[]> {
  if (!query) return [];
  const allItems = (await Item.find().lean()) as any[];
  if (!allItems.length) return [];

  const embed = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  const queryVec = embed.data[0]?.embedding || [];
  if (!queryVec.length) return allItems.slice(0, top);

  const affinities = wallet ? await getWalletAffinities(wallet) : {};
  const scored = allItems.map((it: any) => {
    const sim = cosineSimilarity(queryVec, it.embedding || []);
    const affinity = affinities[String(it._id)] || 0;
    return { item: it, score: sim + affinity };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, top)
    .map((s) => s.item);
}
