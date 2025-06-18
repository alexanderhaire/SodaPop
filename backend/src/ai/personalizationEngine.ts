// Import JS models with require to avoid typing issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const User = require("../models/user");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Item = require("../models/item");

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

const DECAY_RATE = 0.1; // larger means faster decay per day

function scoreInteraction(data: any): number {
  if (!data) return 0;
  const now = Date.now();
  const last = data.lastInteraction ? new Date(data.lastInteraction).getTime() : now;
  const days = (now - last) / (1000 * 60 * 60 * 24);
  const decay = Math.exp(-DECAY_RATE * days);
  const base =
    (data.viewed || 0) +
    2 * (data.favorited || 0) +
    5 * (data.purchased || 0); // heavier purchase weight
  return base * decay;
}

function walletAffinity(interactions: Record<string, any>): number {
  let purchases = 0;
  for (const d of Object.values(interactions)) {
    purchases += (d as any).purchased || 0;
  }
  return purchases;
}

export async function getRankedItems(wallet: string): Promise<any[]> {
  const items = await Item.find().lean();
  if (!wallet) return items;
  const user = await User.findOne({ walletAddress: wallet }).lean();
  if (!user || !user.interactions) return items;
  const interactions: any = user.interactions;
  const affinity = walletAffinity(interactions);
  return items.sort((a: any, b: any) => {
    const sa = scoreInteraction(interactions[a._id]) * (1 + affinity / 10);
    const sb = scoreInteraction(interactions[b._id]) * (1 + affinity / 10);
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
