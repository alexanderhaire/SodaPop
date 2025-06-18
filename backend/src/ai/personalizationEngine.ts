// Import JS models with require to avoid typing issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const User = require("../models/user");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Item = require("../models/item");
import { estimateTokens, stripSensitiveValues } from "./promptUtils";

const HALF_LIFE_DAYS = 7; // recent interactions should weigh more over ~1 week
const DECAY_LAMBDA =
  Math.log(2) / (HALF_LIFE_DAYS * 24 * 60 * 60 * 1000); // ms based decay

function applyDecay(value: number, last: Date | undefined, now: number): number {
  if (!value || !last) return 0;
  const delta = now - new Date(last).getTime();
  return value * Math.exp(-DECAY_LAMBDA * delta);
}

export type InteractionAction = "viewed" | "favorited" | "purchased";

export async function trackUserInteraction(
  wallet: string,
  itemId: string,
  action: InteractionAction
): Promise<void> {
  if (!wallet || !itemId) return;
  const user = await User.findOne({ walletAddress: wallet });
  if (!user) return;
  if (!user.interactions) {
    user.interactions = {};
  }
  if (!user.interactions[itemId]) {
    user.interactions[itemId] = {
      viewed: 0,
      favorited: 0,
      purchased: 0,
      lastInteraction: new Date(),
      viewScore: 0,
      purchaseScore: 0,
      lastView: new Date(),
      lastPurchase: new Date(),
    };
  }
  const now = new Date();
  const data = user.interactions[itemId];
  // ensure new fields exist for legacy records
  data.viewScore = data.viewScore || 0;
  data.purchaseScore = data.purchaseScore || 0;
  data.lastView = data.lastView || now;
  data.lastPurchase = data.lastPurchase || now;
  switch (action) {
    case "viewed":
      data.viewed = (data.viewed || 0) + 1;
      data.viewScore = applyDecay(data.viewScore || 0, data.lastView, now.getTime()) + 1;
      data.lastView = now;
      break;
    case "purchased":
      data.purchased = (data.purchased || 0) + 1;
      data.purchaseScore = applyDecay(data.purchaseScore || 0, data.lastPurchase, now.getTime()) + 1;
      data.lastPurchase = now;
      break;
    case "favorited":
      data.favorited = (data.favorited || 0) + 1;
      break;
  }
  data.lastInteraction = now;
  await user.save();
}

function scoreInteraction(data: any, now = Date.now()): number {
  if (!data) return 0;
  const views = applyDecay(data.viewScore || 0, data.lastView, now);
  const purchases = applyDecay(data.purchaseScore || 0, data.lastPurchase, now);
  const favorites = data.favorited || 0;
  return views + 2 * favorites + 3 * purchases;
}

export async function getRankedItems(wallet: string): Promise<any[]> {
  const items = await Item.find().lean();
  if (!wallet) return items;
  const user = await User.findOne({ walletAddress: wallet }).lean();
  if (!user || !user.interactions) return items;
  const interactions: any = user.interactions;
  return items.sort((a: any, b: any) => {
    const now = Date.now();
    const sa = scoreInteraction(interactions[a._id], now);
    const sb = scoreInteraction(interactions[b._id], now);
    return sb - sa;
  });
}

export async function getWalletAffinities(wallet: string): Promise<Record<string, number>> {
  const user = await User.findOne({ walletAddress: wallet }).lean();
  if (!user || !user.interactions) return {};
  const now = Date.now();
  const scores: Record<string, number> = {};
  for (const [itemId, data] of Object.entries(user.interactions)) {
    scores[itemId] = scoreInteraction(data, now);
  }
  return scores;
}

export async function getWalletPreferences(wallet: string): Promise<string> {
  const user = await User.findOne({ walletAddress: wallet }).lean();
  if (!user || !user.interactions) return "";
  const now = Date.now();
  const entries = Object.entries(user.interactions) as [string, any][];
  entries.sort((a, b) => scoreInteraction(b[1], now) - scoreInteraction(a[1], now));
  return entries
    .slice(0, 3)
    .map(([itemId, d]) => `Item ${itemId} score ${scoreInteraction(d, now).toFixed(2)}`)
    .join("; ");
}

export async function buildPersonalizationPrompt(wallet: string): Promise<string> {
  const user = await User.findOne({ walletAddress: wallet }).lean();
  if (!user || !user.interactions) return '';
  const entries = Object.entries(user.interactions) as [string, any][];
  entries.sort((a, b) => scoreInteraction(b[1]) - scoreInteraction(a[1]));

  let prompt = '';
  for (const [itemId, d] of entries) {
    const item = await Item.findById(itemId).lean();
    const name = stripSensitiveValues(item?.name || `Item ${itemId}`);
    const summary = `${name} viewed ${d.viewed || 0} times, favorited ${d.favorited || 0}, purchased ${d.purchased || 0}`;
    const candidate = prompt ? `; ${summary}` : summary;
    if (estimateTokens(prompt + candidate) > 4000) break;
    prompt += candidate;
  }
  return prompt;
}
