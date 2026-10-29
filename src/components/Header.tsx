import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-parchment-300 bg-parchment-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-bronze-600"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-bronze-500/40 bg-parchment-200 font-serif text-lg font-bold text-bronze-700">
            CP
          </div>
          <div>
            <span className="block font-serif text-xl font-bold tracking-tight text-ink-900">
              Chat Past
            </span>
            <span className="block text-xs font-medium text-bronze-700">
              Talk to the past.
            </span>
          </div>
        </Link>

        <nav aria-label="Main museum navigation" className="flex flex-wrap items-center gap-2 sm:gap-5 text-sm font-medium text-ink-800">
          <Link
            href="/#collection"
            className="rounded-md px-2.5 py-1.5 hover:bg-parchment-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-bronze-600"
          >
            Collection
          </Link>
          <Link
            href="/about"
            className="rounded-md px-2.5 py-1.5 hover:bg-parchment-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-bronze-600"
          >
            About &amp; How It Works
          </Link>
          <Link
            href="/privacy"
            className="rounded-md border border-parchment-300 bg-parchment-100 px-3 py-1.5 text-xs font-semibold text-bronze-700 hover:bg-parchment-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-bronze-600"
          >
            Privacy &amp; AI Disclaimer
          </Link>
        </nav>
      </div>
    </header>
  );
}
