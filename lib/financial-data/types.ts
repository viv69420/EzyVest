export type SecurityIdentity = {
  symbol: string;
  exchange?: string;
  mic?: string;
  country?: string;
  currency?: string;
};

export type Instrument = SecurityIdentity & {
  name: string;
  type: string;
};

export type Quote = SecurityIdentity & {
  name?: string;
  price: number;
  previousClose?: number;
  change?: number;
  percentChange?: number;
  volume?: number;
  asOf?: string;
};

export type PricePoint = { time: string; open: number; high: number; low: number; close: number; volume?: number };
export type ProviderResult<T> = { data: T; provider: string } | { data: null; provider: string; unavailable: string };
