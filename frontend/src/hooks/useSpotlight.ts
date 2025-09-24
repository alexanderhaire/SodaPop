import { useQuery } from "@tanstack/react-query";

export interface SpotlightToken {
  mint: string;
  name: string;
  symbol: string;
  imageUrl: string | null;
  creatorWallet: string;
  tx: string;
  decimals: number;
  createdAt: string;
  creatorAmount?: string;
}

const fetchSpotlight = async (): Promise<SpotlightToken[]> => {
  const response = await fetch("/api/spotlight", {
    headers: { "accept": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to load spotlight tokens");
  }

  return response.json();
};

export const useSpotlight = () =>
  useQuery({
    queryKey: ["spotlight"],
    queryFn: fetchSpotlight,
    staleTime: 30_000,
  });
