import { useEffect } from "react";
import { refresh, useSoda, makeEngine } from "./store";
import CandleChart from "./CandleChart";
import OrderBook from "./OrderBook";
import Trades from "./Trades";
import Ticket from "./Ticket";
import Metrics from "./Metrics";

type Props = {
  totalShares?: number;
  issuedShares?: number;
  treasuryAskPrice?: number; // starting quote in SOL/share
};

export default function SodaSpot(props: Props) {
  // Boot with item params if provided
  useEffect(() => {
    if (props.totalShares) {
      useSoda.setState({
        engine: makeEngine({
          totalShares: props.totalShares ?? 10,
          issuedShares: props.issuedShares ?? 0,
          treasuryAskPrice: props.treasuryAskPrice ?? 0.25,
        }),
        trades: [], candles: [], book: undefined, last: undefined
      });
    }
    refresh();
    const iv = setInterval(refresh, 1500);
    return () => clearInterval(iv);
  }, [props.totalShares, props.issuedShares, props.treasuryAskPrice]);

  const last = useSoda(s=>s.last);
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-9 space-y-4">
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="px-4 py-2 text-sm text-zinc-400">SodaPop Shares • {last?.toFixed(6) ?? "—"} SOL/share</div>
          <CandleChart />
        </div>
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800"><Trades /></div>
      </div>
      <div className="col-span-3 space-y-4">
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800"><Ticket /></div>
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800"><OrderBook /></div>
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800"><Metrics /></div>
      </div>
    </div>
  );
}
