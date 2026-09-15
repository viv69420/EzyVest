import Link from "next/link";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Research", href: "/research" },
  { name: "Company", href: "/company" },
  { name: "Thesis", href: "/thesis" },
  { name: "Paper Trade", href: "/paper-trade" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Watchlists", href: "/watchlists" },
];

export default function Navbar() {
  return (
    <header className="border-b border-white/10 bg-[#08090b]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-black text-black">
            E
          </div>

          <span className="text-sm font-semibold tracking-tight">
            EzyVest
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <Link href="/auth" className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">Sign in</Link>
      </div>
    </header>
  );
}
