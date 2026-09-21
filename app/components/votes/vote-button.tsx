'use client';

import React, { useState, useTransition, useOptimistic } from 'react';
import { useRouter } from 'next/navigation';
import { castVoteAction } from '@/app/actions/votes';
import { Zap, Lock, Loader2, X, AlertCircle } from 'lucide-react';

export type VoteButtonState =
  | 'available'
  | 'voted'
  | 'retractable'
  | 'quota_exhausted'
  | 'own_idea'
  | 'anonymous'
  | 'pending'
  | 'rejected';

interface VoteButtonProps {
  ideaId: string;
  initialVoteCount: number;
  initialHasVoted?: boolean;
  isAuthor?: boolean;
  isAnonymous?: boolean;
  isQuotaExhausted?: boolean;
  nextSlotDuration?: string;
  voteCreatedAt?: string;
  onRetract?: () => void;
  className?: string;
}

export function VoteButton({
  ideaId,
  initialVoteCount,
  initialHasVoted = false,
  isAuthor = false,
  isAnonymous = false,
  isQuotaExhausted = false,
  nextSlotDuration = '3h 41m',
  voteCreatedAt,
  onRetract,
  className = '',
}: VoteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local persistent state after reconciliation
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Optimistic UI update [T-3.12]
  const [optimisticState, setOptimisticState] = useOptimistic(
    { hasVoted, voteCount },
    (current, action: 'vote' | 'rollback') => {
      if (action === 'vote') {
        return { hasVoted: true, voteCount: current.voteCount + 1 };
      }
      return { hasVoted: false, voteCount: Math.max(0, current.voteCount - 1) };
    },
  );

  // Check 10-minute retraction window (RULES.md BR-014)
  const isWithinRetractionWindow = Boolean(
    optimisticState.hasVoted &&
    voteCreatedAt &&
    Date.now() - new Date(voteCreatedAt).getTime() < 10 * 60 * 1000,
  );

  // Resolve visual state per DESIGN.md §7.2
  let state: VoteButtonState = 'available';
  if (isPending) {
    state = 'pending';
  } else if (inlineError) {
    state = 'rejected';
  } else if (isAuthor) {
    state = 'own_idea';
  } else if (isWithinRetractionWindow && onRetract) {
    state = 'retractable';
  } else if (optimisticState.hasVoted) {
    state = 'voted';
  } else if (isQuotaExhausted) {
    state = 'quota_exhausted';
  } else if (isAnonymous) {
    state = 'anonymous';
  }

  const handleVoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // 1. If anonymous, redirect to login with return path [T-3.19, AC-06.2]
    if (isAnonymous) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // 2. Disabled cases
    if (isAuthor || optimisticState.hasVoted || isQuotaExhausted || isPending) {
      return;
    }

    setInlineError(null);

    startTransition(async () => {
      // Apply optimistic update immediately
      setOptimisticState('vote');

      const result = await castVoteAction(ideaId);

      if (!result.success) {
        // Rollback optimistic state with rejection shake and inline error [T-3.13, T-3.15]
        setOptimisticState('rollback');
        setInlineError(result.error.message);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        return;
      }

      // Reconciled with server response
      setHasVoted(true);
      setVoteCount((prev) => prev + 1);
    });
  };

  // Tooltip resolution
  const getTooltip = () => {
    switch (state) {
      case 'own_idea':
        return "You can't vote on your own idea.";
      case 'voted':
        return 'You voted for this.';
      case 'retractable':
        return 'Click × to retract within 10m window';
      case 'quota_exhausted':
        return `Next vote in ${nextSlotDuration}.`;
      default:
        return 'Cast your vote (1 quota)';
    }
  };

  return (
    <div className="relative inline-flex flex-col items-center">
      {/* 44px Pill Button Container */}
      <button
        type="button"
        title={getTooltip()}
        disabled={isAuthor || isQuotaExhausted || state === 'voted'}
        onClick={handleVoteClick}
        aria-label={`Vote on idea. Current votes: ${optimisticState.voteCount}`}
        className={`group relative flex h-[44px] min-w-[76px] items-center justify-center gap-2 rounded-full px-4 text-[14px] font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo-bright)] ${
          isShaking ? 'animate-bounce' : ''
        } ${
          state === 'voted' || state === 'retractable'
            ? 'cursor-default border border-[rgba(139,92,246,0.45)] bg-[rgba(139,92,246,0.14)] text-[var(--violet-bright)] shadow-[var(--glow-violet-md)]'
            : state === 'own_idea'
              ? 'cursor-not-allowed border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-tertiary)] opacity-35'
              : state === 'quota_exhausted'
                ? 'cursor-not-allowed border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-tertiary)] opacity-45'
                : state === 'pending'
                  ? 'pointer-events-none border border-[var(--border-accent)] bg-[var(--surface-2)] opacity-80'
                  : 'border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] backdrop-blur-[var(--blur-sm)] hover:border-[var(--border-accent)] hover:shadow-[var(--glow-indigo-md)] active:scale-95'
        } ${className}`}
        style={{
          boxShadow:
            state === 'voted'
              ? '0 0 16px rgba(139, 92, 246, 0.35), inset 0 1px 0 var(--edge-specular)'
              : 'inset 0 1px 0 var(--edge-specular)',
        }}
      >
        {/* Leading Icon State */}
        {state === 'pending' ? (
          <Loader2 className="h-4 w-4 animate-spin text-[var(--indigo-bright)]" />
        ) : state === 'own_idea' ? (
          <Lock className="h-4 w-4 text-[var(--text-tertiary)]" />
        ) : state === 'voted' || state === 'retractable' ? (
          <Zap className="h-4 w-4 fill-current text-[var(--violet-bright)]" />
        ) : (
          <Zap className="h-4 w-4 text-[var(--indigo)] transition-transform group-hover:scale-110" />
        )}

        {/* Count in numeric tabular font */}
        <span className="font-mono tabular-nums tracking-tight">{optimisticState.voteCount}</span>

        {/* Retractable close affordance during 10m window [T-3.18] */}
        {state === 'retractable' && onRetract && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onRetract();
            }}
            className="ml-0.5 rounded-full p-0.5 opacity-0 transition-opacity hover:bg-[rgba(139,92,246,0.25)] group-hover:opacity-100"
            title="Retract vote"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        )}
      </button>

      {/* Rollback inline rejection message per RULES.md §7 [T-3.13] */}
      {inlineError && (
        <div
          role="alert"
          className="absolute top-[48px] z-20 flex items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-xs)] border border-[rgba(239,68,68,0.3)] bg-[var(--surface-4)] px-2.5 py-1 text-xs text-[var(--accent-danger)] shadow-lg backdrop-blur-[var(--blur-md)]"
        >
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{inlineError}</span>
        </div>
      )}
    </div>
  );
}
