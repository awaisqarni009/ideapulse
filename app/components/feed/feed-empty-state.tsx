'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { EmptyState } from '@/app/components/ui/empty-state';
import { FilterX, Lightbulb } from 'lucide-react';

interface FeedEmptyStateProps {
  type: 'no_results' | 'no_ideas';
  cycleNumber?: number;
  className?: string;
}

/**
 * FeedEmptyState Component per DESIGN.md §7.11 and TASKS.md [T-4.7, T-7.7]
 * Renders exact empty state for no filter matches vs empty cycle.
 */
export function FeedEmptyState({ type, cycleNumber = 1, className = '' }: FeedEmptyStateProps) {
  const router = useRouter();

  if (type === 'no_results') {
    return (
      <EmptyState
        icon={FilterX}
        heading="No ideas match these filters"
        description="Try adjusting or clearing your category and tag filters to discover active cycle submissions."
        action={{
          label: 'Clear filters',
          onClick: () => router.push('/feed'),
        }}
        className={className}
      />
    );
  }

  return (
    <EmptyState
      icon={Lightbulb}
      heading="This cycle is waiting for its first idea"
      description={`Cycle #${cycleNumber} is open for proposals. Submit your project to start rallying verified community votes.`}
      action={{
        label: 'Post an idea',
        href: '/submit',
      }}
      className={className}
    />
  );
}
