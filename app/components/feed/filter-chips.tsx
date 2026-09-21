'use client';

import React, { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CATEGORIES, CATEGORY_LABELS, type Category } from '@/lib/constants';
import { Filter, X, Tag as TagIcon } from 'lucide-react';

interface FilterChipsProps {
  selectedCategories: string[];
  selectedTags: string[];
  availableTags?: string[];
  className?: string;
}

/**
 * FilterChips Component per DESIGN.md §7.8 and TASKS.md [T-4.6]
 * - Multi-select category pills
 * - Tag filter chips
 * - Synchronized with URL searchParams (`?category=...&tag=...`)
 * - "Clear filters" quick action
 */
export function FilterChips({
  selectedCategories,
  selectedTags,
  availableTags = [
    'offline-first',
    'zkp',
    'ai',
    'crdt',
    'open-science',
    'safety',
    'edge-ai',
    'rust',
    'clean-tech',
    'privacy',
  ],
  className = '',
}: FilterChipsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilters = (newCategories: string[], newTags: string[]) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newCategories.length > 0) {
      params.set('category', newCategories.join(','));
    } else {
      params.delete('category');
    }

    if (newTags.length > 0) {
      params.set('tag', newTags.join(','));
    } else {
      params.delete('tag');
    }

    startTransition(() => {
      router.push(`/feed?${params.toString()}`);
    });
  };

  const toggleCategory = (cat: string) => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    updateFilters(next, selectedTags);
  };

  const toggleTag = (tag: string) => {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    updateFilters(selectedCategories, next);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    params.delete('tag');
    startTransition(() => {
      router.push(`/feed?${params.toString()}`);
    });
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedTags.length > 0;

  return (
    <section aria-label="Feed filter options" className={`flex flex-col gap-3 py-2 ${className}`}>
      {/* Category Pills Row */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center gap-1.5 pr-2 font-medium text-[var(--text-tertiary)]">
          <Filter className="h-3.5 w-3.5 text-[var(--indigo-bright)]" />
          <span>Categories:</span>
        </div>

        {/* All Categories Reset Button */}
        <button
          type="button"
          onClick={() => updateFilters([], selectedTags)}
          className={`flex-shrink-0 rounded-full px-3 py-1 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo-bright)] ${
            selectedCategories.length === 0
              ? 'border border-[var(--indigo-bright)] bg-[rgba(99,102,241,0.15)] text-[var(--text-primary)] shadow-[var(--glow-indigo-sm)]'
              : 'border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
          }`}
        >
          All
        </button>

        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategories.includes(cat);
          const label = CATEGORY_LABELS[cat as Category] || cat;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCategory(cat)}
              aria-pressed={isSelected}
              className={`flex-shrink-0 rounded-full px-3 py-1 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo-bright)] ${
                isSelected
                  ? 'border border-[var(--indigo-bright)] bg-gradient-to-r from-[var(--indigo)] to-[var(--indigo-deep)] text-white shadow-[var(--glow-indigo-sm)]'
                  : 'border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Popular Tags Row */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center gap-1.5 pr-2 font-medium text-[var(--text-tertiary)]">
          <TagIcon className="h-3.5 w-3.5 text-[var(--cyan-bright)]" />
          <span>Tags:</span>
        </div>

        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);

          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              aria-pressed={isSelected}
              className={`flex-shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[11px] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan-bright)] ${
                isSelected
                  ? 'border border-[var(--cyan-bright)] bg-[rgba(34,211,238,0.18)] text-[var(--cyan-bright)] shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                  : 'border border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--text-tertiary)] hover:border-[var(--border-strong)] hover:text-[var(--text-secondary)]'
              }`}
            >
              #{tag}
            </button>
          );
        })}

        {/* Clear Filters button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="flex flex-shrink-0 items-center gap-1 rounded-full border border-[rgba(248,113,113,0.3)] bg-[var(--surface-2)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--danger)] transition-all hover:bg-[rgba(248,113,113,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger)]"
          >
            <X className="h-3 w-3" />
            <span>Clear filters</span>
          </button>
        )}
      </div>
    </section>
  );
}
