import { LEX } from "../../domain/lexicon";

interface MarketCapCardProps {
  marketCapUSD: number;
  athUSD: number;
}

const usd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 1000 ? 2 : 0,
  }).format(value);

export function MarketCapCard({ marketCapUSD, athUSD }: MarketCapCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="mb-2 text-sm text-zinc-400">{LEX.marketCapLabel}</div>
      <div className="text-2xl font-semibold text-zinc-100">{usd(marketCapUSD)}</div>
      <div className="mt-1 text-xs text-zinc-400">All-time high {usd(athUSD)}</div>
    </div>
  );
}
