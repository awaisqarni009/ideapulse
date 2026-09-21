'use client';

import React, { useState, useTransition, useOptimistic, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { castVoteAction, retractVoteAction } from '@/app/actions/votes';
import { voteRing, countRoll, iconPop, rejectionShake } from './motion';
import { useToast } from '@/app/components/ui/toast';
import { AuthModal } from '@/app/components/auth/auth-modal';
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
  nextSlotDuration = 'in 24 hours',
  voteCreatedAt: initialVoteCreatedAt,
  onRetract,
  className = '',
}: VoteButtonProps) {
  const router = useRouter();
  const toast = useToast();
  const reduce = useReducedMotion() ?? false;
  const [isPending, startTransition] = useTransition();

  // Local persistent state after reconciliation
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [voteCreatedAt, setVoteCreatedAt] = useState<string | undefined>(initialVoteCreatedAt);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showRing, setShowRing] = useState(false);
  const [isPopping, setIsPopping] = useState(false);
  const [retractionCountdown, setRetractionCountdown] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Optimistic UI update [T-3.12]
  const [optimisticState, setOptimisticState] = useOptimistic(
    { hasVoted, voteCount },
    (current, action: 'vote' | 'rollback' | 'retract') => {
      if (action === 'vote') {
        return { hasVoted: true, voteCount: current.voteCount + 1 };
      }
      if (action === 'retract') {
        return { hasVoted: false, voteCount: Math.max(0, current.voteCount - 1) };
      }
      return { hasVoted: false, voteCount: Math.max(0, current.voteCount - 1) };
    },
  );

  // 10-minute Retraction Window timer (RULES.md BR-014, TASKS.md T-3.18)
  const calculateRemainingRetraction = useCallback(() => {
    if (!optimisticState.hasVoted) return null;

    const createdAtMs = voteCreatedAt ? new Date(voteCreatedAt).getTime() : Date.now();
    if (isNaN(createdAtMs)) return null;

    const diffMs = 10 * 60 * 1000 - (Date.now() - createdAtMs);
    if (diffMs <= 0) return null;

    const mins = Math.floor(diffMs / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  }, [optimisticState.hasVoted, voteCreatedAt]);

  useEffect(() => {
    const remaining = calculateRemainingRetraction();
    setRetractionCountdown(remaining);

    if (!remaining) return;

    const interval = setInterval(() => {
      const rem = calculateRemainingRetraction();
      setRetractionCountdown(rem);
      if (!rem) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateRemainingRetraction]);

  const isWithinRetractionWindow = Boolean(retractionCountdown);

  // Resolve visual state per DESIGN.md §7.2
  let state: VoteButtonState = 'available';
  if (isPending) {
    state = 'pending';
  } else if (inlineError) {
    state = 'rejected';
  } else if (isAuthor) {
    state = 'own_idea';
  } else if (isWithinRetractionWindow) {
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

    // 1. If anonymous, open sign-in modal to replay vote [T-3.19, AC-06.2]
    if (isAnonymous) {
      setShowAuthModal(true);
      return;
    }

    // 2. Disabled cases
    if (isAuthor || optimisticState.hasVoted || isQuotaExhausted || isPending) {
      return;
    }

    setInlineError(null);

    // Trigger signature animation sequence [T-3.14]
    if (!reduce) {
      setShowRing(true);
      setTimeout(() => setShowRing(false), 500);
      setIsPopping(true);
      setTimeout(() => setIsPopping(false), 300);
    }

    startTransition(async () => {
      // Apply optimistic update immediately
      setOptimisticState('vote');

      const result = await castVoteAction(ideaId);

      if (!result.success) {
        // Rollback optimistic state with rejection shake and inline error [T-3.13, T-3.15]
        setOptimisticState('rollback');
        setInlineError(result.error.message);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 300);
        return;
      }

      // Reconciled with server response
      const nowIso = new Date().toISOString();
      setHasVoted(true);
      setVoteCreatedAt(nowIso);
      setVoteCount((prev) => prev + 1);

      // Notify QuotaHUD and other components of vote cast
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('ideapulse:vote-update', {
            detail: { action: 'vote', ideaId, votesUsed: result.votesUsed },
          }),
        );
      }
    });
  };

  const handleRetractClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isPending) return;

    setInlineError(null);

    startTransition(async () => {
      setOptimisticState('retract');

      const result = await retractVoteAction(ideaId);

      if (!result.success) {
        setOptimisticState('rollback');
        setInlineError(result.error.message);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 300);
        return;
      }

      setHasVoted(false);
      setVoteCreatedAt(undefined);
      setVoteCount((prev) => Math.max(0, prev - 1));
      setRetractionCountdown(null);

      toast.info('Vote retracted. Note: Quota slot remains consumed per BR-014.', 'Vote Retracted');

      if (onRetract) onRetract();

      // Notify QuotaHUD of vote retraction
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('ideapulse:vote-update', {
            detail: { action: 'retract', ideaId },
          }),
        );
      }
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
        return `Click × to retract (${retractionCountdown} remaining · quota not refunded)`;
      case 'quota_exhausted':
        return `Next vote in ${nextSlotDuration}.`;
      default:
        return 'Cast your vote (1 quota)';
    }
  };

  const isDisabled = isAuthor || isQuotaExhausted || state === 'voted' || isPending;

  return (
    <motion.div
      custom={reduce}
      variants={rejectionShake}
      animate={isShaking ? 'shake' : 'initial'}
      className="relative inline-flex flex-col items-center"
    >
      {/* Expanding Ring Animation per DESIGN.md §6.3 [T-3.14] */}
      <AnimatePresence>
        {showRing && !reduce && (
          <motion.span
            variants={voteRing}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-[var(--violet-bright)]"
          />
        )}
      </AnimatePresence>

      {/* 44px Pill Button Container */}
      <motion.button
        type="button"
        title={getTooltip()}
        disabled={isDisabled}
        onClick={handleVoteClick}
        whileTap={!reduce && !isDisabled ? { scale: 0.96 } : undefined}
        aria-label={`Vote on idea. Current votes: ${optimisticState.voteCount}`}
        className={`group relative flex h-[44px] min-w-[76px] items-center justify-center gap-2 rounded-full px-4 text-[14px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo-bright)] ${
          state === 'voted' || state === 'retractable'
            ? 'cursor-default border border-[rgba(139,92,246,0.45)] bg-[rgba(139,92,246,0.14)] text-[var(--violet-bright)] shadow-[var(--glow-violet-md)]'
            : state === 'own_idea'
              ? 'cursor-not-allowed border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-tertiary)] opacity-35'
              : state === 'quota_exhausted'
                ? 'cursor-not-allowed border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-tertiary)] opacity-45'
                : state === 'pending'
                  ? 'pointer-events-none border border-[var(--border-accent)] bg-[var(--surface-2)] opacity-80'
                  : 'border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] hover:border-[var(--border-accent)] hover:shadow-[var(--glow-indigo-md)]'
        } ${className}`}
        style={{
          boxShadow:
            state === 'voted' || state === 'retractable'
              ? '0 0 16px rgba(139, 92, 246, 0.35), inset 0 1px 0 var(--edge-specular)'
              : 'inset 0 1px 0 var(--edge-specular)',
        }}
      >
        {/* Leading Icon State with Spring Pop [T-3.14] */}
        <motion.span
          custom={reduce}
          variants={iconPop}
          animate={isPopping ? 'pop' : 'initial'}
          className="flex items-center justify-center"
        >
          {state === 'pending' ? (
            <Loader2 className="h-4 w-4 animate-spin text-[var(--indigo-bright)]" />
          ) : state === 'own_idea' ? (
            <Lock className="h-4 w-4 text-[var(--text-tertiary)]" />
          ) : state === 'voted' || state === 'retractable' ? (
            <Zap className="h-4 w-4 fill-current text-[var(--violet-bright)]" />
          ) : (
            <Zap className="h-4 w-4 text-[var(--indigo)] transition-transform group-hover:scale-110" />
          )}
        </motion.span>

        {/* Count Roll Transition in numeric tabular font [T-3.14, DESIGN.md §7.2] */}
        <div className="relative flex h-[20px] min-w-[16px] items-center justify-center overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={optimisticState.voteCount}
              custom={reduce}
              variants={countRoll}
              initial="initial"
              animate="animate"
              exit="exit"
              className="block font-display font-semibold tabular-nums tracking-tight"
            >
              {optimisticState.voteCount}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Retractable close affordance during 10m window [T-3.18] */}
        {state === 'retractable' && (
          <span
            role="button"
            tabIndex={0}
            onClick={handleRetractClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleRetractClick(e as any);
              }
            }}
            className="ml-0.5 inline-flex cursor-pointer rounded-full p-1 opacity-70 transition-opacity hover:bg-[rgba(139,92,246,0.3)] hover:opacity-100 focus:outline-none focus:ring-1 focus:ring-[var(--violet-bright)]"
            title={`Retract vote (${retractionCountdown} remaining)`}
            aria-label="Retract vote"
          >
            <X className="h-3.5 w-3.5 text-[var(--violet-bright)]" />
          </span>
        )}
      </motion.button>

      {/* Rollback inline rejection message per RULES.md §7 and DESIGN.md §6.3 [T-3.13, T-3.15] */}
      {inlineError && (
        <div
          role="alert"
          className="absolute top-[48px] z-20 flex items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-xs)] border border-[rgba(239,68,68,0.3)] bg-[var(--surface-solid)] px-2.5 py-1 text-xs text-[var(--accent-danger)] shadow-lg"
        >
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{inlineError}</span>
        </div>
      )}

      {/* Anonymous Auth Modal for Vote Capture & Replay [T-3.19, AC-06.2] */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          pendingIdeaId={ideaId}
          onVoteReplayed={() => {
            setHasVoted(true);
            setVoteCount((prev) => prev + 1);
          }}
        />
      )}
    </motion.div>
  );
}
