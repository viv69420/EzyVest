import "server-only";

export type SecFilingSource = { title: string; url: string; filedAt?: string; accessionNumber?: string };
const SEC_DATA = "https://data.sec.gov";

export type SecCompany = { cik: string; ticker: string; name: string };

export async function resolveSecCompany(query: string): Promise<SecCompany | null> {
  if (!process.env.SEC_USER_AGENT || query.trim().length < 1) return null;
  const response = await fetch(`${SEC_DATA}/files/company_tickers.json`, { headers: { "User-Agent": process.env.SEC_USER_AGENT, Accept: "application/json" }, next: { revalidate: 86400 } });
  if (!response.ok) return null;
  const data = await response.json() as Record<string, { cik_str: number; ticker: string; title: string }>;
  const needle = query.trim().toLowerCase();
  const candidates = Object.values(data).filter(company => company.ticker.toLowerCase() === needle || company.title.toLowerCase() === needle);
  const company = candidates[0];
  return company ? { cik: String(company.cik_str), ticker: company.ticker, name: company.title } : null;
}

/** Official SEC retrieval boundary for US issuers. SEC requires an identifying User-Agent. */
export async function getSecSubmissions(cik: string): Promise<SecFilingSource[] | null> {
  if (!/^\d{1,10}$/.test(cik) || !process.env.SEC_USER_AGENT) return null;
  const padded = cik.padStart(10, "0");
  const response = await fetch(`${SEC_DATA}/submissions/CIK${padded}.json`, { headers: { "User-Agent": process.env.SEC_USER_AGENT, Accept: "application/json" }, next: { revalidate: 3600 } });
  if (!response.ok) return null;
  const payload = await response.json() as { filings?: { recent?: { form?: string[]; filingDate?: string[]; accessionNumber?: string[]; primaryDocument?: string[] } } };
  const recent = payload.filings?.recent;
  if (!recent?.form || !recent.filingDate || !recent.accessionNumber || !recent.primaryDocument) return [];
  return recent.form.map((form, index) => { const accession = recent.accessionNumber![index]; return { title: `SEC ${form}`, filedAt: recent.filingDate![index], accessionNumber: accession, url: `https://www.sec.gov/Archives/edgar/data/${Number(cik)}/${accession.replaceAll("-", "")}/${recent.primaryDocument![index]}` }; });
}
