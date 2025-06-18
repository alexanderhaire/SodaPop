import OpenAI from "openai";
import { OPENAI_API_KEY } from "../utils/config";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Item = require("../models/item");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const User = require("../models/user");

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function embed(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return res.data[0]?.embedding || [];
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function averageVectors(vectors: number[][]): number[] {
  if (!vectors.length) return [];
  const avg = new Array(vectors[0].length).fill(0);
  for (const v of vectors) {
    for (let i = 0; i < v.length; i++) {
      avg[i] += v[i];
    }
  }
  for (let i = 0; i < avg.length; i++) {
    avg[i] /= vectors.length;
  }
  return avg;
}

async function ensureItemEmbeddings(): Promise<void> {
  const items = await Item.find({ embedding: { $exists: false }, description: { $exists: true } });
  for (const item of items) {
    try {
      const vector = await embed(item.description);
      item.embedding = vector;
      await item.save();
    } catch (err) {
      console.error("Failed to embed item", item.id, err);
    }
  }
}

export async function getRecommendedItems(wallet: string, top = 5) {
  await ensureItemEmbeddings();

  const user = await User.findOne({ walletAddress: wallet });
  if (!user || !user.interactions) {
    const popular = await Item.find({}).sort({ sharesSold: -1 }).limit(top * 2);
    return popular.sort(() => Math.random() - 0.5).slice(0, top);
  }

  const historyIds = Object.entries(user.interactions)
    .filter(([, d]: any) => d.favorited || d.purchased)
    .map(([id]) => id);

  if (!historyIds.length) {
    const popular = await Item.find({}).sort({ sharesSold: -1 }).limit(top * 2);
    return popular.sort(() => Math.random() - 0.5).slice(0, top);
  }

  const historyItems = await Item.find({ _id: { $in: historyIds }, embedding: { $exists: true } });
  if (!historyItems.length) {
    const popular = await Item.find({}).sort({ sharesSold: -1 }).limit(top * 2);
    return popular.sort(() => Math.random() - 0.5).slice(0, top);
  }

  const userProfile = averageVectors(historyItems.map((i: any) => i.embedding));

  const candidates = await Item.find({ embedding: { $exists: true } });
  const scored = candidates.map((item: any) => ({
    item,
    score: cosineSimilarity(userProfile, item.embedding || []),
  }));

  scored.sort(
    (a: { score: number }, b: { score: number }) => b.score - a.score
  );
  return scored.slice(0, top).map((s: { item: any }) => s.item);
}
