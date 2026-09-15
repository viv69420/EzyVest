import Link from "next/link";
import Navbar from "./components/Navbar";

const features = [
  {
    number: "01",
    title: "Understand",
    description:
      "See what a company does, how it makes money, its financials, competitors, risks, and key drivers.",
  },
  {
    number: "02",
    title: "Research",
    description:
      "Ask financial questions and investigate companies, industries, events, and market movements.",
  },
  {
    number: "03",
    title: "Form a thesis",
    description:
      "Build an investment thesis with supporting evidence, contradictions, and conditions that could prove you wrong.",
  },
  {
    number: "04",
    title: "Paper trade",
    description:
      "Test your thinking with simulated positions before putting real money at risk.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#08090b] text-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 pb-24 pt-24">
        <div className="max-w-4xl">
          <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/50">
            Financial intelligence platform
          </div>

          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Understand what you’re investing in
            <span className="text-white/40"> before you invest.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/50">
            Research companies, understand market events, build investment
            theses, and test your thinking with paper trading.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/research"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Start researching
            </Link>

            <Link
              href="/company"
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
            >
              Explore companies
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10">
        <div className="mx-auto grid max-w-7xl gap-px bg-white/10 md:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.number}
              className="bg-[#08090b] p-7 transition hover:bg-white/[0.02]"
            >
              <div className="text-xs text-white/30">{feature.number}</div>

              <h2 className="mt-10 text-xl font-semibold">
                {feature.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/40">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-medium text-white/40">
              THE RESEARCH WORKFLOW
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight">
              From a question to a tested thesis.
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-white/45">
              The platform is designed around the complete research journey:
              discover, understand, research, form a thesis, paper trade,
              track, and learn.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="text-xs uppercase tracking-widest text-white/30">
              Research flow
            </div>

            <div className="mt-6 space-y-3">
              {[
                "Discover a company or market event",
                "Understand the underlying business",
                "Investigate the evidence",
                "Form a thesis",
                "Test it with paper trading",
              ].map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-black/20 p-4"
                >
                  <span className="text-xs text-white/25">
                    0{index + 1}
                  </span>

                  <span className="text-sm text-white/70">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-12">
            <p className="text-sm text-white/40">READY TO RESEARCH?</p>

            <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight">
              Stop guessing why the market moved.
            </h2>

            <p className="mt-4 max-w-xl leading-7 text-white/40">
              Start with a company, a question, or an event and build your
              understanding from there.
            </p>

            <Link
              href="/research"
              className="mt-8 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Open Research
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <span>EzyVest</span>
          <span>Research. Understand. Test.</span>
        </div>
      </footer>
    </main>
  );
}
