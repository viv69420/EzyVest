import "server-only";
import type { FinancialDataProvider } from "../provider";
import type { Instrument, PricePoint, ProviderResult, Quote } from "../types";

const endpoint = "https://api.twelvedata.com";
const unavailable = <T>(message: string): ProviderResult<T> => ({ data: null, provider: "twelve-data", unavailable: message });

async function request(path: string, params: Record<string, string>) {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) return null;
  const query = new URLSearchParams({ ...params, apikey: apiKey });
  const response = await fetch(`${endpoint}${path}?${query}`, { cache: "no-store" });
  const body = await response.json();
  if (!response.ok || body.status === "error") throw new Error(body.message || "Market data is unavailable");
  return body;
}

export const twelveDataProvider: FinancialDataProvider = {
  name: "twelve-data",
  async search(query) {
    if (!process.env.TWELVE_DATA_API_KEY) return unavailable("A financial data provider is not configured.");
    const body = await request("/symbol_search", { symbol: query, outputsize: "12" });
    const data: Instrument[] = (body.data ?? []).map((item: Record<string, string>) => ({ symbol: item.symbol, name: item.instrument_name, exchange: item.exchange, mic: item.mic_code, country: item.country, currency: item.currency, type: item.instrument_type }));
    return { data, provider: "twelve-data" };
  },
  async quote(security) {
    if (!process.env.TWELVE_DATA_API_KEY) return unavailable("A financial data provider is not configured.");
    const body = await request("/quote", { symbol: security.symbol, ...(security.exchange ? { exchange: security.exchange } : {}) });
    const data: Quote = { symbol: body.symbol, name: body.name, exchange: body.exchange, currency: body.currency, price: Number(body.close), previousClose: Number(body.previous_close), change: Number(body.change), percentChange: Number(body.percent_change), volume: Number(body.volume), asOf: body.datetime };
    return { data, provider: "twelve-data" };
  },
  async history(security, days) {
    if (!process.env.TWELVE_DATA_API_KEY) return unavailable("A financial data provider is not configured.");
    const body = await request("/time_series", { symbol: security.symbol, interval: "1day", outputsize: String(Math.min(days, 500)), ...(security.exchange ? { exchange: security.exchange } : {}) });
    const data: PricePoint[] = (body.values ?? []).map((point: Record<string, string>) => ({ time: point.datetime, open: Number(point.open), high: Number(point.high), low: Number(point.low), close: Number(point.close), volume: Number(point.volume) }));
    return { data, provider: "twelve-data" };
  },
  async profile(security) {
    if (!process.env.TWELVE_DATA_API_KEY) return unavailable("A financial data provider is not configured.");
    const body = await request("/profile", { symbol: security.symbol, ...(security.exchange ? { exchange: security.exchange } : {}) });
    return { data: body, provider: "twelve-data" };
  },
};
