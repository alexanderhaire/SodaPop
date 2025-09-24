import { LEX } from "../../domain/lexicon";

export function ChatCard() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{LEX.chatTitle}</div>
          <div className="text-xs text-zinc-400">Early partner lounge</div>
        </div>
        <button className="rounded-xl border border-zinc-700 px-3 py-1.5 text-sm font-semibold hover:bg-zinc-800">
          Join
        </button>
      </div>
    </div>
  );
}
