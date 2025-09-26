import { useSoda } from "./store";
export default function Metrics() {
  const { last, vwap, twap, vol, book } = useSoda(s => ({ last: s.last, vwap: s.vwap, twap: s.twap, vol: s.vol, book: s.book }));
  const mid = book?.bestBid && book?.bestAsk ? (book.bestBid + book.bestAsk)/2 : undefined;
  return (
    <div className="grid grid-cols-2 gap-4 p-3 text-sm">
      <div>Current (Last): <span className="font-semibold">{last?.toFixed(6) ?? "—"} SOL</span></div>
      <div>Mid / Spread: <span className="font-semibold">{mid?.toFixed(6) ?? "—"}</span> / {book?.bestAsk && book?.bestBid ? (book.bestAsk-book.bestBid).toFixed(6) : "—"}</div>
      <div>VWAP (24h): <span className="font-semibold">{vwap?.toFixed(6) ?? "—"}</span></div>
      <div>TWAP (5m): <span className="font-semibold">{twap?.toFixed(6) ?? "—"}</span></div>
      <div>Realized Vol (ann.): <span className="font-semibold">{vol ? (vol*100).toFixed(2)+"%" : "—"}</span></div>
    </div>
  );
}
