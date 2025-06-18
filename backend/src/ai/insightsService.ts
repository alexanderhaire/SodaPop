// Aggregates user interaction data to derive insights for sellers
import { Model } from "mongoose";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const User = require("../models/user");

export interface ItemInsight {
  itemId: string;
  views: number;
  favorites: number;
  purchases: number;
  uniqueUsers: number;
}

export async function generateItemInsights(): Promise<ItemInsight[]> {
  const users = await User.find().lean();
  const map: Record<string, { views: number; favorites: number; purchases: number; users: Set<string> }> = {};

  for (const user of users) {
    const wallet = String((user as any).walletAddress || "");
    const interactions = (user as any).interactions || {};
    for (const [itemId, data] of Object.entries(interactions) as [string, any][]) {
      if (!map[itemId]) {
        map[itemId] = { views: 0, favorites: 0, purchases: 0, users: new Set() };
      }
      map[itemId].views += data.viewed || 0;
      map[itemId].favorites += data.favorited || 0;
      map[itemId].purchases += data.purchased || 0;
      map[itemId].users.add(wallet);
    }
  }

  return Object.entries(map)
    .map(([itemId, data]) => ({
      itemId,
      views: data.views,
      favorites: data.favorites,
      purchases: data.purchases,
      uniqueUsers: data.users.size,
    }))
    .sort((a, b) => b.purchases - a.purchases || b.views - a.views);
}
