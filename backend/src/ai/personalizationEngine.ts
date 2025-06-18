// Import JS models with require to avoid typing issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const User = require("../models/user");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Item = require("../models/item");
import { estimateTokens, stripSensitiveValues } from "./promptUtils";

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
    };
  }
  user.interactions[itemId][action] =
    (user.interactions[itemId][action] || 0) + 1;
  user.interactions[itemId].lastInteraction = new Date();
  await user.save();
}

function scoreInteraction(data: any): number {
  if (!data) return 0;
  const recency = data.lastInteraction ? new Date(data.lastInteraction).getTime() : 0;
  return (
    (data.viewed || 0) +
    2 * (data.favorited || 0) +
    3 * (data.purchased || 0) +
    recency / 1000000000000
  );
}

export async function getRankedItems(wallet: string): Promise<any[]> {
  const items = await Item.find().lean();
  if (!wallet) return items;
  const user = await User.findOne({ walletAddress: wallet }).lean();
  if (!user || !user.interactions) return items;
  const interactions: any = user.interactions;
  return items.sort((a: any, b: any) => {
    const sa = scoreInteraction(interactions[a._id]);
    const sb = scoreInteraction(interactions[b._id]);
    return sb - sa;
  });
}

export async function getWalletPreferences(wallet: string): Promise<string> {
  const user = await User.findOne({ walletAddress: wallet }).lean();
  if (!user || !user.interactions) return "";
  const entries = Object.entries(user.interactions) as [string, any][];
  entries.sort(
    (a, b) => scoreInteraction(b[1]) - scoreInteraction(a[1])
  );
  return entries
    .slice(0, 3)
    .map(
      ([itemId, d]) =>
        `Item ${itemId} viewed ${d.viewed || 0} times, favorited ${
          d.favorited || 0
        }, purchased ${d.purchased || 0}`
    )
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
