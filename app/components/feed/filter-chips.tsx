'use client';

import React, { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CATEGORIES, CATEGORY_LABELS, type Category } from '@/lib/constants';
import {
  Filter,
  X,
  Tag as TagIcon,
  Cpu,
  Code2,
  Leaf,
  Coins,
  HeartPulse,
  Radio,
  LayoutGrid,
  Users,
  GraduationCap,
  Sparkles,
  Layers,
} from 'lucide-react';

interface FilterChipsProps {
  selectedCategories: string[];
  selectedTags: string[];
  availableTags?: string[];
  className?: string;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  all: Layers,
  ai: Cpu,
  'developer-tools': Code2,
  sustainability: Leaf,
  fintech: Coins,
  health: HeartPulse,
  hardware: Radio,
  product: LayoutGrid,
  social: Users,
  education: GraduationCap,
  other: Sparkles,
};

/**
 * FilterChips Component
 * - Premium interactive visual category chips with icons
 * - Popular tags row with active states
 * - URL searchParams synchronization
 * - "Clear all filters" quick action
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
  const totalActive = selectedCategories.length + selectedTags.length;

  return (
    <section
      aria-label="Event filter options"
      className={`flex flex-col gap-3.5 py-1 ${className}`}
    >
      {/* Category Pills Row with Icons */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">
          <Filter className="h-3.5 w-3.5 text-[var(--indigo-bright)]" />
          <span>Categories:</span>
        </div>

        <div className="no-scrollbar scroll-touch flex items-center gap-2 overflow-x-auto pb-1 text-xs [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* All Categories Pill */}
          <button
            type="button"
            onClick={() => updateFilters([], selectedTags)}
            className={`group flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo-bright)] active:scale-95 ${
              selectedCategories.length === 0
                ? 'border border-[var(--indigo-bright)] bg-gradient-to-r from-[var(--indigo)] to-[var(--indigo-deep)] text-white shadow-[var(--glow-indigo-sm)] hover:shadow-[var(--glow-indigo-md)]'
                : 'border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] hover:shadow-sm'
            }`}
          >
            <Layers className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110" />
            <span>All Events</span>
          </button>

          {/* Individual Category Pills */}
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategories.includes(cat);
            const label = CATEGORY_LABELS[cat as Category] || cat;
            const Icon = CATEGORY_ICONS[cat] || Sparkles;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                aria-pressed={isSelected}
                className={`group flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo-bright)] active:scale-95 ${
                  isSelected
                    ? 'border border-[var(--indigo-bright)] bg-gradient-to-r from-[var(--indigo)] to-[var(--indigo-deep)] text-white shadow-[var(--glow-indigo-sm)] hover:shadow-[var(--glow-indigo-md)]'
                    : 'border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)] hover:shadow-sm'
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110 ${isSelected ? 'text-white' : 'text-[var(--indigo-bright)]'}`}
                />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Popular Tags Row & Clear Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-2.5">
        <div className="no-scrollbar scroll-touch flex items-center gap-1.5 overflow-x-auto text-xs [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex shrink-0 items-center gap-1 pr-1 text-[11px] font-medium text-[var(--text-tertiary)]">
            <TagIcon className="h-3 w-3 text-[var(--cyan-bright)]" />
            <span>Hot Topics:</span>
          </div>

          {availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);

            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                aria-pressed={isSelected}
                className={`flex-shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[11px] transition-all duration-150 hover:-translate-y-0.5 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan-bright)] active:scale-95 ${
                  isSelected
                    ? 'border border-[var(--cyan-bright)] bg-[rgba(34,211,238,0.18)] text-[var(--cyan-bright)] shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                    : 'border border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--text-tertiary)] hover:border-[var(--cyan-bright)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="flex flex-shrink-0 items-center gap-1 rounded-full border border-[rgba(248,113,113,0.3)] bg-[var(--surface-2)] px-2.5 py-1 text-[11px] font-medium text-[var(--danger)] transition-all hover:bg-[rgba(248,113,113,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger)]"
          >
            <X className="h-3 w-3" />
            <span>Reset filters ({totalActive})</span>
          </button>
        )}
      </div>
    </section>
  );
}
