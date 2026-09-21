'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { FeedSortOption } from '@/lib/feed';
import { Flame, Clock, Trophy } from 'lucide-react';

interface SortTabsProps {
  currentSort: FeedSortOption;
  className?: string;
}

const SORT_OPTIONS: { id: FeedSortOption; label: string; icon: React.ElementType }[] = [
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'newest', label: 'Newest', icon: Clock },
  { id: 'top', label: 'Top this Cycle', icon: Trophy },
];

/**
 * SortTabs Component per DESIGN.md §7.1 and TASKS.md [T-4.4]
 * Switches between Trending, Newest, and Top this Cycle, with state reflected in the URL.
 */
export function SortTabs({ currentSort, className = '' }: SortTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (sortId: FeedSortOption) => {
    if (sortId === currentSort) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sortId);
    router.push(`/feed?${params.toString()}`);
  };

  return (
    <div
      role="tablist"
      aria-label="Feed sorting options"
      className={`glass-panel inline-flex items-center gap-1 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] p-1 backdrop-blur-[var(--blur-md)] ${className}`}
      style={{
        boxShadow: 'inset 0 1px 0 var(--edge-specular)',
      }}
    >
      {SORT_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = currentSort === option.id;

        return (
          <button
            key={option.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => handleSortChange(option.id)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo-bright)] ${
              isActive
                ? 'border border-[var(--border-accent)] bg-gradient-to-r from-[var(--indigo)] to-[var(--indigo-deep)] text-white shadow-[var(--glow-indigo-sm)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Icon
              className={`h-3.5 w-3.5 ${
                isActive
                  ? 'text-white'
                  : option.id === 'trending'
                    ? 'text-[var(--cyan-bright)]'
                    : 'text-[var(--text-tertiary)]'
              }`}
            />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
