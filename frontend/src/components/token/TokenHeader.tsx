interface TokenHeaderProps {
  name: string;
  symbol: string;
  ageLabel: string;
  authorityShort: string;
}

export function TokenHeader({ name, symbol, ageLabel, authorityShort }: TokenHeaderProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-xl font-bold leading-tight">{name}</h1>
          <span className="text-sm font-semibold text-zinc-400">{symbol}</span>
          <div className="mt-1 flex items-center gap-3 text-sm text-zinc-400">
            <span className="inline-flex items-center gap-1">Listed</span>
            <span>•</span>
            <span>{ageLabel}</span>
            <span className="inline-flex items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 text-xs">ID {authorityShort}</span>
          </div>
        </div>
        <div className="text-right text-sm text-zinc-400">
          <div>Stable partner</div>
          <div className="font-semibold text-zinc-200">SodaPop Racing</div>
        </div>
      </div>
    </div>
  );
}
