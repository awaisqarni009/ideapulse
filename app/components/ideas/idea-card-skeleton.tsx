import React from 'react';

interface IdeaCardSkeletonProps {
  viewMode?: 'grid' | 'list';
  className?: string;
}

/**
 * IdeaCardSkeleton Component
 * Matches the updated Eventify IdeaCard footprint with hero image area
 * to guarantee zero Cumulative Layout Shift (CLS = 0).
 */
export function IdeaCardSkeleton({ viewMode = 'grid', className = '' }: IdeaCardSkeletonProps) {
  if (viewMode === 'list') {
    return (
      <div
        role="status"
        aria-label="Loading event item"
        className={`glass-panel relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--surface-2)] backdrop-blur-[var(--blur-md)] md:flex-row ${className}`}
        style={{
          boxShadow: 'inset 0 1px 0 var(--edge-specular)',
        }}
      >
        <div className="skeleton-shimmer aspect-[16/9] shrink-0 bg-[var(--surface-3)] md:aspect-auto md:w-72" />
        <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
          <div className="space-y-3">
            <div className="skeleton-shimmer h-3.5 w-48 rounded" />
            <div className="skeleton-shimmer h-5 w-3/4 rounded" />
            <div className="skeleton-shimmer h-3.5 w-full rounded" />
          </div>
          <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
            <div className="skeleton-shimmer h-4 w-32 rounded" />
            <div className="skeleton-shimmer h-8 w-20 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label="Loading event proposal"
      className={`glass-panel relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--surface-2)] backdrop-blur-[var(--blur-md)] ${className}`}
      style={{
        boxShadow: 'inset 0 1px 0 var(--edge-specular)',
      }}
    >
      <div>
        {/* Hero image placeholder (16:9) */}
        <div className="skeleton-shimmer relative aspect-[16/9] w-full bg-[var(--surface-3)]" />

        {/* Content body */}
        <div className="space-y-3.5 p-5">
          {/* Author & Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="skeleton-shimmer h-6 w-6 rounded-full" />
              <div className="skeleton-shimmer h-3.5 w-24 rounded" />
            </div>
            <div className="skeleton-shimmer h-3.5 w-20 rounded" />
          </div>

          {/* Title lines */}
          <div className="space-y-2 pt-1">
            <div className="skeleton-shimmer h-4 w-full rounded" />
            <div className="skeleton-shimmer h-4 w-4/5 rounded" />
          </div>

          {/* Summary */}
          <div className="space-y-1.5 pt-1">
            <div className="skeleton-shimmer h-3 w-full rounded" />
            <div className="skeleton-shimmer h-3 w-2/3 rounded" />
          </div>

          {/* Progress bar placeholder */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between">
              <div className="skeleton-shimmer h-3 w-20 rounded" />
              <div className="skeleton-shimmer h-3 w-16 rounded" />
            </div>
            <div className="skeleton-shimmer h-1.5 w-full rounded-full" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[var(--surface-1)]/50 border-t border-[var(--border-subtle)] p-4">
        <div className="flex items-center justify-between">
          <div className="skeleton-shimmer h-5 w-24 rounded-full" />
          <div className="skeleton-shimmer h-8 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Grid of card skeletons for feed loading state
 */
export function IdeaCardSkeletonGrid({
  count = 6,
  viewMode = 'grid',
}: {
  count?: number;
  viewMode?: 'grid' | 'list';
}) {
  return (
    <div
      className={
        viewMode === 'list'
          ? 'flex flex-col gap-4'
          : 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
      }
    >
      {Array.from({ length: count }).map((_, i) => (
        <IdeaCardSkeleton key={i} viewMode={viewMode} />
      ))}
    </div>
  );
}
