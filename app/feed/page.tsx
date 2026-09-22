import React from 'react';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getFeedIdeasAction } from '@/app/actions/feed';
import type { FeedSortOption } from '@/lib/feed';
import { FeedGrid } from '@/app/components/feed/feed-grid';
import { SortTabs } from '@/app/components/feed/sort-tabs';
import { FilterChips } from '@/app/components/feed/filter-chips';
import { SearchBar } from '@/app/components/feed/search-bar';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Community Feed — IdeaPulse',
  description: 'Explore, vote, and elevate community proposals competing in the active cycle.',
};

interface FeedPageProps {
  searchParams:
    | Promise<{
        sort?: string;
        category?: string;
        tag?: string;
        q?: string;
      }>
    | {
        sort?: string;
        category?: string;
        tag?: string;
        q?: string;
      };
}

/**
 * /feed Page (RSC) per ARCHITECTURE.md §5.1 and TASKS.md [T-4.1, T-4.4, T-4.6, T-4.18]
 * Fetches initial batch using SQL cursor pagination, multi-select filters, search query, and trending score.
 */
export default async function FeedPage({ searchParams }: FeedPageProps) {
  const resolvedParams = await Promise.resolve(searchParams);

  const sort = (
    ['trending', 'newest', 'top'].includes(resolvedParams.sort || '')
      ? resolvedParams.sort
      : 'trending'
  ) as FeedSortOption;

  const category = resolvedParams.category || null;
  const tag = resolvedParams.tag || null;
  const search = resolvedParams.q || null;

  const selectedCategories = category ? category.split(',').filter(Boolean) : [];
  const selectedTags = tag ? tag.split(',').filter(Boolean) : [];

  const supabase = await createClient();
  const { data: activeCycle } = await supabase
    .from('cycles')
    .select('cycle_number')
    .eq('status', 'active')
    .maybeSingle();

  const { ideas, nextCursor, currentUserId } = await getFeedIdeasAction({
    sort,
    category,
    tag,
    search,
    limit: 12,
  });

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-[calc(100vh-64px)] py-10 focus:outline-none sm:py-14"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header Title & Subtitle */}
        <div className="mb-8 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[rgba(99,102,241,0.12)] px-3 py-1 text-xs font-semibold text-[var(--indigo-bright)]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Cycle #{activeCycle?.cycle_number || 1} Proposals</span>
            </div>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl">
              Community Feed
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
              Explore live submissions. Every confirmed member receives 5 votes per 24 hours to
              support the ideas that matter.
            </p>
          </div>

          {/* Search bar & Sort Tabs */}
          <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:w-auto">
            <SearchBar initialSearch={search || ''} />
            <SortTabs currentSort={sort} />
          </div>
        </div>

        {/* Filter Chips per T-4.6 */}
        <div className="mb-8 border-y border-[var(--border-subtle)] py-2">
          <FilterChips selectedCategories={selectedCategories} selectedTags={selectedTags} />
        </div>

        {/* Responsive Grid with Infinite Scroll per T-4.1, T-4.3, T-4.7, T-4.18 */}
        <FeedGrid
          initialIdeas={ideas}
          initialCursor={nextCursor}
          sort={sort}
          category={category}
          tag={tag}
          search={search}
          currentUserId={currentUserId}
          cycleNumber={activeCycle?.cycle_number || 1}
        />
      </div>
    </main>
  );
}
