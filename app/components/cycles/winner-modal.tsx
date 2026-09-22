'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getWinnerRewardsAction, type WinnerRewardItem } from '@/app/actions/rewards';
import { useFocusTrap } from '@/lib/hooks/use-focus-trap';
import { Trophy, Award, X, ArrowRight, Sparkles } from 'lucide-react';

export function WinnerModal() {
  const [activeReward, setActiveReward] = useState<WinnerRewardItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleDismiss = () => {
    if (activeReward) {
      localStorage.setItem(`ideapulse:winner_seen:${activeReward.id}`, 'true');
    }
    setIsOpen(false);
  };

  const modalRef = useFocusTrap<HTMLDivElement>({
    isOpen,
    onClose: handleDismiss,
  });

  useEffect(() => {
    async function checkForUnacknowledgedReward() {
      try {
        const rewards = await getWinnerRewardsAction();
        for (const reward of rewards) {
          const key = `ideapulse:winner_seen:${reward.id}`;
          if (!localStorage.getItem(key)) {
            setActiveReward(reward);
            setIsOpen(true);
            break;
          }
        }
      } catch {
        // Non-blocking background check
      }
    }

    checkForUnacknowledgedReward();
  }, []);

  if (!isOpen || !activeReward) return null;

  const isFirst = activeReward.rank === 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="winner-modal-title"
      className="fixed inset-0 z-[401] flex items-center justify-center p-4 sm:p-6"
    >
      {/* Scrim backdrop */}
      <div
        onClick={handleDismiss}
        className="fixed inset-0 bg-[#070A11]/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog Surface */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="animate-in fade-in zoom-in-95 relative z-10 w-full max-w-md overflow-hidden rounded-[28px] border border-[var(--border-qualified)] bg-[var(--surface-3)] p-6 text-center shadow-[var(--glow-violet-lg)] duration-300 sm:p-8"
        style={{
          boxShadow: 'inset 0 1px 0 var(--edge-specular), 0 0 40px -8px rgba(139,92,246,0.35)',
        }}
      >
        {/* Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss winner announcement"
          className="absolute right-4 top-4 rounded-full p-2 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo-bright)]"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Trophy icon banner */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border-qualified)] bg-[rgba(139,92,246,0.2)] text-[var(--violet-bright)] shadow-[var(--glow-violet-md)]">
          <Trophy className="h-8 w-8 animate-bounce duration-1000" />
        </div>

        {/* Modal Title */}
        <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-[var(--border-qualified)] bg-[rgba(139,92,246,0.12)] px-3 py-1 text-xs font-semibold text-[var(--violet-bright)]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Cycle #{activeReward.cycle_number} Celebration</span>
        </div>

        <h2
          id="winner-modal-title"
          className="mt-3 font-display text-2xl font-extrabold tracking-tight text-[var(--text-primary)]"
        >
          Congratulations! You Won!
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
          Your proposal placed in the top 3 and officially qualified for rewards in Cycle #
          {activeReward.cycle_number}.
        </p>

        {/* Placement Card */}
        <div className="mt-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-4 text-left">
          <div className="flex items-center justify-between">
            <span
              className={`rounded-full px-2.5 py-0.5 font-mono text-xs font-bold ${
                isFirst
                  ? 'border border-[var(--border-qualified)] bg-[rgba(139,92,246,0.25)] text-[var(--violet-bright)]'
                  : 'border border-[var(--border-subtle)] bg-[var(--surface-3)] text-[var(--text-secondary)]'
              }`}
            >
              Rank #{String(activeReward.rank).padStart(2, '0')}
            </span>

            <span className="rounded-full border border-[rgba(6,182,212,0.2)] bg-[rgba(6,182,212,0.12)] px-2.5 py-0.5 font-mono text-xs font-bold text-[var(--cyan-bright)]">
              {activeReward.verified_votes} verified votes
            </span>
          </div>

          <h3 className="mt-2.5 line-clamp-2 font-display text-base font-bold text-[var(--text-primary)]">
            {activeReward.idea_title}
          </h3>
        </div>

        {/* Action Buttons */}
        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href={`/cycles/${activeReward.cycle_number}`}
            onClick={handleDismiss}
            className="btn inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--indigo-bright)] px-5 py-3 text-xs font-bold text-white shadow-[var(--glow-indigo-md)] transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo-bright)]"
          >
            <span>View Cycle Results</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleDismiss}
            className="btn inline-flex w-full items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] px-4 py-3 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo-bright)] sm:w-auto"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
