import type { Instrument, PricePoint, ProviderResult, Quote, SecurityIdentity } from "./types";

export interface FinancialDataProvider {
  readonly name: string;
  search(query: string): Promise<ProviderResult<Instrument[]>>;
  quote(security: SecurityIdentity): Promise<ProviderResult<Quote>>;
  history(security: SecurityIdentity, days: number): Promise<ProviderResult<PricePoint[]>>;
  profile(security: SecurityIdentity): Promise<ProviderResult<Record<string, unknown>>>;
}
