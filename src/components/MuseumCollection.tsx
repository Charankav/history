'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { HistoricalFigure, FigureCategory, HistoricalPeriod } from '@/types/figure';
import { CATEGORY_LABELS } from '@/config/limits';
import { PortraitImage } from './PortraitImage';

interface Props {
  figures: HistoricalFigure[];
}

const PERIOD_OPTIONS: HistoricalPeriod[] = [
  'Ancient (Before 500 CE)',
  'Medieval & Early Modern (500–1750)',
  'Modern (1750–Present)',
];

export function MuseumCollection({ figures }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FigureCategory | 'all'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<HistoricalPeriod | 'all'>('all');

  const filteredFigures = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return figures.filter((fig) => {
      const matchesSearch =
        !q ||
        fig.name.toLowerCase().includes(q) ||
        fig.displayName.toLowerCase().includes(q) ||
        fig.region.toLowerCase().includes(q) ||
        fig.summary.toLowerCase().includes(q);
      const matchesCategory =
        selectedCategory === 'all' || fig.categories.includes(selectedCategory);
      const matchesPeriod =
        selectedPeriod === 'all' || fig.historicalPeriod === selectedPeriod;
      return matchesSearch && matchesCategory && matchesPeriod;
    });
  }, [figures, searchQuery, selectedCategory, selectedPeriod]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || selectedCategory !== 'all' || selectedPeriod !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedPeriod('all');
  };

  return (
    <section id="collection" aria-labelledby="collection-heading" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-xl border border-bronze-500/30 bg-parchment-100 p-4 text-sm text-ink-800">
        <p className="font-semibold text-bronze-700">
          Phase 2 Development Dataset Active ({figures.length} verified preview figures)
        </p>
        <p className="mt-1 text-xs text-ink-800/90">
          Per Phase 0 &amp; Phase 3 rules, the full 100-figure production library is staged for immediate import once the proposed 100-figure list is approved.
        </p>
      </div>

      <div className="mb-8 rounded-2xl border border-parchment-300 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="figure-search" className="block text-xs font-bold uppercase tracking-wider text-bronze-700">
              Search Historical Figures
            </label>
            <input
              id="figure-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, region, or topic..."
              className="mt-1.5 w-full rounded-lg border border-parchment-300 bg-parchment-50 px-3.5 py-2 text-sm text-ink-900 focus:border-bronze-600 focus:outline-none focus:ring-2 focus:ring-bronze-600/20"
            />
          </div>

          <div>
            <label htmlFor="period-filter" className="block text-xs font-bold uppercase tracking-wider text-bronze-700">
              Historical Era
            </label>
            <select
              id="period-filter"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as HistoricalPeriod | 'all')}
              className="mt-1.5 w-full rounded-lg border border-parchment-300 bg-parchment-50 px-3.5 py-2 text-sm text-ink-900 focus:border-bronze-600 focus:outline-none focus:ring-2 focus:ring-bronze-600/20"
            >
              <option value="all">All Historical Eras</option>
              {PERIOD_OPTIONS.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div aria-live="polite" className="text-sm font-medium text-ink-800">
              Showing <span className="font-bold text-ink-900">{filteredFigures.length}</span> of{' '}
              <span className="font-bold text-ink-900">{figures.length}</span> figures
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg border border-bronze-600/40 bg-parchment-100 px-3 py-2 text-xs font-semibold text-bronze-700 hover:bg-parchment-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-bronze-600"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            aria-pressed={selectedCategory === 'all'}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              selectedCategory === 'all'
                ? 'bg-ink-900 text-parchment-50'
                : 'border border-parchment-300 bg-parchment-50 text-ink-800 hover:bg-parchment-200'
            }`}
          >
            All Categories
          </button>
          {(Object.entries(CATEGORY_LABELS) as [FigureCategory, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedCategory(key)}
              aria-pressed={selectedCategory === key}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedCategory === key
                  ? 'bg-bronze-600 text-white'
                  : 'border border-parchment-300 bg-parchment-50 text-ink-800 hover:bg-parchment-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filteredFigures.length === 0 ? (
        <div className="rounded-2xl border border-parchment-300 bg-parchment-100/60 p-12 text-center">
          <h3 className="font-serif text-xl font-bold text-ink-900">
            No matching historical figures found
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-800">
            Try searching for another name, region, or era, or reset your active filters to restore the full collection.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 rounded-lg bg-bronze-600 px-4 py-2 text-sm font-semibold text-white hover:bg-bronze-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-bronze-600"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredFigures.map((fig, idx) => (
            <article
              key={fig.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-parchment-300 bg-white shadow-sm transition hover:border-bronze-500 hover:shadow-md"
            >
              <div className="aspect-[4/3] w-full border-b border-parchment-200">
                <PortraitImage portrait={fig.portrait} displayName={fig.displayName} priority={idx < 4} />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="text-xs font-semibold text-bronze-700">
                  {fig.lifePeriodLabel} &bull; {fig.region}
                </div>
                <h3 className="mt-1 font-serif text-lg font-bold text-ink-900">
                  {fig.name}
                </h3>
                <p className="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-ink-800">
                  {fig.summary}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {fig.categories.map((cat) => (
                    <span
                      key={cat}
                      className="rounded-md bg-parchment-100 px-2 py-0.5 text-[11px] font-medium text-bronze-700"
                    >
                      {CATEGORY_LABELS[cat]}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/chat/${fig.slug}`}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-ink-900 px-4 py-2.5 text-xs font-semibold text-parchment-50 transition hover:bg-bronze-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-bronze-600"
                >
                  Chat with {fig.displayName}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
