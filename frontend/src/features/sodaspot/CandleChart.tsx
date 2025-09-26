import { useLayoutEffect, useRef } from "react";
import { createChart, IChartApi, UTCTimestamp } from "lightweight-charts";
import { useSoda, refresh } from "./store";
import type { State } from "./store";

export default function CandleChart() {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || chartRef.current) return;

    const chart = createChart(el, {
      width: el.clientWidth || 600,
      height: Math.max(el.clientHeight || 0, 380),
      rightPriceScale: { visible: true },
      timeScale: { timeVisible: true },
    });
    const series = chart.addCandlestickSeries();
    chartRef.current = chart;

    const draw = () => {
      const data = useSoda
        .getState()
        .candles.slice()
        .reverse()
        .map((c): {
          time: UTCTimestamp;
          open: number;
          high: number;
          low: number;
          close: number;
        } => ({
          time: (c.t / 1000) as UTCTimestamp,
          open: c.o,
          high: c.h,
          low: c.l,
          close: c.c,
        }));
      series.setData(data);
    };

    draw();

    const unsub = useSoda.subscribe((state: State, prev: State) => {
      if (state.candles !== prev.candles) draw();
    });

    const ro = new ResizeObserver(() => {
      const node = ref.current;
      if (!node || !node.isConnected) return;
      chart.applyOptions({ width: node.clientWidth || 0 });
    });

    ro.observe(el);

    const iv = setInterval(refresh, 1000);

    return () => {
      clearInterval(iv);
      unsub();
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  return <div className="w-full min-h-[320px] h-[380px]" ref={ref} />;
}
