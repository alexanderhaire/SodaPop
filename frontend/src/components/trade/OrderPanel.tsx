import { FormEvent, useState } from "react";
import { CURRENCY, LEX } from "../../domain/lexicon";

export interface OrderPanelSubmitPayload {
  side: "buy" | "sell";
  quantity: number;
  quoteAmount: number;
}

interface Props {
  quoteSymbol?: string;
  baseSymbol: string;
  loggedIn?: boolean;
  onSubmit?: (payload: OrderPanelSubmitPayload) => void;
}

export function OrderPanel({
  quoteSymbol = CURRENCY.quote,
  baseSymbol,
  loggedIn = false,
  onSubmit,
}: Props) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState(0);
  const [quoteAmount, setQuoteAmount] = useState(0);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loggedIn) {
      return;
    }

    onSubmit?.({ side, quantity, quoteAmount });
  };

  const primaryCTA = loggedIn
    ? `${side === "buy" ? LEX.primaryActionBuy : LEX.primaryActionSell} ${baseSymbol}`
    : LEX.loginCta;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setSide("buy")}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
            side === "buy"
              ? "bg-emerald-500 text-zinc-950"
              : "bg-zinc-900 text-zinc-400 hover:text-zinc-100"
          }`}
        >
          {LEX.primaryActionBuy}
        </button>
        <button
          type="button"
          onClick={() => setSide("sell")}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
            side === "sell"
              ? "bg-emerald-500 text-zinc-950"
              : "bg-zinc-900 text-zinc-400 hover:text-zinc-100"
          }`}
        >
          {LEX.primaryActionSell}
        </button>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <label className="block text-sm text-zinc-400">
          Quantity ({baseSymbol})
          <input
            type="number"
            min={0}
            step="any"
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
          />
        </label>

        <label className="block text-sm text-zinc-400">
          Amount
          <div className="mt-1 flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2">
            <input
              type="number"
              min={0}
              step="any"
              value={quoteAmount}
              onChange={(event) => setQuoteAmount(Number(event.target.value))}
              className="w-full bg-transparent text-sm text-zinc-100 focus:outline-none"
            />
            <div className="flex items-center gap-1 text-sm text-zinc-300">
              <span>{quoteSymbol}</span>
              <img src={CURRENCY.iconUrl} alt={quoteSymbol} className="h-4 w-4" />
            </div>
          </div>
        </label>

        <button
          type="submit"
          className={`w-full rounded-xl px-4 py-2 text-sm font-semibold transition ${
            loggedIn
              ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
              : "bg-zinc-800 text-zinc-300"
          }`}
        >
          {primaryCTA}
        </button>
      </form>
    </div>
  );
}
