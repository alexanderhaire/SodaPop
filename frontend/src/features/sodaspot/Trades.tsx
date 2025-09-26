import { useSoda } from "./store";
import type { State } from "./store";
export default function Trades() {
  const trades = useSoda((s: State) => s.trades);
  return (
    <div className="p-3">
      <div className="flex justify-between text-xs text-zinc-400 mb-1"><span>Recent Trades</span></div>
      <div className="space-y-1 max-h-[200px] overflow-auto pr-1">
        {trades.map((t, i) => (
          <div key={i} className="grid grid-cols-3 text-sm">
            <div className={t.taker==="buy" ? "text-emerald-400" : "text-rose-400"}>{t.price.toFixed(6)}</div>
            <div>{t.size.toFixed(4)} sh</div>
            <div className="text-zinc-400">{new Date(t.ts).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
