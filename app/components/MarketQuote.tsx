"use client";

import { useEffect, useState } from "react";

type QuoteData = {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  price: number;
  previousClose?: number;
  change?: number;
  percentChange?: number;
  volume?: number;
  fifty_two_week?: {
    low: string;
    high: string;
  };
};

type MarketQuoteProps = {
  symbol: string;
};

export default function MarketQuote({ symbol }: MarketQuoteProps) {
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchQuote() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/quote?symbol=${encodeURIComponent(symbol)}`
        );

        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error || "Unable to load market data");
        }

        setQuote(data.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load market data"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchQuote();
  }, [symbol]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-sm text-white/40">
          Loading market data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-6">
        <p className="text-sm text-red-300">
          Unable to load market data: {error}
        </p>
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  const price = quote.price;
  const change = quote.change ?? 0;
  const percentChange = quote.percentChange ?? 0;

  const isPositive = change >= 0;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold">
              {quote.symbol}
            </h2>

            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/50">
              {quote.exchange}
            </span>
          </div>

          <p className="mt-2 text-sm text-white/50">
            {quote.name}
          </p>
        </div>

        <div className="md:text-right">
          <div className="text-4xl font-semibold tracking-tight">
            {quote.currency === "USD" ? "$" : ""}
            {price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>

          <div
            className={`mt-2 text-sm font-medium ${
              isPositive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isPositive ? "+" : ""}
            {change.toFixed(2)}
            {"  "}
            ({isPositive ? "+" : ""}
            {percentChange.toFixed(2)}%)
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs text-white/40">
            Previous close
          </p>
          <p className="mt-2 text-sm font-medium">
            {quote.currency === "USD" ? "$" : ""}
            {quote.previousClose?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) ?? "—"}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs text-white/40">
            Volume
          </p>
          <p className="mt-2 text-sm font-medium">
            {quote.volume?.toLocaleString() ?? "—"}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs text-white/40">
            52W low
          </p>
          <p className="mt-2 text-sm font-medium">
            {quote.currency === "USD" ? "$" : ""}
            {quote.fifty_two_week
              ? Number(quote.fifty_two_week.low).toFixed(2)
              : "—"}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs text-white/40">
            52W high
          </p>
          <p className="mt-2 text-sm font-medium">
            {quote.currency === "USD" ? "$" : ""}
            {quote.fifty_two_week
              ? Number(quote.fifty_two_week.high).toFixed(2)
              : "—"}
          </p>
        </div>
      </div>

      <p className="mt-5 text-xs text-white/30">
        Latest available market data
      </p>
    </section>
  );
}
