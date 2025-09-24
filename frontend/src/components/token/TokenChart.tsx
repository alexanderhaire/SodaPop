import { LEX } from "../../domain/lexicon";

interface TokenChartProps {
  points: Array<{ time: string; value: number }>;
}

export function TokenChart({ points }: TokenChartProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-zinc-300">{LEX.chartPrimaryLabel}</div>
          <div className="text-xs text-zinc-500">Rolling 24h</div>
        </div>
        <div className="flex items-center gap-4 p-2">
          <button className="text-sm font-semibold text-zinc-400 hover:text-zinc-100">24h</button>
          <button className="text-sm text-zinc-400 hover:text-zinc-100">Trades</button>
          <button className="text-sm text-zinc-400 hover:text-zinc-100">Hide markers</button>
        </div>
      </div>
      <div className="h-48 px-4 py-6">
        <div className="flex h-full items-center justify-center text-sm text-zinc-500">
          Chart placeholder ({points.length} pts)
        </div>
      </div>
    </div>
  );
}
