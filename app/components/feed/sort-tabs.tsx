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
  { id: 'top', label: 'Top Ranked', icon: Trophy },
];

/**
 * SortTabs Component
 * Switches between Trending, Newest, and Top Ranked, with state reflected in the URL.
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

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % SORT_OPTIONS.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + SORT_OPTIONS.length) % SORT_OPTIONS.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = SORT_OPTIONS.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      const nextOption = SORT_OPTIONS[nextIndex];
      if (nextOption) {
        handleSortChange(nextOption.id);
      }
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Feed sorting options"
      className={`glass-panel flex w-full shrink-0 items-center justify-between gap-1 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] p-1 shadow-sm backdrop-blur-[var(--blur-md)] sm:w-auto sm:justify-start ${className}`}
      style={{
        boxShadow: 'inset 0 1px 0 var(--edge-specular)',
      }}
    >
      {SORT_OPTIONS.map((option, index) => {
        const Icon = option.icon;
        const isActive = currentSort === option.id;

        return (
          <button
            key={option.id}
            role="tab"
            type="button"
            tabIndex={isActive ? 0 : -1}
            aria-selected={isActive}
            onClick={() => handleSortChange(option.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`group flex flex-1 items-center justify-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo-bright)] active:scale-95 sm:flex-initial sm:px-3.5 sm:text-xs ${
              isActive
                ? 'border border-[var(--border-accent)] bg-gradient-to-r from-[var(--indigo)] to-[var(--indigo-deep)] text-white shadow-[var(--glow-indigo-sm)] hover:shadow-[var(--glow-indigo-md)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)] hover:shadow-sm'
            }`}
          >
            <Icon
              className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                isActive
                  ? 'text-white'
                  : option.id === 'trending'
                    ? 'text-[var(--cyan-bright)]'
                    : 'text-[var(--text-tertiary)]'
              }`}
            />
            <span className="truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
