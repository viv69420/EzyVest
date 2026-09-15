"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import Navbar from "../components/Navbar";

type SearchResult = {
  symbol: string;
  name: string;
  exchange: string;
  mic_code?: string;
  exchange_timezone?: string;
  type: string;
  country: string;
  currency: string;
};

export default function CompanySearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  async function searchCompanies(searchQuery: string) {
    const cleanedQuery = searchQuery.trim();

    if (cleanedQuery.length < 2) {
      setResults([]);
      setSearched(false);
      setError("");
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      setError("");

      const response = await fetch(
        `/api/search?q=${encodeURIComponent(cleanedQuery)}`
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(
          data.error || "Unable to search financial instruments"
        );
      }

      setResults(data.data || []);
    } catch (err) {
      setResults([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to search financial instruments"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    searchCompanies(query);
  }

  return (
    <main className="min-h-screen bg-[#08090b] text-white">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-white/30">
            Company Intelligence
          </p>

          <h1 className="mt-5 text-5xl font-semibold tracking-tight">
            Research any company
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/45">
            Search companies, stocks and other financial instruments using
            real market data.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-10 max-w-3xl"
        >
          <div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.04] p-2 transition focus-within:border-white/20">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by company name or ticker..."
              className="min-w-0 flex-1 bg-transparent px-4 py-4 text-base text-white outline-none placeholder:text-white/25"
              autoComplete="off"
            />

            <button
              type="submit"
              disabled={loading || query.trim().length < 2}
              className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        <div className="mx-auto mt-10 max-w-3xl">
          {error && (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-5">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {!error && loading && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center">
              <p className="text-sm text-white/40">
                Searching financial markets...
              </p>
            </div>
          )}

          {!error &&
            !loading &&
            searched &&
            results.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center">
                <p className="text-sm text-white/50">
                  No matching financial instruments found.
                </p>
              </div>
            )}

          {!loading && results.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
              {results.map((result, index) => (
                <Link
                  key={`${result.symbol}-${result.exchange}-${index}`}
                  href={`/company/${encodeURIComponent(
                    result.symbol
                  )}?exchange=${encodeURIComponent(result.exchange)}`}
                  className="block border-b border-white/10 p-5 transition last:border-b-0 hover:bg-white/[0.04]"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold">
                          {result.symbol}
                        </span>

                        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/45">
                          {result.exchange}
                        </span>
                      </div>

                      <p className="mt-2 truncate text-sm text-white/55">
                        {result.name}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-6 text-right">
                      <div>
                        <p className="text-xs text-white/25">
                          Country
                        </p>
                        <p className="mt-1 text-sm text-white/55">
                          {result.country || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-white/25">
                          Type
                        </p>
                        <p className="mt-1 text-sm text-white/55">
                          {result.type || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!searched && !loading && (
            <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
              <p className="text-sm text-white/30">
                Start typing to search the market.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
