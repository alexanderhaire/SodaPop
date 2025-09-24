import { LEX } from "../../domain/lexicon";

interface PositionCardProps {
  symbol: string;
  unitsHeld: number;
  costBasisUSD: number;
  currentValueUSD: number;
  profitPct: number | null;
}

const usd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export function PositionCard({
  symbol,
  unitsHeld,
  costBasisUSD,
  currentValueUSD,
  profitPct,
}: PositionCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="text-xs text-zinc-400 mb-2">{LEX.positionLabel} · Activity</div>
      <div className="text-lg font-semibold text-zinc-100">{symbol}</div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-zinc-300">
        <div>
          <div className="text-xs text-zinc-500">Units held</div>
          <div className="font-semibold text-zinc-100">{unitsHeld.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500">Cost basis</div>
          <div>{usd(costBasisUSD)}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500">Current value</div>
          <div>{usd(currentValueUSD)}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500">Net change</div>
          <div>{profitPct === null ? "-" : `${profitPct.toFixed(1)}%`}</div>
        </div>
      </div>
      <div className="mt-1 text-xs text-zinc-400 flex justify-between">
        <span>Performance indicator</span>
        <span>{profitPct === null ? "-" : `${profitPct.toFixed(1)}%`}</span>
      </div>
    </div>
  );
}
