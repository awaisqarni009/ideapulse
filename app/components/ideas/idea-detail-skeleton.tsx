import React from 'react';

/**
 * IdeaDetailSkeleton Component per DESIGN.md §7.3 and TASKS.md [T-7.9]
 * Preserves exact layout dimensions of the idea detail page (CLS = 0).
 */
export function IdeaDetailSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading idea details"
      className="glass-panel mx-auto max-w-4xl rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-1)] p-6 sm:p-10"
      style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
    >
      {/* Top Bar: Category badge & Vote button */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div className="flex items-center gap-2">
          <div className="skeleton-shimmer h-6 w-24 rounded-[var(--radius-xs)]" />
          <div className="skeleton-shimmer h-6 w-32 rounded-[var(--radius-xs)]" />
        </div>
        <div className="skeleton-shimmer h-[44px] w-[80px] rounded-full" />
      </div>

      {/* Title */}
      <div className="mt-6 space-y-3">
        <div className="skeleton-shimmer h-8 w-4/5 rounded" />
        <div className="skeleton-shimmer h-8 w-1/2 rounded" />
      </div>

      {/* Author & Meta */}
      <div className="mt-4 flex items-center gap-3">
        <div className="skeleton-shimmer h-9 w-9 rounded-full" />
        <div className="space-y-1">
          <div className="skeleton-shimmer h-3.5 w-28 rounded" />
          <div className="skeleton-shimmer h-3 w-20 rounded" />
        </div>
      </div>

      {/* Summary Box */}
      <div className="my-8 space-y-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-5">
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-5/6 rounded" />
      </div>

      {/* Qualification Bar Box */}
      <div className="my-8 space-y-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-5">
        <div className="flex justify-between">
          <div className="skeleton-shimmer h-3.5 w-36 rounded" />
          <div className="skeleton-shimmer h-3.5 w-20 rounded" />
        </div>
        <div className="skeleton-shimmer h-2 w-full rounded-full" />
      </div>

      {/* Proposal Body */}
      <div className="max-w-[68ch] space-y-3 pt-4">
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-4/5 rounded" />
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-2/3 rounded" />
      </div>
    </div>
  );
}
