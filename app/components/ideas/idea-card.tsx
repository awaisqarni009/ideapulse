'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { VoteButton } from '@/app/components/votes/vote-button';
import { CATEGORY_LABELS, type Category } from '@/lib/constants';
import { formatDistanceToNowStrict } from 'date-fns';
import { User, CheckCircle2, Zap } from 'lucide-react';

export interface IdeaCardProps {
  idea: {
    id: string;
    title: string;
    slug: string;
    summary: string;
    category: string;
    tags?: string[] | null;
    vote_count: number;
    verified_vote_count: number;
    created_at: string;
    author_id: string;
    profiles?:
      | {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
        }
      | {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
        }[]
      | null;
    cycles?:
      | {
          id: string;
          cycle_number: number;
          vote_threshold: number;
        }
      | {
          id: string;
          cycle_number: number;
          vote_threshold: number;
        }[]
      | null;
  };
  currentUserId?: string | null;
  hasVoted?: boolean;
  voteCreatedAt?: string;
  isAnonymous?: boolean;
  isQuotaExhausted?: boolean;
  nextSlotDuration?: string;
  className?: string;
}

/**
 * IdeaCard Component per DESIGN.md §7.3 and TASKS.md [T-3.21]
 * - L2 glass, radius-lg, padding space-6 (24px)
 * - Hover: translateY(-2px), gradient ring to full opacity, --glow-indigo-sm
 * - Qualified variant: permanent gradient ring at 0.8 opacity, violet "Qualified" badge, --glow-violet-md at rest
 * - Whole card is a link; VoteButton is a nested stop with e.stopPropagation()
 * - Keyboard navigation: card is one tab stop, VoteButton is the next
 */
export function IdeaCard({
  idea,
  currentUserId,
  hasVoted = false,
  voteCreatedAt,
  isAnonymous = false,
  isQuotaExhausted = false,
  nextSlotDuration,
  className = '',
}: IdeaCardProps) {
  const author = Array.isArray(idea.profiles) ? idea.profiles[0] : idea.profiles;
  const cycle = Array.isArray(idea.cycles) ? idea.cycles[0] : idea.cycles;

  const threshold = cycle?.vote_threshold || 50;
  const isQualified = idea.verified_vote_count >= threshold;
  const isAuthor = currentUserId === idea.author_id;
  const categoryLabel = CATEGORY_LABELS[idea.category as Category] || idea.category;
  const remainingVotes = Math.max(0, threshold - idea.verified_vote_count);

  let formattedDate = '';
  try {
    formattedDate = formatDistanceToNowStrict(new Date(idea.created_at), { addSuffix: true });
  } catch {
    formattedDate = 'recently';
  }

  return (
    <article
      aria-labelledby={`idea-title-${idea.id}`}
      className={`glass-panel feed-card-contain group relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] border bg-[var(--surface-2)] p-6 backdrop-blur-[var(--blur-md)] transition-all duration-200 hover:-translate-y-[2px] ${
        isQualified
          ? 'border-[rgba(139,92,246,0.4)] shadow-[var(--glow-violet-md)]'
          : 'border-[var(--border-default)] hover:border-[var(--border-strong)] hover:shadow-[var(--glow-indigo-sm)]'
      } ${className}`}
      style={{
        boxShadow: isQualified
          ? '0 0 20px rgba(139, 92, 246, 0.25), inset 0 1px 0 var(--edge-specular)'
          : 'inset 0 1px 0 var(--edge-specular)',
        contentVisibility: 'auto',
        containIntrinsicSize: '0 320px',
      }}
    >
      {/* Permanent or hover gradient ring per DESIGN.md §7.3 */}
      <div
        className={`pointer-events-none absolute inset-0 rounded-[var(--radius-lg)] transition-opacity duration-200 ${
          isQualified
            ? 'opacity-80 ring-1 ring-[var(--violet-bright)]'
            : 'opacity-0 ring-1 ring-[var(--indigo-bright)] group-hover:opacity-100'
        }`}
      />

      <div>
        {/* Top: Author & Tags Header */}
        <div className="flex items-start justify-between gap-3">
          {/* Author avatar & meta */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border-subtle)] bg-[var(--surface-3)] text-xs font-semibold text-[var(--text-primary)]">
              {author?.avatar_url ? (
                <Image
                  src={author.avatar_url}
                  alt={author.display_name || author.username || 'Avatar'}
                  width={32}
                  height={32}
                  sizes="32px"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <User className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
              )}
            </div>
            <div className="text-xs leading-tight">
              <span className="font-semibold text-[var(--text-primary)]">
                {author?.display_name || author?.username || 'Member'}
              </span>
              <span className="ml-1.5 text-[var(--text-tertiary)]">· {formattedDate}</span>
            </div>
          </div>

          {/* Category Chip per DESIGN.md §5.1 (--radius-xs for chips/tags) */}
          <span className="shrink-0 rounded-[var(--radius-xs)] border border-[var(--border-accent)] bg-[rgba(99,102,241,0.1)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--indigo-bright)]">
            {categoryLabel}
          </span>
        </div>

        {/* Tags row */}
        {idea.tags && idea.tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {idea.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-[var(--radius-xs)] bg-[var(--surface-3)] px-2 py-0.5 text-[10px] text-[var(--text-tertiary)]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Card Title (2-line clamp) & Summary (3-line clamp) */}
        <div className="mt-4">
          <Link
            href={`/idea/${idea.slug}`}
            className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--indigo-bright)]"
          >
            <h3
              id={`idea-title-${idea.id}`}
              className="line-clamp-2 text-base font-bold tracking-tight text-[var(--text-primary)] transition-colors group-hover:text-white sm:text-lg"
            >
              {idea.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[var(--text-secondary)]">
              {idea.summary}
            </p>
          </Link>
        </div>
      </div>

      {/* Bottom Footer Section: Separator, Progress/Qualification & Vote Button */}
      <div className="mt-5 border-t border-[var(--border-subtle)] pt-4">
        <div className="flex items-center justify-between gap-3">
          {/* Qualification status / progress count */}
          <div className="flex items-center gap-2 text-xs">
            {isQualified ? (
              <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-xs)] border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.12)] px-2.5 py-1 font-semibold text-[var(--violet-bright)] shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Qualified
              </span>
            ) : (
              <span className="flex items-center gap-1.5 tabular-nums text-[var(--text-secondary)]">
                <Zap className="h-3.5 w-3.5 text-[var(--cyan-bright)]" />
                <strong className="font-display text-[var(--text-primary)]">
                  {idea.verified_vote_count}
                </strong>
                <span className="text-[var(--text-tertiary)]">· {remainingVotes} to qualify</span>
              </span>
            )}
          </div>

          {/* Nested interactive VoteButton [T-3.21, DESIGN.md §7.3] */}
          <div onClick={(e) => e.stopPropagation()}>
            <VoteButton
              ideaId={idea.id}
              initialVoteCount={idea.vote_count}
              initialHasVoted={hasVoted}
              isAuthor={isAuthor}
              isAnonymous={isAnonymous}
              isQuotaExhausted={isQuotaExhausted}
              nextSlotDuration={nextSlotDuration}
              voteCreatedAt={voteCreatedAt}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
