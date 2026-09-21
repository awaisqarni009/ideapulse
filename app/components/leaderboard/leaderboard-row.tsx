'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import type { LeaderboardItem } from '@/lib/leaderboard';
import { formatRank } from '@/lib/leaderboard';
import { spring } from '@/lib/motion';
import { Zap, CheckCircle2 } from 'lucide-react';

interface LeaderboardRowProps {
  item: LeaderboardItem;
  isFlashing?: boolean;
  className?: string;
}

/**
 * LeaderboardRow Component per DESIGN.md §7.6 and TASKS.md [T-4.10, T-4.12]
 * - L1 glass container, radius-md, h 72px
 * - Semantic <motion.li> inside an <ol>
 * - Framer layout rank reorder with spring.rank
 * - Rank 1 gets gradient ring and --glow-violet-md
 * - Cyan border flash for rows that moved up in realtime
 * - Ranks 1–3 numeral in --violet-bright; ranks 4+ in --text-tertiary. No emojis!
 * - Whole row is a link to /idea/[slug]
 */
export function LeaderboardRow({ item, isFlashing = false, className = '' }: LeaderboardRowProps) {
  const reduce = useReducedMotion();
  const isRank1 = item.cycle_rank === 1;
  const isTop3 = item.cycle_rank <= 3;
  const formattedRank = formatRank(item.cycle_rank);

  return (
    <motion.li
      layout={!reduce}
      transition={spring.rank}
      className={`w-full list-none ${className}`}
    >
      <Link
        href={`/idea/${item.slug}`}
        className={`group relative flex min-h-[72px] items-center justify-between gap-4 rounded-[var(--radius-md)] border px-5 py-3.5 backdrop-blur-[var(--blur-sm)] transition-all duration-300 hover:-translate-y-[1px] ${
          isFlashing
            ? 'border-l-4 border-l-[var(--cyan-bright)] bg-[rgba(34,211,238,0.08)] shadow-[0_0_16px_rgba(34,211,238,0.35)]'
            : isRank1
              ? 'border-[rgba(139,92,246,0.45)] bg-[rgba(139,92,246,0.06)] shadow-[var(--glow-violet-md)] ring-1 ring-[var(--violet-bright)]'
              : 'border-[var(--border-default)] bg-[var(--surface-1)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] hover:shadow-[var(--glow-indigo-sm)]'
        }`}
        style={{
          boxShadow: isRank1
            ? '0 0 20px rgba(139, 92, 246, 0.22), inset 0 1px 0 var(--edge-specular)'
            : 'inset 0 1px 0 var(--edge-specular)',
        }}
      >
        {/* Left Side: Rank Numeral + Title + Author */}
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          {/* Rank Numeral: Ranks 1-3 violet-bright, rest text-tertiary */}
          <span
            className={`font-mono text-xl font-black tabular-nums tracking-tight transition-colors sm:text-2xl ${
              isTop3
                ? 'text-[var(--violet-bright)] drop-shadow-[0_0_8px_rgba(167,139,250,0.4)]'
                : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]'
            }`}
          >
            {formattedRank}
          </span>

          {/* Title & Author */}
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-sm font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--indigo-bright)] sm:text-base">
              {item.title}
            </h3>
            <p className="mt-0.5 truncate text-xs text-[var(--text-tertiary)]">
              by <span className="text-[var(--text-secondary)]">{item.author_display_name}</span>{' '}
              <span className="font-mono">@{item.author_username}</span>
            </p>
          </div>
        </div>

        {/* Right Side: Qualification Status + Verified Vote Count Pill */}
        <div className="flex flex-shrink-0 items-center gap-3 sm:gap-6">
          {/* Qualification status badge or remaining votes */}
          {item.is_qualified ? (
            <span className="hidden items-center gap-1 rounded-[var(--radius-xs)] border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.12)] px-2.5 py-1 text-xs font-semibold text-[var(--violet-bright)] sm:inline-flex">
              <CheckCircle2 className="h-3 w-3" />
              <span>Qualified</span>
            </span>
          ) : (
            <span className="hidden text-xs tabular-nums text-[var(--text-tertiary)] sm:inline">
              {item.votes_to_qualify} to qualify
            </span>
          )}

          {/* Verified Vote Count Pill with Electric Pulse (Accent grammar: cyan = live number) */}
          <div
            className="flex items-center gap-1.5 rounded-full border border-[rgba(34,211,238,0.3)] bg-[rgba(34,211,238,0.1)] px-3.5 py-1.5 font-mono text-xs font-bold text-[var(--cyan-bright)] shadow-[0_0_12px_rgba(34,211,238,0.2)]"
            title={`${item.verified_vote_count} verified community votes`}
          >
            <Zap className="h-3.5 w-3.5 fill-[var(--cyan)] text-[var(--cyan)]" />
            <span className="text-sm tabular-nums">{item.verified_vote_count}</span>
          </div>
        </div>
      </Link>
    </motion.li>
  );
}
