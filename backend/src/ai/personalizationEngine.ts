// Import JS models with require to avoid typing issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const User = require("../models/user");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Horse = require("../models/horse");

export type InteractionAction = "viewed" | "favorited" | "purchased";

export async function trackUserInteraction(
  wallet: string,
  horseId: string,
  action: InteractionAction
): Promise<void> {
  if (!wallet || !horseId) return;
  const user = await User.findOne({ walletAddress: wallet });
  if (!user) return;
  if (!user.interactions) {
    user.interactions = {};
  }
  if (!user.interactions[horseId]) {
    user.interactions[horseId] = {
      viewed: 0,
      favorited: 0,
      purchased: 0,
      lastInteraction: new Date(),
    };
  }
  user.interactions[horseId][action] =
    (user.interactions[horseId][action] || 0) + 1;
  user.interactions[horseId].lastInteraction = new Date();
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

export async function getRankedHorses(wallet: string): Promise<any[]> {
  const horses = await Horse.find().lean();
  if (!wallet) return horses;
  const user = await User.findOne({ walletAddress: wallet }).lean();
  if (!user || !user.interactions) return horses;
  const interactions: any = user.interactions;
  return horses.sort((a: any, b: any) => {
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
      ([horseId, d]) =>
        `Horse ${horseId} viewed ${d.viewed || 0} times, favorited ${
          d.favorited || 0
        }, purchased ${d.purchased || 0}`
    )
    .join("; ");
}
