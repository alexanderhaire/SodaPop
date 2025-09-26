import { useEffect, useRef } from "react";
import { createChart, IChartApi, UTCTimestamp, CandlestickSeries } from "lightweight-charts";
import { useSoda, refresh } from "./store";

export default function CandleChart() {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!ref.current || chartRef.current) return;
    const chart = createChart(ref.current, { height: 380, rightPriceScale: { visible: true }, timeScale: { timeVisible: true }});
    const series = chart.addSeries(CandlestickSeries);
    chartRef.current = chart;
    const draw = () => {
      const data = useSoda.getState().candles.slice().reverse().map(c => ({
        time: (c.t/1000) as UTCTimestamp, open: c.o, high: c.h, low: c.l, close: c.c
      }));
      series.setData(data);
    };
    draw();
    const unsub = useSoda.subscribe((state, prev) => {
      if (state.candles !== prev.candles) draw();
    });
    const ro = new ResizeObserver(() => chart.applyOptions({ width: ref.current!.clientWidth }));
    ro.observe(ref.current);
    const iv = setInterval(refresh, 1000);
    return () => { clearInterval(iv); unsub(); ro.disconnect(); chart.remove(); };
  }, []);

  return <div className="w-full h-[380px]" ref={ref} />;
}
