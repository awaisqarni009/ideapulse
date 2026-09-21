'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lightbulb, FilterX, PlusCircle, RotateCcw } from 'lucide-react';

interface FeedEmptyStateProps {
  type: 'no_results' | 'no_ideas';
  cycleNumber?: number;
  className?: string;
}

/**
 * FeedEmptyState Component per PRD.md US-06 and TASKS.md [T-4.7]
 * - Renders specific empty state for no filter matches vs empty cycle
 * - L2 glass container with distinct CTA actions
 */
export function FeedEmptyState({ type, cycleNumber = 1, className = '' }: FeedEmptyStateProps) {
  const router = useRouter();

  if (type === 'no_results') {
    return (
      <div
        role="status"
        className={`glass-panel flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-2)] p-12 text-center backdrop-blur-[var(--blur-md)] ${className}`}
        style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--surface-3)] text-[var(--text-tertiary)] shadow-inner">
          <FilterX className="h-6 w-6 text-[var(--indigo-bright)]" />
        </div>

        <h3 className="mt-4 font-display text-lg font-bold text-[var(--text-primary)]">
          No ideas found matching filters
        </h3>
        <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
          We couldn&apos;t find any proposals matching your selected categories or tags. Try
          broadening your filters.
        </p>

        <button
          type="button"
          onClick={() => router.push('/feed')}
          className="btn glass-panel mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--indigo-bright)] bg-[rgba(99,102,241,0.15)] px-5 py-2.5 text-xs font-semibold text-[var(--indigo-bright)] shadow-[var(--glow-indigo-sm)] transition-all hover:bg-[rgba(99,102,241,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo-bright)]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset all filters</span>
        </button>
      </div>
    );
  }

  return (
    <div
      role="status"
      className={`glass-panel flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-2)] p-12 text-center backdrop-blur-[var(--blur-md)] ${className}`}
      style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-accent)] bg-[rgba(99,102,241,0.15)] text-[var(--indigo-bright)] shadow-[var(--glow-indigo-sm)]">
        <Lightbulb className="h-6 w-6" />
      </div>

      <h3 className="mt-4 font-display text-lg font-bold text-[var(--text-primary)]">
        No proposals yet for Cycle #{cycleNumber}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
        The community race is open! Be the first member to submit an idea and rally verified votes.
      </p>

      <Link
        href="/submit"
        className="btn mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--indigo)] to-[var(--indigo-deep)] px-6 py-2.5 text-xs font-semibold text-white shadow-[var(--glow-indigo-sm)] transition-all hover:from-[var(--indigo-bright)] hover:to-[var(--indigo)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo-bright)]"
      >
        <PlusCircle className="h-3.5 w-3.5" />
        <span>Submit the first idea</span>
      </Link>
    </div>
  );
}
