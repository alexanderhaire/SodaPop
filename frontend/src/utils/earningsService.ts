import { readContracts } from '@wagmi/core';
import { HORSE_TOKEN_ADDRESS, horseTokenABI } from './contractConfig';
import placeholderItems from '../mocks/items.json';

export interface ItemStats {
  id: string;
  name: string;
  goal: number;
  my_share: number;
  total_earned: number;
  progress_to_goal: number;
}

interface CacheEntry {
  timestamp: number;
  data: ItemStats[];
}

const cache: Record<string, CacheEntry> = {};
const CACHE_DURATION_MS = 60 * 1000;

export async function fetchEarningsStats(address: string, chainId: number): Promise<ItemStats[]> {
  const cached = cache[address];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
    return cached.data;
  }
  try {
    const res = await fetch(`/api/earnings/${address}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: any[] = await res.json();

    const contracts = data.map((_item, idx: number) => ({
      address: HORSE_TOKEN_ADDRESS,
      abi: horseTokenABI,
      functionName: 'balanceOf',
      args: [address, idx],
    }));

    const results = await readContracts(undefined as any, { contracts, allowFailure: true, chainId });

    const updated: ItemStats[] = data.map((item: any, idx: number) => ({
      ...item,
      my_share: results[idx].status === 'success' && results[idx].result ? Number(results[idx].result) : 0,
    }));

    cache[address] = { timestamp: Date.now(), data: updated };
    return updated;
  } catch (err) {
    console.error('fetchEarningsStats error:', err);
    return placeholderItems.map((p: any) => ({
      id: p.id,
      name: p.name,
      goal: 0,
      total_earned: 0,
      progress_to_goal: 0,
      my_share: 0,
    }));
  }
}
