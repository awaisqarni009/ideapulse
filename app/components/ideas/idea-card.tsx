'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { VoteButton } from '@/app/components/votes/vote-button';
import { CATEGORY_LABELS, type Category } from '@/lib/constants';
import { getEventVisualMetadata } from '@/lib/feed/event-assets';
import { useBookmarks } from '@/lib/feed/use-bookmarks';
import { formatDistanceToNowStrict } from 'date-fns';
import {
  User,
  CheckCircle2,
  Zap,
  Calendar,
  MapPin,
  Bookmark,
  Users,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

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
  viewMode?: 'grid' | 'list';
  className?: string;
}

/**
 * Modern Eventify & IdeaPulse Event Card Component
 * - Premium hero event photography with hover zoom
 * - Visual badges: Category, Access Pass, Qualified, Featured
 * - Contextual Event details: Date, Venue/Location, Format, Attendees
 * - Interactive Bookmark action with localStorage persistence & animated feedback
 * - Supports both Grid and List view layouts
 * - Dark & Bright mode optimized with smooth glassmorphism and specular highlights
 */
export function IdeaCard({
  idea,
  currentUserId,
  hasVoted = false,
  voteCreatedAt,
  isAnonymous = false,
  isQuotaExhausted = false,
  nextSlotDuration,
  viewMode = 'grid',
  className = '',
}: IdeaCardProps) {
  const author = Array.isArray(idea.profiles) ? idea.profiles[0] : idea.profiles;
  const cycle = Array.isArray(idea.cycles) ? idea.cycles[0] : idea.cycles;

  const threshold = cycle?.vote_threshold || 50;
  const isQualified = idea.verified_vote_count >= threshold;
  const isAuthor = currentUserId === idea.author_id;
  const categoryLabel = CATEGORY_LABELS[idea.category as Category] || idea.category;
  const remainingVotes = Math.max(0, threshold - idea.verified_vote_count);
  const progressPercent = Math.min(100, Math.round((idea.verified_vote_count / threshold) * 100));

  const visualMeta = getEventVisualMetadata(idea);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(idea.id);
  const [imgSrc, setImgSrc] = useState(visualMeta.imageUrl);

  let formattedDate = '';
  try {
    formattedDate = formatDistanceToNowStrict(new Date(idea.created_at), { addSuffix: true });
  } catch {
    formattedDate = 'recently';
  }

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(idea.id, idea.title);
  };

  /* ================= LIST VIEW LAYOUT ================= */
  if (viewMode === 'list') {
    return (
      <article
        aria-labelledby={`idea-title-${idea.id}`}
        className={`glass-panel group relative flex flex-col overflow-hidden rounded-2xl border bg-[var(--surface-2)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.4),0_0_20px_rgba(99,102,241,0.2)] md:flex-row ${
          isQualified
            ? 'border-[rgba(139,92,246,0.4)] shadow-[var(--glow-violet-md)]'
            : 'border-[var(--border-default)] hover:border-[var(--border-accent)]'
        } ${className}`}
        style={{
          boxShadow: isQualified
            ? '0 0 20px rgba(139, 92, 246, 0.2), inset 0 1px 0 var(--edge-specular)'
            : 'inset 0 1px 0 var(--edge-specular)',
        }}
      >
        {/* Thumbnail on left */}
        <div className="relative aspect-[16/9] shrink-0 overflow-hidden bg-[var(--surface-3)] md:aspect-auto md:w-72">
          <Image
            src={imgSrc}
            alt={idea.title}
            fill
            sizes="(max-width: 768px) 100vw, 288px"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            onError={() =>
              setImgSrc(
                'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
              )
            }
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Floating Category Badge */}
          <div className="absolute left-3 top-3">
            <span className="rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
              {categoryLabel}
            </span>
          </div>

          {/* Floating Bookmark */}
          <button
            type="button"
            onClick={handleBookmarkClick}
            aria-label={bookmarked ? 'Remove from saved' : 'Save event'}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white/90 backdrop-blur-md transition-transform hover:scale-110 active:scale-95"
          >
            <Bookmark
              className={`h-4 w-4 transition-colors ${
                bookmarked ? 'fill-amber-400 text-amber-400' : 'text-white'
              }`}
            />
          </button>

          {/* Bottom overlay badge */}
          <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-[11px] font-medium text-white/90">
            <span className="rounded-md bg-white/20 px-2 py-0.5 backdrop-blur-sm">
              {visualMeta.accessBadge}
            </span>
            <span className="rounded-md border border-emerald-500/40 bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-300 shadow-sm backdrop-blur-sm">
              $50k Pool
            </span>
          </div>
        </div>

        {/* Content Details */}
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            {/* Date & Location Line */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-tertiary)]">
              <span className="flex items-center gap-1 font-medium text-[var(--indigo-bright)]">
                <Calendar className="h-3.5 w-3.5" />
                {visualMeta.dateStr}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {visualMeta.location}
              </span>
            </div>

            {/* Title & Summary */}
            <div className="mt-2">
              <Link href={`/idea/${idea.slug}`} className="focus:outline-none">
                <h3
                  id={`idea-title-${idea.id}`}
                  className="text-lg font-bold tracking-tight text-[var(--text-primary)] transition-colors group-hover:text-[var(--indigo-bright)]"
                >
                  {idea.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {idea.summary}
                </p>
              </Link>
            </div>

            {/* Tags row */}
            {idea.tags && idea.tags.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {idea.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--surface-3)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--text-tertiary)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bottom stats & vote */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-subtle)] pt-3">
            <div className="flex items-center gap-3 text-xs">
              <div className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border-subtle)] bg-[var(--surface-3)] text-xs font-semibold">
                {author?.avatar_url ? (
                  <Image
                    src={author.avatar_url}
                    alt={author.display_name || author.username || 'Avatar'}
                    width={28}
                    height={28}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                )}
              </div>
              <span className="font-medium text-[var(--text-secondary)]">
                {author?.display_name || author?.username || 'Member'}
              </span>
              <span className="text-[var(--text-tertiary)]">·</span>
              <span className="flex items-center gap-1 text-[var(--text-tertiary)]">
                <Users className="h-3 w-3" />
                {visualMeta.attendeeCount} attending
              </span>
            </div>

            <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
              <Link
                href={`/idea/${idea.slug}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                <span>View Details</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
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

  /* ================= DEFAULT GRID VIEW LAYOUT ================= */
  return (
    <article
      aria-labelledby={`idea-title-${idea.id}`}
      className={`glass-panel group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-[var(--surface-2)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.45),0_0_24px_rgba(99,102,241,0.22)] ${
        isQualified
          ? 'border-[rgba(139,92,246,0.4)] shadow-[var(--glow-violet-md)]'
          : 'border-[var(--border-default)] hover:border-[var(--border-accent)]'
      } ${className}`}
      style={{
        boxShadow: isQualified
          ? '0 0 24px rgba(139, 92, 246, 0.22), inset 0 1px 0 var(--edge-specular)'
          : 'inset 0 1px 0 var(--edge-specular)',
      }}
    >
      {/* Permanent or hover gradient ring */}
      <div
        className={`pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 ${
          isQualified
            ? 'opacity-80 ring-1 ring-[var(--violet-bright)]'
            : 'opacity-0 ring-1 ring-[var(--indigo-bright)] group-hover:opacity-100'
        }`}
      />

      <div>
        {/* ================= HERO EVENT IMAGE CONTAINER ================= */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--surface-3)]">
          <Image
            src={imgSrc}
            alt={idea.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            onError={() =>
              setImgSrc(
                'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
              )
            }
          />

          {/* Smooth Dark Vignette / Scrim for high contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20" />

          {/* Top floating bar: Category + Bookmark Button */}
          <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[11px] font-semibold tracking-wide text-white shadow-sm backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan-bright)]" />
              {categoryLabel}
            </span>

            <div className="flex items-center gap-1.5">
              {visualMeta.isFeatured && (
                <span className="hidden items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-200 backdrop-blur-md sm:inline-flex">
                  <Sparkles className="h-2.5 w-2.5" />
                  Featured
                </span>
              )}

              <button
                type="button"
                onClick={handleBookmarkClick}
                aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark event'}
                title={bookmarked ? 'Saved to bookmarks' : 'Save to bookmarks'}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white/90 shadow-md backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-black/70 hover:text-white active:scale-90"
              >
                <Bookmark
                  className={`h-4 w-4 transition-colors ${
                    bookmarked ? 'fill-amber-400 text-amber-400' : 'text-white'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Bottom overlay: Location, Format & Access Badge */}
          <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 text-white">
            <div className="flex flex-col gap-0.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white/90">
                <MapPin className="h-3 w-3 shrink-0 text-[var(--cyan-bright)]" />
                <span className="line-clamp-1">{visualMeta.location}</span>
              </span>
              <span className="font-mono text-[10px] text-white/70">{visualMeta.format}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="shrink-0 rounded-md border border-white/20 bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                {visualMeta.accessBadge}
              </span>
              <span className="shrink-0 rounded-md border border-emerald-500/40 bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-300 shadow-sm backdrop-blur-sm">
                $50k Pool
              </span>
            </div>
          </div>
        </div>

        {/* ================= CARD BODY CONTENT ================= */}
        <div className="p-5">
          {/* Date & Author Header */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border-subtle)] bg-[var(--surface-3)] text-xs font-semibold text-[var(--text-primary)]">
                {author?.avatar_url ? (
                  <Image
                    src={author.avatar_url}
                    alt={author.display_name || author.username || 'Avatar'}
                    width={24}
                    height={24}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-3 w-3 text-[var(--text-tertiary)]" />
                )}
              </div>
              <span className="font-medium text-[var(--text-secondary)]">
                {author?.display_name || author?.username || 'Member'}
              </span>
            </div>

            <div className="flex items-center gap-1 font-medium text-[var(--indigo-bright)]">
              <Calendar className="h-3 w-3" />
              <span>{visualMeta.dateStr}</span>
            </div>
          </div>

          {/* Title and Summary */}
          <div className="mt-3.5">
            <Link
              href={`/idea/${idea.slug}`}
              className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo-bright)]"
            >
              <h3
                id={`idea-title-${idea.id}`}
                className="line-clamp-2 text-base font-bold tracking-tight text-[var(--text-primary)] transition-colors group-hover:text-[var(--indigo-bright)] sm:text-lg"
              >
                {idea.title}
              </h3>
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                {idea.summary}
              </p>
            </Link>
          </div>

          {/* Tags row */}
          {idea.tags && idea.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {idea.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[var(--surface-3)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-secondary)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Qualification progress bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3 text-[var(--cyan-bright)]" />
                <span>{visualMeta.attendeeCount} supporters</span>
              </span>
              <span className="font-mono tabular-nums">
                {idea.verified_vote_count}/{threshold} votes
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isQualified
                    ? 'bg-gradient-to-r from-[var(--violet-bright)] to-[var(--indigo-bright)]'
                    : 'bg-gradient-to-r from-[var(--cyan-bright)] to-[var(--indigo-bright)]'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= CARD FOOTER & ACTIONS ================= */}
      <div className="bg-[var(--surface-1)]/50 border-t border-[var(--border-subtle)] p-4">
        <div className="flex items-center justify-between gap-3">
          {/* Qualification Badge or Status */}
          <div className="flex items-center gap-2 text-xs">
            {isQualified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.12)] px-2.5 py-1 font-semibold text-[var(--violet-bright)] shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Qualified
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs tabular-nums text-[var(--text-secondary)]">
                <Zap className="h-3.5 w-3.5 text-[var(--cyan-bright)]" />
                <strong className="font-display font-semibold text-[var(--text-primary)]">
                  {idea.verified_vote_count}
                </strong>
                <span className="text-[var(--text-tertiary)]">· {remainingVotes} needed</span>
              </span>
            )}
          </div>

          {/* Vote Button stop & View details */}
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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
