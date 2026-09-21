'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, Award, ExternalLink } from 'lucide-react';

export interface ProfileRewardItem {
  id: string;
  rank: number;
  title: string;
  verified_votes: number;
  cycle_number: number;
  idea_title: string;
  idea_slug: string;
}

interface ProfileRewardsProps {
  rewards: ProfileRewardItem[];
  displayName: string;
}

/**
 * ProfileRewards Component per TASKS.md [T-5.11] and PRD.md F-05
 * Displays verified awards and honors earned in past cycles.
 */
export function ProfileRewards({ rewards, displayName }: ProfileRewardsProps) {
  if (rewards.length === 0) {
    return (
      <div
        className="glass-panel flex flex-col items-center justify-center rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-8 text-center backdrop-blur-[var(--blur-md)]"
        style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
      >
        <Trophy className="mb-2 h-8 w-8 text-[var(--text-tertiary)]" />
        <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
          No cycle rewards earned yet
        </h3>
        <p className="mt-1 max-w-sm text-xs text-[var(--text-secondary)]">
          When proposals authored by {displayName} place in the top 3 and qualify, permanent honors
          appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rewards.map((reward) => {
        const isFirst = reward.rank === 1;

        return (
          <div
            key={reward.id}
            className={`glass-panel relative flex flex-col justify-between rounded-2xl border p-5 backdrop-blur-[var(--blur-md)] transition-all ${
              isFirst
                ? 'border-[var(--border-qualified)] bg-[var(--surface-2)] shadow-[var(--glow-violet-sm)]'
                : 'border-[var(--border-default)] bg-[var(--surface-1)]'
            }`}
            style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
          >
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-xs font-bold ${
                    isFirst
                      ? 'border border-[var(--border-qualified)] bg-[rgba(139,92,246,0.25)] text-[var(--violet-bright)]'
                      : 'border border-[var(--border-subtle)] bg-[var(--surface-3)] text-[var(--text-secondary)]'
                  }`}
                >
                  Rank #{String(reward.rank).padStart(2, '0')}
                </span>

                <Link
                  href={`/cycles/${reward.cycle_number}`}
                  className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[var(--indigo-bright)] hover:underline"
                >
                  <span>Cycle #{reward.cycle_number}</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <h4 className="line-clamp-2 font-display text-base font-bold text-[var(--text-primary)]">
                {reward.idea_slug ? (
                  <Link
                    href={`/ideas/${reward.idea_slug}`}
                    className="transition-colors hover:text-[var(--indigo-bright)]"
                  >
                    {reward.idea_title}
                  </Link>
                ) : (
                  reward.title
                )}
              </h4>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3 text-xs">
              <span className="font-mono text-[var(--cyan-bright)]">
                {reward.verified_votes} verified votes
              </span>
              <span className="flex items-center gap-1 font-semibold text-[var(--violet-bright)]">
                <Trophy className="h-3 w-3" />
                <span>Awarded</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
