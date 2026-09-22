'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IdeaCard } from '@/app/components/ideas/idea-card';
import { getFeedIdeasAction } from '@/app/actions/feed';
import type { FeedIdeaItem, FeedSortOption } from '@/lib/feed';
import { FeedEmptyState } from '@/app/components/feed/feed-empty-state';
import { Loader2, ArrowDown } from 'lucide-react';

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
 * FeedGrid Component per DESIGN.md §5.3, §7.3 and TASKS.md [T-4.1, T-4.3, T-4.7, T-4.18]
 * - Responsive grid: 1 col (sm), 2 cols (md), 3 cols (xl)
 * - Infinite scroll via IntersectionObserver
 * - Accessible "Load more" fallback for keyboard users
 * - Clean empty states for no matches or empty cycle
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
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset when sort, category, tag, or search changes
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

  // Infinite scroll via IntersectionObserver [T-4.3]
  useEffect(() => {
    if (!sentinelRef.current || !nextCursor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && !isLoading) {
          loadMore();
        }
      },
      { rootMargin: '250px' },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [nextCursor, isLoading, loadMore]);

  if (ideas.length === 0 && !isLoading) {
    const hasFilter = Boolean(category || tag);
    return (
      <FeedEmptyState type={hasFilter ? 'no_results' : 'no_ideas'} cycleNumber={cycleNumber} />
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Responsive Grid per DESIGN.md §5.3 [T-4.1] */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ideas.map((idea) => (
          <IdeaCard
            key={idea.id}
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

      {/* Pagination Footer: IntersectionObserver Sentinel & Accessible "Load More" Fallback [T-4.3] */}
      {nextCursor && (
        <div className="flex flex-col items-center justify-center py-6">
          {/* Invisible sentinel element for viewport intersection */}
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
                <span>Loading more ideas...</span>
              </>
            ) : (
              <>
                <ArrowDown className="h-4 w-4 text-[var(--cyan-bright)]" />
                <span>Load more ideas</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* End of feed indicator */}
      {!nextCursor && ideas.length > 0 && (
        <div className="py-8 text-center text-xs text-[var(--text-tertiary)]">
          You&apos;ve reached the end of the feed.
        </div>
      )}
    </div>
  );
}
