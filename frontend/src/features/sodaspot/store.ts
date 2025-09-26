import { create } from "zustand";
import { Engine, MarketConfig, Trade, Book } from "./engine";

type Candle = { t: number; o: number; h: number; l: number; c: number };
export type State = {
  engine: Engine;
  book?: Book;
  trades: Trade[];
  candles: Candle[];
  last?: number;
  vwap?: number;
  twap?: number;
  vol?: number;
};

export const makeEngine = (cfg: MarketConfig) => new Engine(cfg);

function buildCandle(c: Candle | undefined, price: number, ts: number): Candle {
  const bucket = Math.floor(ts/60000)*60000;
  if (!c || c.t !== bucket) return { t: bucket, o: price, h: price, l: price, c: price };
  return { t: c.t, o: c.o, h: Math.max(c.h, price), l: Math.min(c.l, price), c: price };
}

export const useSoda = create<State>(() => ({
  engine: makeEngine({ totalShares: 10, issuedShares: 3, treasuryAskPrice: 0.25 }),
  trades: [],
  candles: [],
}));

export function refresh() {
  const e = useSoda.getState().engine;
  const book = e.getBook();
  const trades = e.getTrades();
  let candles = useSoda.getState().candles.slice();
  if (trades[0]) {
    const lastC = candles[0];
    const next = buildCandle(lastC, trades[0].price, trades[0].ts);
    candles = lastC && lastC.t === next.t ? [next, ...candles.slice(1)] : [next, ...candles].slice(0, 500);
  }
  useSoda.setState({
    book, trades, candles,
    last: e.getLastPrice(),
    vwap: e.vwap(24),
    twap: e.twap(5),
    vol: e.realizedVol()
  });
}

export function place(params: { side: "buy"|"sell"; type: "limit"|"market"; price?: number; size: number }) {
  const e = useSoda.getState().engine;
  e.place({ id: crypto.randomUUID(), ts: Date.now(), ...params });
  refresh();
}
