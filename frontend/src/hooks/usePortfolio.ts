import { useQuery } from "@tanstack/react-query";

export interface PortfolioToken {
  mint: string;
  name: string;
  symbol: string;
  imageUrl: string | null;
  creatorWallet: string;
  tx: string;
  decimals: number;
  createdAt: string;
  creatorAmount?: string;
  amount?: string;
  isCreator?: boolean;
}

const fetchPortfolio = async (wallet: string): Promise<PortfolioToken[]> => {
  const query = new URLSearchParams({ wallet });
  const response = await fetch(`/api/portfolio?${query.toString()}`, {
    headers: { "accept": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to load portfolio");
  }

  return response.json();
};

export const usePortfolio = (wallet: string) =>
  useQuery({
    queryKey: ["portfolio", wallet],
    enabled: Boolean(wallet),
    queryFn: () => fetchPortfolio(wallet),
    staleTime: 15_000,
  });
