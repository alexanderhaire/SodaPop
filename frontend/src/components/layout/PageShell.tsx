import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LEX } from "../../domain/lexicon";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-900 bg-zinc-950/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            Stable Exchange
          </Link>
          <nav className="flex items-center gap-3 text-sm text-zinc-400">
            <Link to="/horse/TROLL" className="hover:text-zinc-100">
              Listings
            </Link>
            <Link to="/create" className="hover:text-zinc-100">
              Guides
            </Link>
          </nav>
          <a
            href="/create"
            className="inline-flex items-center rounded-xl bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
          >
            {LEX.createCta}
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
