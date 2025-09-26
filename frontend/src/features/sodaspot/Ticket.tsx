import { place, useSoda } from "./store";
import { useState } from "react";
export default function Ticket() {
  const last = useSoda(s => s.last);
  const [side, setSide] = useState<"buy"|"sell">("buy");
  const [type, setType] = useState<"limit"|"market">("limit");
  const [price, setPrice] = useState<number | "">(last ?? "");
  const [size, setSize] = useState<number | "">("");

  const submit = () => {
    if (!size || (type==="limit" && !price)) return alert("Enter price/size");
    place({ side, type, price: type==="limit" ? Number(price) : undefined, size: Number(size) });
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex gap-2">
        <button onClick={()=>setSide("buy")} className={`px-3 py-1 rounded ${side==="buy"?"bg-emerald-600 text-white":"bg-zinc-800"}`}>Acquire</button>
        <button onClick={()=>setSide("sell")} className={`px-3 py-1 rounded ${side==="sell"?"bg-rose-600 text-white":"bg-zinc-800"}`}>Sell</button>
      </div>
      <div className="flex gap-2">
        <button onClick={()=>setType("limit")} className={`px-3 py-1 rounded ${type==="limit"?"bg-zinc-700":"bg-zinc-800"}`}>Limit</button>
        <button onClick={()=>setType("market")} className={`px-3 py-1 rounded ${type==="market"?"bg-zinc-700":"bg-zinc-800"}`}>Market</button>
      </div>
      {type==="limit" && (
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">Limit price (SOL/share)</label>
          <input className="w-full bg-zinc-900 rounded px-2 py-1" value={price} onChange={e=>setPrice(e.target.value===""?"":Number(e.target.value))} />
        </div>
      )}
      <div className="space-y-1">
        <label className="text-xs text-zinc-400">Size (shares)</label>
        <input className="w-full bg-zinc-900 rounded px-2 py-1" value={size} onChange={e=>setSize(e.target.value===""?"":Number(e.target.value))} />
      </div>
      <button onClick={submit} className={`w-full py-2 rounded ${side==="buy"?"bg-emerald-600":"bg-rose-600"} text-white`}>
        {side==="buy"?"Acquire shares":"Sell shares"}
      </button>
      <div className="text-xs text-zinc-400">
        Last: {last?.toFixed(6) ?? "—"} SOL/share
      </div>
    </div>
  );
}
