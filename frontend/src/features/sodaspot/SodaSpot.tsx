import { useEffect } from "react";
import { refresh, useSoda, makeEngine } from "./store";
import type { State } from "./store";
import CandleChart from "./CandleChart";
import OrderBook from "./OrderBook";
import Trades from "./Trades";
import Ticket from "./Ticket";
import Metrics from "./Metrics";

type Props = {
  slug?: string;
  totalShares?: number;
  issuedShares?: number;
  treasuryAskPrice?: number; // starting quote in SOL/share
};

export default function SodaSpot(props: Props) {
  const hasMarketConfig =
    Boolean(props.slug) &&
    typeof props.totalShares === "number" &&
    typeof props.treasuryAskPrice === "number";

  useEffect(() => {
    if (!hasMarketConfig) return;

    const issued = props.issuedShares ?? 0;
    const current = useSoda.getState().engine.cfg;
    const needsRebuild =
      current.totalShares !== props.totalShares ||
      current.issuedShares !== issued ||
      current.treasuryAskPrice !== props.treasuryAskPrice;

    if (needsRebuild) {
      useSoda.setState({
        engine: makeEngine({
          totalShares: props.totalShares!,
          issuedShares: issued,
          treasuryAskPrice: props.treasuryAskPrice!,
        }),
        trades: [],
        candles: [],
        book: undefined,
        last: undefined,
        vwap: undefined,
        twap: undefined,
        vol: undefined,
      });
    }

    refresh();
    const iv = setInterval(refresh, 1500);
    return () => clearInterval(iv);
  }, [hasMarketConfig, props.slug, props.totalShares, props.issuedShares, props.treasuryAskPrice]);

  if (!hasMarketConfig) {
    return (
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-6 text-sm text-zinc-400">
        Loading market…
      </div>
    );
  }

  const last = useSoda((s: State) => s.last);
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-9 space-y-4">
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="px-4 py-2 text-sm text-zinc-400">
            SodaPop Shares • {last?.toFixed(6) ?? "—"} SOL/share
          </div>
          <CandleChart />
        </div>
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <Trades />
        </div>
      </div>
      <div className="col-span-3 space-y-4">
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <Ticket />
        </div>
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <OrderBook />
        </div>
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <Metrics />
        </div>
      </div>
    </div>
  );
}
