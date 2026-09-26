'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IdeaCard } from '@/app/components/ideas/idea-card';
import { IdeaCardSkeletonGrid } from '@/app/components/ideas/idea-card-skeleton';
import { getFeedIdeasAction } from '@/app/actions/feed';
import type { FeedIdeaItem, FeedSortOption } from '@/lib/feed';
import { FeedEmptyState } from '@/app/components/feed/feed-empty-state';
import { useBookmarks } from '@/lib/feed/use-bookmarks';
import {
  Loader2,
  ArrowDown,
  LayoutGrid,
  List,
  Bookmark,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

interface FeedGridProps {
  initialIdeas: FeedIdeaItem[];
  initialCursor: string | null;
  sort: FeedSortOption;
  category?: string | null;
  tag?: string | null;
  search?: string | null;
  currentUserId?: string | null;
  cycleNumber?: number;
}

/**
 * FeedGrid Component
 * - Grid vs List view mode toggle
 * - Filter by "Saved Bookmarks" toggle
 * - Smooth infinite scroll via IntersectionObserver
 * - Accessible "Load more" fallback
 * - CLS-safe Skeleton states during pagination
 */
export function FeedGrid({
  initialIdeas,
  initialCursor,
  sort,
  category,
  tag,
  search,
  currentUserId,
  cycleNumber = 1,
}: FeedGridProps) {
  const [ideas, setIdeas] = useState<FeedIdeaItem[]>(initialIdeas);
  const [nextCursor, setNextCursor] = useState<string | null>(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [onlySaved, setOnlySaved] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const { bookmarkedIds } = useBookmarks();

  // Reset when initial data changes
  useEffect(() => {
    setIdeas(initialIdeas);
    setNextCursor(initialCursor);
  }, [initialIdeas, initialCursor]);

  const loadMore = useCallback(async () => {
    if (isLoading || !nextCursor) return;
    setIsLoading(true);

    try {
      const result = await getFeedIdeasAction({
        sort,
        category,
        tag,
        search,
        cursor: nextCursor,
        limit: 12,
      });

      setIdeas((prev) => [...prev, ...result.ideas]);
      setNextCursor(result.nextCursor);
    } catch (err) {
      console.error('Failed to load more ideas:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, nextCursor, sort, category, tag, search]);

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !nextCursor || onlySaved) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && !isLoading) {
          loadMore();
        }
      },
      { rootMargin: '300px' },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [nextCursor, isLoading, loadMore, onlySaved]);

  // Filter ideas if "Saved Bookmarks" mode is active
  const displayedIdeas = onlySaved
    ? ideas.filter((idea) => bookmarkedIds.includes(idea.id))
    : ideas;

  if (ideas.length === 0 && !isLoading) {
    const hasFilter = Boolean(category || tag || search);
    return (
      <FeedEmptyState type={hasFilter ? 'no_results' : 'no_ideas'} cycleNumber={cycleNumber} />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-toolbar: Results count, saved filter pill, Grid/List view switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[var(--text-secondary)]">
            Showing{' '}
            <strong className="font-display text-[var(--text-primary)]">
              {displayedIdeas.length}
            </strong>{' '}
            {onlySaved ? 'saved events' : 'discoveries'}
          </span>

          {/* Quick toggle for Bookmarked events */}
          <button
            type="button"
            onClick={() => setOnlySaved((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-all ${
              onlySaved
                ? 'border border-amber-400/40 bg-amber-500/15 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                : 'border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Bookmark className={`h-3 w-3 ${onlySaved ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>Saved ({bookmarkedIds.length})</span>
          </button>
        </div>

        {/* View mode toggle (Grid vs List) */}
        <div className="flex items-center gap-1 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] p-1">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            title="Grid view"
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-[var(--surface-3)] text-[var(--indigo-bright)] shadow-sm'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            aria-label="List view"
            title="List view"
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-[var(--surface-3)] text-[var(--indigo-bright)] shadow-sm'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* When filtering saved only and none exist */}
      {onlySaved && displayedIdeas.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-default)] py-16 text-center">
          <Bookmark className="h-10 w-10 text-[var(--text-tertiary)] opacity-60" />
          <h3 className="mt-3 text-sm font-semibold text-[var(--text-primary)]">
            No Saved Events Found
          </h3>
          <p className="mt-1 max-w-sm text-xs text-[var(--text-secondary)]">
            Click the bookmark icon on any event card to save it for quick reference and tracking.
          </p>
          <button
            type="button"
            onClick={() => setOnlySaved(false)}
            className="mt-4 rounded-full border border-[var(--border-accent)] bg-[var(--surface-3)] px-4 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--indigo-bright)]"
          >
            View All Discoveries
          </button>
        </div>
      )}

      {/* Cards container: Grid or List */}
      <div
        className={
          viewMode === 'list'
            ? 'flex flex-col gap-4'
            : 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
        }
      >
        {displayedIdeas.map((idea) => (
          <IdeaCard
            key={idea.id}
            viewMode={viewMode}
            idea={{
              ...idea,
              profiles: {
                id: idea.author_id,
                username: idea.author_username,
                display_name: idea.author_display_name,
                avatar_url: idea.author_avatar_url,
              },
              cycles: {
                id: idea.cycle_id,
                cycle_number: idea.cycle_number,
                vote_threshold: idea.vote_threshold,
              },
            }}
            currentUserId={currentUserId}
            hasVoted={idea.hasVoted}
            voteCreatedAt={idea.voteCreatedAt}
            isAnonymous={!currentUserId}
          />
        ))}
      </div>

      {/* Loading Skeletons when loading next page */}
      {isLoading && (
        <div className="pt-2">
          <IdeaCardSkeletonGrid count={viewMode === 'list' ? 2 : 3} viewMode={viewMode} />
        </div>
      )}

      {/* Pagination Footer: IntersectionObserver Sentinel & Accessible "Load More" Fallback */}
      {nextCursor && !onlySaved && (
        <div className="flex flex-col items-center justify-center py-6">
          <div ref={sentinelRef} className="h-4 w-full" aria-hidden="true" />

          <button
            type="button"
            onClick={loadMore}
            disabled={isLoading}
            className="btn glass-panel inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] px-6 py-3 text-xs font-semibold text-[var(--text-primary)] shadow-sm backdrop-blur-[var(--blur-md)] transition-all hover:border-[var(--border-accent)] hover:bg-[var(--surface-3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo-bright)] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[var(--indigo-bright)]" />
                <span>Loading more events...</span>
              </>
            ) : (
              <>
                <ArrowDown className="h-4 w-4 text-[var(--cyan-bright)]" />
                <span>Load more events</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* End of feed indicator */}
      {!nextCursor && displayedIdeas.length > 0 && !onlySaved && (
        <div className="py-8 text-center text-xs text-[var(--text-tertiary)]">
          You&apos;ve reached the end of the active cycle feed.
        </div>
      )}
    </div>
  );
}
