import React from 'react';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getFeedIdeasAction } from '@/app/actions/feed';
import type { FeedSortOption } from '@/lib/feed';
import { FeedHero } from '@/app/components/feed/feed-hero';
import { FeedGrid } from '@/app/components/feed/feed-grid';
import { SortTabs } from '@/app/components/feed/sort-tabs';
import { FilterChips } from '@/app/components/feed/filter-chips';
import { SearchBar } from '@/app/components/feed/search-bar';

export const metadata: Metadata = {
  title: 'Discover Events & Innovations — Eventify Feed',
  description:
    'Explore premier community showcases, live summits, and breakthrough projects competing in the active cycle.',
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
 * /feed Page (RSC)
 * Premium Eventify & IdeaPulse Event Discovery Feed
 * - Visual Hero Area with live cycle metrics
 * - Universal Search & Sort Controls
 * - Visual Category with Icons & Hot Topics
 * - Responsive Grid / List with Infinite Scroll and Bookmarking
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
    .select('cycle_number, vote_threshold, status')
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
      className="min-h-[calc(100vh-64px)] py-8 focus:outline-none sm:py-12"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Visual Hero Header */}
        <FeedHero cycleNumber={activeCycle?.cycle_number || 1} totalIdeasCount={ideas.length} />

        {/* Discovery Search & Sort Toolbar */}
        <div className="mb-6 flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">
          <SearchBar initialSearch={search || ''} />
          <SortTabs currentSort={sort} />
        </div>

        {/* Visual Category & Topic Filter Chips */}
        <div className="bg-[var(--surface-2)]/60 mb-8 rounded-2xl border border-[var(--border-default)] p-3 backdrop-blur-md sm:p-4">
          <FilterChips selectedCategories={selectedCategories} selectedTags={selectedTags} />
        </div>

        {/* Responsive Cards Grid / List with infinite scroll */}
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
