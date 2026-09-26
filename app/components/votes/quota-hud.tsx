'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getVoteQuotaAction, type VoteQuotaResult } from '@/app/actions/votes';
import { useUser } from '@/lib/auth/use-user';

interface QuotaHUDProps {
  initialQuota?: VoteQuotaResult | null;
  className?: string;
}

export function QuotaHUD({ initialQuota, className = '' }: QuotaHUDProps) {
  const { user } = useUser();
  const [quota, setQuota] = useState<VoteQuotaResult | null>(initialQuota || null);
  const [countdown, setCountdown] = useState<string>('');

  const refreshQuota = useCallback(async () => {
    if (!user) return;
    try {
      const latest = await getVoteQuotaAction();
      if (latest) {
        setQuota(latest);
      }
    } catch {
      // Graceful background fallback
    }
  }, [user]);

  // Derive countdown string from nextSlotAt (DESIGN.md §7.4, TASKS.md T-3.17)
  const updateCountdown = useCallback(() => {
    if (!quota?.nextSlotAt) {
      setCountdown('');
      return;
    }

    const diffMs = new Date(quota.nextSlotAt).getTime() - Date.now();
    if (diffMs <= 0) {
      setCountdown('shortly');
      return;
    }

    const hours = Math.floor(diffMs / (3600 * 1000));
    const mins = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));

    if (hours > 0) {
      setCountdown(`${hours}h ${mins}m`);
    } else {
      setCountdown(`${mins}m`);
    }
  }, [quota?.nextSlotAt]);

  // Initial load if not provided
  useEffect(() => {
    if (!quota && user) {
      refreshQuota();
    }
  }, [quota, user, refreshQuota]);

  // Re-derive countdown every 30 seconds without accumulating client clock drift [T-3.17]
  useEffect(() => {
    updateCountdown();
    const timer = setInterval(() => {
      updateCountdown();
    }, 30000);

    return () => clearInterval(timer);
  }, [updateCountdown]);

  // Synchronize immediately upon vote cast or retraction events
  useEffect(() => {
    const handleVoteUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ action: 'vote' | 'retract' }>;
      if (customEvent.detail?.action === 'vote') {
        // Immediate optimistic pip extinguish [T-3.14, DESIGN.md §6.3]
        setQuota((prev) => {
          if (!prev) return prev;
          const newRemaining = Math.max(0, prev.remaining - 1);
          return {
            ...prev,
            usedCount: prev.usedCount + 1,
            remaining: newRemaining,
          };
        });
      }
      // Reconcile against server truth
      refreshQuota();
    };

    window.addEventListener('ideapulse:vote-update', handleVoteUpdate);
    return () => window.removeEventListener('ideapulse:vote-update', handleVoteUpdate);
  }, [refreshQuota]);

  if (!user || !quota) return null;

  const totalLimit = quota.totalLimit || 5;
  const remaining = quota.remaining;
  const isZero = remaining === 0;
  const isOneLeft = remaining === 1;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Vote quota: ${remaining} of ${totalLimit} remaining`}
      className={`glass-panel flex h-[34px] shrink-0 items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-3)] px-3 shadow-sm transition-colors sm:gap-2.5 sm:px-3.5 ${className}`}
      style={{
        boxShadow: 'inset 0 1px 0 var(--edge-specular)',
      }}
    >
      {/* 5 Pips container */}
      <div
        className={`flex items-center gap-1 transition-opacity duration-300 sm:gap-1.5 ${
          isZero ? 'opacity-25' : 'opacity-100'
        }`}
      >
        {Array.from({ length: totalLimit }).map((_, index) => {
          const isFilled = index < remaining;

          return (
            <motion.span
              key={index}
              animate={{
                scale: isFilled ? 1 : 0.85,
                opacity: isFilled ? 1 : 0.25,
              }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={`block h-1.5 w-1.5 rounded-full transition-colors duration-200 sm:h-2 sm:w-2 ${
                isFilled
                  ? 'bg-[var(--cyan)] shadow-[0_0_8px_rgba(6,182,212,0.45)]'
                  : 'bg-[rgba(255,255,255,0.18)]'
              }`}
            />
          );
        })}
      </div>

      {/* Mobile condensed label: count only per TASKS.md [T-7.30] */}
      <span
        className={`font-mono text-xs font-semibold tabular-nums tracking-tight sm:hidden ${
          isZero
            ? 'text-[var(--text-tertiary)]'
            : isOneLeft
              ? 'text-[var(--accent-warning)]'
              : 'text-[var(--text-primary)]'
        }`}
      >
        {remaining}
      </span>

      {/* Desktop full label with countdown per DESIGN.md §7.4 */}
      <span
        className={`hidden font-mono text-xs tabular-nums tracking-tight sm:inline ${
          isZero
            ? 'text-[var(--text-tertiary)]'
            : isOneLeft
              ? 'font-medium text-[var(--accent-warning)]'
              : 'text-[var(--text-secondary)]'
        }`}
      >
        {isZero ? (
          <>No votes left{countdown ? ` · back in ${countdown}` : ''}</>
        ) : (
          <>
            {remaining} left{countdown ? ` · resets ${countdown}` : ''}
          </>
        )}
      </span>
    </div>
  );
}
