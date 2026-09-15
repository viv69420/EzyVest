import Link from "next/link";
import Navbar from "../../components/Navbar";
import MarketQuote from "@/app/components/MarketQuote";
import StockChart from "@/app/components/StockChart";

type CompanyPageProps = {
  params: Promise<{
    ticker: string;
  }>;
  searchParams: Promise<{
    exchange?: string;
  }>;
};

type CompanyProfile = {
  symbol: string;
  name: string;
  exchange: string;
  mic_code?: string;
  sector?: string;
  industry?: string;
  employees?: number;
  website?: string;
  description?: string;
  type?: string;
  CEO?: string;
  address?: string;
  address2?: string;
  city?: string;
  zip?: string;
  state?: string;
  country?: string;
  phone?: string;
};

type ProfileResult = {
  company: CompanyProfile | null;
  error: string | null;
};

async function getCompanyProfile(
  ticker: string,
  exchange?: string
): Promise<ProfileResult> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const params = new URLSearchParams({
    symbol: ticker.toUpperCase(),
  });

  if (exchange) {
    params.set("exchange", exchange);
  }

  try {
    const response = await fetch(
      `${baseUrl}/api/profile?${params.toString()}`,
      {
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      return {
        company: null,
        error:
          data.error ||
          `Profile request failed with status ${response.status}`,
      };
    }

    if (!data.data?.symbol) {
      return {
        company: null,
        error: "The market-data provider returned no company profile.",
      };
    }

    return {
      company: data.data,
      error: null,
    };
  } catch (error) {
    return {
      company: null,
      error:
        error instanceof Error
          ? error.message
          : "Unable to connect to the company data service.",
    };
  }
}

export default async function CompanyDetailPage({
  params,
  searchParams,
}: CompanyPageProps) {
  const { ticker } = await params;
  const { exchange } = await searchParams;

  const result = await getCompanyProfile(ticker, exchange);

  if (!result.company) {
    return (
      <main className="min-h-screen bg-[#08090b] text-white">
        <Navbar />

        <section className="mx-auto max-w-3xl px-6 py-32 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-white/30">
            Company Intelligence
          </p>

          <h1 className="mt-5 text-4xl font-semibold">
            Unable to load company
          </h1>

          <p className="mt-5 leading-7 text-white/45">
            {result.error}
          </p>

          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/company"
              className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Search again
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const company = result.company;

  return (
    <main className="min-h-screen bg-[#08090b] text-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <Link
          href="/company"
          className="text-sm text-white/40 transition hover:text-white"
        >
          ← Search companies
        </Link>

        <div className="mt-10 border-b border-white/10 pb-10">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/50">
                  {company.exchange}
                </span>

                <span className="text-sm text-white/30">
                  {company.symbol}
                </span>

                {company.type && (
                  <span className="text-sm text-white/30">
                    {company.type}
                  </span>
                )}
              </div>

              <h1 className="mt-5 text-5xl font-semibold tracking-tight">
                {company.name}
              </h1>

              {company.description && (
                <p className="mt-4 max-w-4xl text-lg leading-8 text-white/45">
                  {company.description}
                </p>
              )}
            </div>

            <button className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium transition hover:bg-white/10">
              Add to watchlist
            </button>
          </div>
        </div>

        <div className="grid gap-6 py-10 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <p className="text-sm text-white/35">Sector</p>

            <p className="mt-3 text-lg font-medium">
              {company.sector || "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <p className="text-sm text-white/35">Industry</p>

            <p className="mt-3 text-lg font-medium">
              {company.industry || "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <p className="text-sm text-white/35">Country</p>

            <p className="mt-3 text-lg font-medium">
              {company.country || "—"}
            </p>
          </div>
        </div>

        <MarketQuote symbol={company.symbol} />

        <StockChart symbol={company.symbol} />

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-7">
            <p className="text-xs uppercase tracking-[0.18em] text-white/30">
              Business
            </p>

            <h2 className="mt-3 text-2xl font-semibold">
              What does {company.name} do?
            </h2>

            <p className="mt-5 leading-8 text-white/55">
              {company.description ||
                "Company business information is not currently available."}
            </p>

            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex text-sm text-white/60 underline underline-offset-4 transition hover:text-white"
              >
                Company website
              </a>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-7">
            <p className="text-xs uppercase tracking-[0.18em] text-white/30">
              Research
            </p>

            <h2 className="mt-3 text-2xl font-semibold">
              Research {company.name}
            </h2>

            <p className="mt-5 leading-8 text-white/45">
              The research layer will connect this company to financial
              statements, filings, news, events, industry relationships,
              catalysts, risks and evidence-backed AI analysis.
            </p>

            <Link
              href="/research"
              className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Start research
            </Link>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-7">
          <p className="text-xs uppercase tracking-[0.18em] text-white/30">
            Company information
          </p>

          <h2 className="mt-3 text-2xl font-semibold">
            Company profile
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs text-white/30">Employees</p>

              <p className="mt-2 text-sm font-medium">
                {company.employees
                  ? company.employees.toLocaleString()
                  : "—"}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs text-white/30">CEO</p>

              <p className="mt-2 text-sm font-medium">
                {company.CEO || "—"}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs text-white/30">Exchange</p>

              <p className="mt-2 text-sm font-medium">
                {company.exchange || "—"}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs text-white/30">Country</p>

              <p className="mt-2 text-sm font-medium">
                {company.country || "—"}
              </p>
            </div>
          </div>

          {(company.address ||
            company.address2 ||
            company.city ||
            company.state ||
            company.zip ||
            company.phone) && (
            <div className="mt-6 border-t border-white/10 pt-6">
              <p className="text-sm font-medium">
                Headquarters
              </p>

              <p className="mt-2 text-sm leading-6 text-white/45">
                {[
                  company.address,
                  company.address2,
                  company.city,
                  company.state,
                  company.zip,
                  company.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              {company.phone && (
                <p className="mt-2 text-sm text-white/45">
                  {company.phone}
                </p>
              )}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
