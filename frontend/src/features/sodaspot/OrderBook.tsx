import { useSoda } from "./store";
import type { State } from "./store";
function Row({ p, s, side }: { p: number; s: number; side: "bid"|"ask" }) {
  return (
    <div className="grid grid-cols-3 text-sm py-0.5">
      <div className={side === "bid" ? "text-emerald-400" : "text-rose-400"}>{p.toFixed(6)}</div>
      <div>{s.toFixed(4)}</div>
      <div className="text-zinc-400">{(p*s).toFixed(4)} SOL</div>
    </div>
  );
}
export default function OrderBook() {
  const book = useSoda((s: State) => s.book);
  if (!book) return <div className="p-3 text-zinc-400">Loading book…</div>;
  const spread = book.bestAsk && book.bestBid ? (book.bestAsk - book.bestBid) : 0;
  return (
    <div className="p-3">
      <div className="flex justify-between text-xs text-zinc-400 mb-1">
        <span>Order Book (SOL/share)</span>
        <span>Spread: {spread.toFixed(6)}</span>
      </div>
      <div className="space-y-1">
        {book.asks.map((l, i) => <Row key={"a"+i} p={l.price} s={l.size} side="ask" />)}
        <div className="h-[1px] bg-zinc-800 my-1" />
        {book.bids.map((l, i) => <Row key={"b"+i} p={l.price} s={l.size} side="bid" />)}
      </div>
    </div>
  );
}
