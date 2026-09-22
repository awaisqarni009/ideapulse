import React from 'react';

/**
 * LeaderboardRowSkeleton Component per DESIGN.md §6.4, §7.6 and TASKS.md [T-7.9]
 * - Exact 72px height footprint matching <LeaderboardRow /> to ensure CLS = 0
 * - 1.6s shimmer sweep animation
 * - Specular top edge highlight
 */
export function LeaderboardRowSkeleton() {
  return (
    <li
      role="status"
      aria-label="Loading leaderboard ranking"
      className="glass-panel relative flex min-h-[72px] w-full list-none items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-1)] px-5 py-3.5"
      style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
    >
      {/* Left Side: Rank numeral + Title + Author */}
      <div className="flex min-w-0 items-center gap-4 sm:gap-6">
        {/* Rank Numeral placeholder */}
        <div className="skeleton-shimmer h-7 w-8 rounded-[var(--radius-xs)]" />

        {/* Title & Author placeholder */}
        <div className="space-y-1.5">
          <div className="skeleton-shimmer h-4 w-48 rounded sm:w-64" />
          <div className="skeleton-shimmer h-3 w-28 rounded sm:w-36" />
        </div>
      </div>

      {/* Right Side: Status badge placeholder + Vote Count Pill */}
      <div className="flex items-center gap-3 sm:gap-6">
        <div className="skeleton-shimmer hidden h-5 w-20 rounded-[var(--radius-xs)] sm:block" />
        <div className="skeleton-shimmer h-8 w-16 rounded-full" />
      </div>
    </li>
  );
}

export function LeaderboardSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <ul className="space-y-3" role="list" aria-label="Loading leaderboard rankings">
      {Array.from({ length: count }).map((_, i) => (
        <LeaderboardRowSkeleton key={i} />
      ))}
    </ul>
  );
}
