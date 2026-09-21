'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface QualificationBarProps {
  verifiedVotes: number;
  threshold: number;
  className?: string;
}

/**
 * QualificationBar Component per DESIGN.md §7.5 and TASKS.md [T-3.23]
 * Displays verified votes progress toward the cycle threshold with proper ARIA semantics.
 */
export function QualificationBar({
  verifiedVotes,
  threshold,
  className = '',
}: QualificationBarProps) {
  const reduce = useReducedMotion() ?? false;
  const isQualified = verifiedVotes >= threshold;
  const progressPercent = Math.min(100, Math.round((verifiedVotes / Math.max(1, threshold)) * 100));
  const remainingVotes = Math.max(0, threshold - verifiedVotes);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Label and Status */}
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-[var(--text-secondary)]">
          <strong
            className={isQualified ? 'text-[var(--cyan-bright)]' : 'text-[var(--text-primary)]'}
          >
            {verifiedVotes}
          </strong>{' '}
          / {threshold} verified votes to qualify
        </span>

        {isQualified ? (
          <span className="inline-flex items-center gap-1 font-semibold text-[var(--violet-bright)]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Qualified
          </span>
        ) : (
          <span className="text-[var(--text-tertiary)]">{remainingVotes} to go</span>
        )}
      </div>

      {/* Track & Animated Fill */}
      <div
        role="progressbar"
        aria-valuenow={verifiedVotes}
        aria-valuemin={0}
        aria-valuemax={threshold}
        aria-label="Verified votes toward qualification"
        className="relative h-[6px] w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={reduce ? { duration: 0 } : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full rounded-full transition-colors ${
            isQualified
              ? 'bg-gradient-to-r from-[var(--violet)] to-[var(--cyan)] shadow-[0_0_12px_rgba(139,92,246,0.5)]'
              : 'bg-gradient-to-r from-[var(--indigo)] to-[var(--violet)] shadow-[0_0_8px_rgba(99,102,241,0.35)]'
          }`}
        />
      </div>
    </div>
  );
}
