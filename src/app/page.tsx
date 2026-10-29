import { Header } from '@/components/Header';
import { MuseumCollection } from '@/components/MuseumCollection';
import { FIGURES_LIBRARY } from '@/data/figures';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="border-b border-parchment-300 bg-gradient-to-b from-parchment-100 to-parchment-50 py-14 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <span className="inline-block rounded-full border border-bronze-500/40 bg-parchment-200/70 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-bronze-700">
              Interactive Digital History Museum &bull; Ages 8–16
            </span>
            <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-ink-900 sm:text-5xl">
              History is waiting to speak to you.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ink-800 sm:text-lg">
              Meet remarkable people from the past. Ask your questions. Discover their stories through historically grounded, age-appropriate AI simulations.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#collection"
                className="rounded-xl bg-bronze-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-bronze-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-bronze-600"
              >
                Explore the Historical Collection
              </a>
              <Link
                href="/about"
                className="rounded-xl border border-parchment-300 bg-white px-6 py-3 text-sm font-semibold text-ink-900 hover:bg-parchment-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-bronze-600"
              >
                How Chat Past Works
              </Link>
            </div>
          </div>
        </section>

        <MuseumCollection figures={FIGURES_LIBRARY} />
      </main>

      <footer className="border-t border-parchment-300 bg-parchment-100 py-8 text-xs text-ink-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p>
            <strong>Chat Past</strong> &mdash; Talk to the past. All conversations are educational AI simulations grounded in historical records, not real people.
          </p>
          <div className="flex gap-4 font-semibold text-bronze-700">
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/privacy" className="hover:underline">Privacy &amp; Child Safety</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
