import React from 'react';

interface IdeaCardSkeletonProps {
  className?: string;
}

/**
 * IdeaCardSkeleton Component per DESIGN.md §6.4, §7.3 and TASKS.md [T-4.8]
 * - Exact footprint match for <IdeaCard /> to guarantee zero Cumulative Layout Shift (CLS = 0)
 * - 1.6s linear infinite shimmer animation
 * - Specular top edge highlight consistent with glass system
 */
export function IdeaCardSkeleton({ className = '' }: IdeaCardSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading idea proposal"
      className={`glass-panel relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-2)] p-6 backdrop-blur-[var(--blur-md)] ${className}`}
      style={{
        boxShadow: 'inset 0 1px 0 var(--edge-specular)',
        minHeight: '280px',
      }}
    >
      {/* Header: Author + Timestamp + Category badge */}
      <div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {/* Avatar circle */}
            <div className="skeleton-shimmer h-6 w-6 rounded-full" />
            {/* Author name */}
            <div className="skeleton-shimmer h-3.5 w-24 rounded" />
            <span className="text-[var(--text-tertiary)]">·</span>
            {/* Date */}
            <div className="skeleton-shimmer h-3 w-16 rounded" />
          </div>

          {/* Category badge */}
          <div className="skeleton-shimmer h-5 w-20 rounded" />
        </div>

        {/* Title placeholder (2 lines) */}
        <div className="mt-4 space-y-2">
          <div className="skeleton-shimmer h-5 w-full rounded" />
          <div className="skeleton-shimmer h-5 w-3/4 rounded" />
        </div>

        {/* Summary placeholder (2 lines) */}
        <div className="mt-3 space-y-1.5">
          <div className="skeleton-shimmer h-3.5 w-full rounded" />
          <div className="skeleton-shimmer h-3.5 w-5/6 rounded" />
        </div>

        {/* Tags placeholders */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          <div className="skeleton-shimmer h-4 w-14 rounded" />
          <div className="skeleton-shimmer h-4 w-16 rounded" />
          <div className="skeleton-shimmer h-4 w-12 rounded" />
        </div>
      </div>

      {/* Footer: Qualification bar placeholder + VoteButton footprint */}
      <div className="mt-6 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
        {/* Qualification progress */}
        <div className="space-y-1.5">
          <div className="skeleton-shimmer h-3 w-28 rounded" />
          <div className="skeleton-shimmer h-1.5 w-36 rounded-full" />
        </div>

        {/* VoteButton pill: 44px height x 80px width */}
        <div className="skeleton-shimmer h-10 w-20 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Grid of card skeletons for feed loading state
 */
export function IdeaCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <IdeaCardSkeleton key={i} />
      ))}
    </div>
  );
}
