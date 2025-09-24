import { LEX } from "../../domain/lexicon";

export function ExpensesCard() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-semibold">{LEX.expensesTitle}</div>
        <span className="text-xs text-zinc-400">Pilot</span>
      </div>
      <ul className="space-y-1 text-sm text-zinc-300">
        <li className="flex justify-between">
          <span>Training/Board (mo)</span>
          <span>$1,850</span>
        </li>
        <li className="flex justify-between">
          <span>Vet/Farrier (avg/mo)</span>
          <span>$420</span>
        </li>
        <li className="flex justify-between">
          <span>Licenses/Fees</span>
          <span>$110</span>
        </li>
        <li className="flex justify-between">
          <span>Purse YTD</span>
          <span>$14,600</span>
        </li>
      </ul>
      <div className="mt-3 text-xs text-zinc-400">
        Owner statements & distributions will render here.
      </div>
    </div>
  );
}
