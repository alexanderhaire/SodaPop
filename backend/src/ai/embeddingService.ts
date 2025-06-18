import OpenAI from "openai";
// Import JS models with require to avoid typing issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Item = require("../models/item");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const User = require("../models/user");
import { OPENAI_API_KEY } from "../utils/config";
import { cosineSimilarity, averageVectors } from "../utils/vectorMath";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function getRecommendedItems(
  wallet: string,
  top: number
): Promise<any[]> {
  const allItems = (await Item.find().lean()) as any[];
  if (!wallet) return allItems.slice(0, top);

  const user = await User.findOne({ walletAddress: wallet }).lean();
  if (!user || !user.interactions) {
    return allItems.slice(0, top);
  }
  const interactedIds = Object.entries(user.interactions)
    .filter(([, d]: any) => (d.favorited || 0) > 0 || (d.purchased || 0) > 0)
    .map(([id]) => id);

  const itemMap = new Map(allItems.map((it: any) => [String(it._id), it]));
  const vectors: number[][] = [];
  for (const id of interactedIds) {
    const item = itemMap.get(id);
    if (item && Array.isArray(item.embedding) && item.embedding.length) {
      vectors.push(item.embedding);
    }
  }

  if (!vectors.length) {
    return allItems.slice(0, top);
  }

  const userVector = averageVectors(vectors);
  if (!userVector.length) {
    return allItems.slice(0, top);
  }

  const scored = allItems.map((it: any) => {
    const score = cosineSimilarity(userVector, it.embedding || []);
    return { item: it, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, top)
    .map((s) => s.item);
}
