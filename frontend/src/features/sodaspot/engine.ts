// Lightweight central limit order book (CLOB) + analytics for SodaPop shares (SOL per share)
export type Side = "buy" | "sell";
export type OrderType = "limit" | "market";
export type Order = { id: string; side: Side; type: OrderType; price?: number; size: number; ts: number };
export type Trade = { price: number; size: number; taker: Side; ts: number };
export type Level = { price: number; size: number };
export type Book = { bids: Level[]; asks: Level[]; bestBid?: number; bestAsk?: number; ts: number };

export type MarketConfig = {
  totalShares: number;          // e.g., 10
  issuedShares: number;         // e.g., 3
  treasuryAskPrice: number;     // initial ref price in SOL/share (e.g., 0.25)
  seedDepth?: number;           // how many price levels to seed
};

export class Engine {
  private bids: Level[] = [];
  private asks: Level[] = [];
  private trades: Trade[] = [];
  private lastPrice?: number;

  constructor(public cfg: MarketConfig) {
    this.seedBook();
  }

  private pushTrade(t: Trade) {
    this.trades.unshift(t);
    this.trades = this.trades.slice(0, 5000);
    this.lastPrice = t.price;
  }

  getBook(): Book {
    const bestBid = this.bids[0]?.price;
    const bestAsk = this.asks[0]?.price;
    return { bids: this.bids.slice(0, 20), asks: this.asks.slice(0, 20), bestBid, bestAsk, ts: Date.now() };
  }

  getTrades(): Trade[] { return this.trades.slice(0, 200); }
  getLastPrice(): number | undefined { return this.lastPrice; }

  place(o: Order): { filled: Trade[]; remaining?: Order } {
    const filled: Trade[] = [];
    const match = (book: Level[], takerSide: Side) => {
      while (o.size > 0 && book.length) {
        const level = book[0];
        const x = Math.min(o.size, level.size);
        level.size -= x;
        if (level.size <= 1e-8) book.shift();
        o.size -= x;
        const price = level.price;
        filled.push({ price, size: x, taker: takerSide, ts: Date.now() });
        this.pushTrade(filled[filled.length - 1]);
      }
    };

    if (o.type === "market") {
      if (o.side === "buy") match(this.asks, "buy");
      else match(this.bids, "sell");
    } else {
      // First, cross against opposite if marketable
      if (o.side === "buy") {
        while (o.size > 0 && this.asks.length && o.price! >= this.asks[0].price) {
          match(this.asks, "buy");
        }
        if (o.size > 0) this.addLevel(this.bids, o.price!, o.size, "bid");
      } else {
        while (o.size > 0 && this.bids.length && o.price! <= this.bids[0].price) {
          match(this.bids, "sell");
        }
        if (o.size > 0) this.addLevel(this.asks, o.price!, o.size, "ask");
      }
    }
    return { filled, remaining: o.size > 0 ? o : undefined };
  }

  private addLevel(arr: Level[], price: number, size: number, side: "bid"|"ask") {
    const idx = arr.findIndex(l => l.price === price);
    if (idx >= 0) arr[idx].size += size;
    else {
      arr.push({ price, size });
      arr.sort(side === "bid" ? (a,b)=> b.price - a.price : (a,b)=> a.price - b.price);
    }
  }

  private seedBook() {
    const L = this.cfg.seedDepth ?? 12;
    const p0 = this.cfg.treasuryAskPrice;
    // Treasury sells remaining shares on asks
    const remaining = Math.max(this.cfg.totalShares - this.cfg.issuedShares, 0);
    const perLevel = Math.max(remaining / L, 0.05); // ~small clips
    for (let i=0;i<L;i++) {
      const p = +(p0 * (1 + i*0.005)).toFixed(6); // 0.5% ticks up
      this.addLevel(this.asks, p, perLevel, "ask");
    }
    // Seed bids for price discovery
    const bidFloat = this.cfg.issuedShares * 0.5; // assume holders place some bids
    const perBid = Math.max(bidFloat / L, 0.03);
    for (let i=1;i<=L;i++) {
      const p = +(p0 * (1 - i*0.005)).toFixed(6);
      this.addLevel(this.bids, p, perBid, "bid");
    }
    this.lastPrice = p0;
  }

  // ---- analytics ----
  vwap(hours = 24): number | undefined {
    const cutoff = Date.now() - hours*3600_000;
    let pv=0, v=0;
    for (const t of this.trades) {
      if (t.ts < cutoff) break;
      pv += t.price * t.size; v += t.size;
    }
    return v > 0 ? pv/v : this.lastPrice;
  }
  twap(minutes = 5): number | undefined {
    const cutoff = Date.now() - minutes*60_000;
    const xs = this.trades.filter(t=>t.ts>=cutoff).map(t=>t.price);
    if (!xs.length) return this.lastPrice;
    return xs.reduce((a,b)=>a+b,0)/xs.length;
  }
  // Realized volatility (per-minute, last 60m), annualized
  realizedVol(): number | undefined {
    const cutoff = Date.now()-60*60_000;
    const ts = this.trades.filter(t=>t.ts>=cutoff).map(t=>t.price);
    if (ts.length<2) return undefined;
    const rets = [];
    for (let i=1;i<ts.length;i++) rets.push(Math.log(ts[i]/ts[i-1]));
    const mu = rets.reduce((a,b)=>a+b,0)/rets.length;
    const varr = rets.reduce((a,b)=>a+(b-mu)*(b-mu),0)/(rets.length-1);
    // minute -> annualize (525600 minutes)
    return Math.sqrt(varr) * Math.sqrt(525600);
  }
}
