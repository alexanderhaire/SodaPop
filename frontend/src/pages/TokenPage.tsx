import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";
import { TokenHeader } from "../components/token/TokenHeader";
import { MarketCapCard } from "../components/token/MarketCapCard";
import { TokenChart } from "../components/token/TokenChart";
import { OrderPanel } from "../components/trade/OrderPanel";
import { PositionCard } from "../components/token/PositionCard";
import { ExpensesCard } from "../components/token/ExpensesCard";
import { ChatCard } from "../components/token/ChatCard";
import { LEX } from "../domain/lexicon";

const toAuthorityShort = (value: string) => value.slice(0, 4).toUpperCase();

export default function TokenPage() {
  const { symbol = "TROLL" } = useParams();
  const formattedName = `${LEX.entitySingular} ${symbol}`;
  const ageLabel = "Foaled 2019";
  const marketCapUSD = 275000;
  const athUSD = 310000;
  const position = {
    unitsHeld: 8,
    costBasisUSD: 160000,
    currentValueUSD: 184000,
    profitPct: 15.0,
  };

  const chartPoints = useMemo(
    () =>
      Array.from({ length: 24 }, (_, index) => ({
        time: `${index}:00`,
        value: 240000 + Math.sin(index / 3) * 6000,
      })),
    []
  );

  return (
    <PageShell>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <TokenHeader
            name={formattedName}
            symbol={symbol}
            ageLabel={ageLabel}
            authorityShort={toAuthorityShort(symbol)}
          />
          <MarketCapCard marketCapUSD={marketCapUSD} athUSD={athUSD} />
          <TokenChart points={chartPoints} />
        </div>
        <div className="space-y-4">
          <OrderPanel baseSymbol={symbol} />
          <PositionCard
            symbol={symbol}
            unitsHeld={position.unitsHeld}
            costBasisUSD={position.costBasisUSD}
            currentValueUSD={position.currentValueUSD}
            profitPct={position.profitPct}
          />
          <ExpensesCard />
          <ChatCard />
        </div>
      </div>
    </PageShell>
  );
}
