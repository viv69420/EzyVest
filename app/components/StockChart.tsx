"use client";

import { useEffect, useMemo, useState } from "react";

type HistoryPoint = { time: string; open: number; high: number; low: number; close: number; volume?: number };

type StockChartProps = {
  symbol: string;
};

export default function StockChart({ symbol }: StockChartProps) {
  const [data, setData] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/history?symbol=${encodeURIComponent(symbol)}`
        );

        const result = await response.json();

        if (!response.ok || result.error) {
          throw new Error(
            result.error || "Unable to load historical data"
          );
        }

        setData(result.data || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load historical data"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [symbol]);

  const chart = useMemo(() => {
    if (data.length === 0) return null;

    const points = [...data].reverse();

    const prices = points.map((point) => Number(point.close));

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const padding = (maxPrice - minPrice) * 0.1 || 1;

    const min = minPrice - padding;
    const max = maxPrice + padding;

    const width = 1000;
    const height = 360;

    const coordinates = points.map((point, index) => {
      const x =
        points.length === 1
          ? width / 2
          : (index / (points.length - 1)) * width;

      const y =
        height -
        ((Number(point.close) - min) / (max - min)) * height;

      return {
        x,
        y,
        price: Number(point.close),
        date: point.time,
      };
    });

    const line = coordinates
      .map((point) => `${point.x},${point.y}`)
      .join(" ");

    return {
      coordinates,
      line,
      firstPrice: prices[0],
      lastPrice: prices[prices.length - 1],
      minPrice,
      maxPrice,
    };
  }, [data]);

  if (loading) {
    return (
      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-semibold">Price history</h2>

        <div className="mt-6 flex h-[360px] items-center justify-center">
          <p className="text-sm text-white/40">
            Loading price history...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-8 rounded-2xl border border-red-400/20 bg-red-400/5 p-6">
        <h2 className="text-lg font-semibold">Price history</h2>

        <p className="mt-4 text-sm text-red-300">
          Unable to load price history: {error}
        </p>
      </section>
    );
  }

  if (!chart) {
    return null;
  }

  const isUp = chart.lastPrice >= chart.firstPrice;

  return (
    <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/30">
            Market data
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Price history
          </h2>

          <p className="mt-1 text-sm text-white/40">
            Last 30 trading days
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-white/40">30D change</p>

          <p
            className={`mt-1 text-sm font-medium ${
              isUp ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isUp ? "+" : ""}
            {(
              ((chart.lastPrice - chart.firstPrice) /
                chart.firstPrice) *
              100
            ).toFixed(2)}
            %
          </p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden">
        <svg
          viewBox="0 0 1000 360"
          className="h-[360px] w-full"
          preserveAspectRatio="none"
        >
          <line
            x1="0"
            y1="90"
            x2="1000"
            y2="90"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />

          <line
            x1="0"
            y1="180"
            x2="1000"
            y2="180"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />

          <line
            x1="0"
            y1="270"
            x2="1000"
            y2="270"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />

          <polyline
            points={chart.line}
            fill="none"
            stroke={isUp ? "#34d399" : "#f87171"}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {chart.coordinates.map((point, index) => {
            if (
              index !== 0 &&
              index !== chart.coordinates.length - 1
            ) {
              return null;
            }

            return (
              <circle
                key={`${point.date}-${index}`}
                cx={point.x}
                cy={point.y}
                r="5"
                fill={isUp ? "#34d399" : "#f87171"}
              />
            );
          })}
        </svg>
      </div>

      <div className="mt-4 flex justify-between text-xs text-white/30">
        <span>{data[data.length - 1]?.time}</span>
        <span>{data[0]?.time}</span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <p className="text-xs text-white/30">Period low</p>
          <p className="mt-1 text-sm font-medium">
            ${chart.minPrice.toFixed(2)}
          </p>
        </div>

        <div>
          <p className="text-xs text-white/30">Period high</p>
          <p className="mt-1 text-sm font-medium">
            ${chart.maxPrice.toFixed(2)}
          </p>
        </div>

        <div>
          <p className="text-xs text-white/30">Starting price</p>
          <p className="mt-1 text-sm font-medium">
            ${chart.firstPrice.toFixed(2)}
          </p>
        </div>

        <div>
          <p className="text-xs text-white/30">Latest price</p>
          <p className="mt-1 text-sm font-medium">
            ${chart.lastPrice.toFixed(2)}
          </p>
        </div>
      </div>

      <p className="mt-5 text-xs text-white/30">
        Daily closing prices · Latest available data
      </p>
    </section>
  );
}
