import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/user';
import { renderRestrictedMarkdown } from '@/lib/markdown';
import { CATEGORY_LABELS, type Category } from '@/lib/constants';
import { IdeaActions } from './idea-actions';
import { VoteButton } from '@/app/components/votes/vote-button';
import { ArrowLeft, CheckCircle2, ShieldAlert, Sparkles, User } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

interface IdeaPageProps {
  params: { slug: string };
  searchParams: { created?: string };
}

export async function generateMetadata({ params }: IdeaPageProps): Promise<Metadata> {
  const supabase = await createClient();
  const { data: idea } = await supabase
    .from('ideas')
    .select('title, summary')
    .eq('slug', params.slug)
    .maybeSingle();

  if (!idea) {
    return { title: 'Idea Not Found — IdeaPulse' };
  }

  return {
    title: `${idea.title} — IdeaPulse`,
    description: idea.summary,
  };
}

export default async function IdeaDetailPage({ params, searchParams }: IdeaPageProps) {
  const supabase = await createClient();
  const { user } = await getCurrentUser();

  const { data: idea, error } = await supabase
    .from('ideas')
    .select(
      `
      id,
      title,
      slug,
      summary,
      body,
      category,
      tags,
      status,
      vote_count,
      verified_vote_count,
      created_at,
      locked_at,
      withdrawn_at,
      author_id,
      cycle_id,
      profiles:author_id (
        id,
        username,
        display_name,
        avatar_url
      ),
      cycles:cycle_id (
        id,
        cycle_number,
        status,
        vote_threshold
      )
    `,
    )
    .eq('slug', params.slug)
    .maybeSingle();

  if (error || !idea) {
    notFound();
  }

  const author = Array.isArray(idea.profiles) ? idea.profiles[0] : idea.profiles;
  const cycle = Array.isArray(idea.cycles) ? idea.cycles[0] : idea.cycles;

  const isAuthor = user?.id === idea.author_id;
  const canWithdraw = isAuthor && idea.status === 'published';
  const justCreated = searchParams.created === '1';

  let hasVoted = false;
  let userVote: { id: string; created_at: string } | null = null;

  if (user) {
    const { data: vote } = await supabase
      .from('votes')
      .select('id, created_at, status')
      .eq('idea_id', idea.id)
      .eq('voter_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (vote) {
      hasVoted = true;
      userVote = vote;
    }
  }

  const categoryLabel = CATEGORY_LABELS[idea.category as Category] || idea.category;
  const voteThreshold = cycle?.vote_threshold || 50;
  const progressPercent = Math.min(
    100,
    Math.round((idea.verified_vote_count / voteThreshold) * 100),
  );

  return (
    <main className="min-h-[calc(100vh-80px)] py-12">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to feed
          </Link>
        </div>

        {/* Hero Glass Card */}
        <article className="glass-panel relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-1)] p-6 shadow-xl sm:p-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-[var(--edge-specular)]" />

          {/* Top Badges & Meta Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[var(--border-accent)] bg-[rgba(99,102,241,0.12)] px-3 py-1 text-xs font-semibold text-[var(--indigo-bright)]">
                {categoryLabel}
              </span>

              {/* Status Badges per DESIGN.md §7.8 */}
              {idea.status === 'published' && (
                <span className="rounded-[var(--radius-xs)] border border-[rgba(6,182,212,0.28)] bg-[var(--tint-cyan)] px-2.5 py-0.5 text-xs font-medium text-[var(--cyan-bright)]">
                  Published · Cycle {cycle?.cycle_number}
                </span>
              )}
              {idea.status === 'withdrawn' && (
                <span className="rounded-[var(--radius-xs)] border border-[var(--border-subtle)] bg-[var(--surface-2)] px-2.5 py-0.5 text-xs font-medium text-[var(--text-tertiary)]">
                  Withdrawn
                </span>
              )}
              {idea.status === 'under_review' && (
                <span className="rounded-[var(--radius-xs)] border border-[rgba(234,179,8,0.28)] bg-[var(--tint-warning)] px-2.5 py-0.5 text-xs font-medium text-[var(--accent-warning)]">
                  Under Review
                </span>
              )}
            </div>

            {/* Voting & Author Actions */}
            <div className="flex items-center gap-4">
              <VoteButton
                ideaId={idea.id}
                initialVoteCount={idea.vote_count}
                initialHasVoted={hasVoted}
                isAuthor={isAuthor}
                isAnonymous={!user}
                voteCreatedAt={userVote?.created_at}
              />
              <IdeaActions
                ideaId={idea.id}
                voteCount={idea.vote_count}
                isAuthor={isAuthor}
                canWithdraw={canWithdraw}
                justCreated={justCreated}
                cycleNumber={cycle?.cycle_number || 1}
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl lg:text-4xl">
            {idea.title}
          </h1>

          {/* Author info & Post date */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--text-primary)]">
              {author?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={author.avatar_url}
                  alt={author.display_name || author.username}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-[var(--text-tertiary)]" />
              )}
            </div>
            <div className="text-xs">
              <span className="font-semibold text-[var(--text-primary)]">
                {author?.display_name || author?.username || 'Community Member'}
              </span>
              <span className="ml-1 text-[var(--text-tertiary)]">
                @{author?.username || 'member'}
              </span>
              <span className="ml-2 text-[var(--text-tertiary)]">
                ·{' '}
                {new Date(idea.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Summary Box */}
          <div className="my-8 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-5 text-[15px] italic leading-relaxed text-[var(--text-primary)] shadow-sm">
            &ldquo;{idea.summary}&rdquo;
          </div>

          {/* Qualification Progress Card per DESIGN.md §7.5 */}
          <div className="my-8 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-5">
            <div className="mb-2 flex items-center justify-between text-xs font-medium">
              <span className="text-[var(--text-secondary)]">
                <strong className="text-[var(--cyan-bright)]">{idea.verified_vote_count}</strong> /{' '}
                {voteThreshold} verified votes to qualify
              </span>
              <span className="text-[var(--text-tertiary)]">
                {idea.verified_vote_count >= voteThreshold
                  ? 'Threshold Met'
                  : `${voteThreshold - idea.verified_vote_count} votes to go`}
              </span>
            </div>
            {/* Progress track */}
            <div
              role="progressbar"
              aria-valuenow={idea.verified_vote_count}
              aria-valuemin={0}
              aria-valuemax={voteThreshold}
              aria-label="Verified votes toward qualification"
              className="h-2 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]"
            >
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full rounded-full bg-gradient-to-r from-[var(--indigo)] to-[var(--violet)] transition-all duration-500"
              />
            </div>
          </div>

          {/* Body Section */}
          <div className="border-t border-[var(--border-subtle)] pt-8">
            <h2 className="mb-4 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              Proposal Details
            </h2>
            <div className="prose-pulse leading-relaxed">{renderRestrictedMarkdown(idea.body)}</div>
          </div>

          {/* Tags */}
          {idea.tags && idea.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2 border-t border-[var(--border-subtle)] pt-6">
              {idea.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-1 text-xs text-[var(--text-secondary)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Status notices */}
          {idea.status === 'withdrawn' && (
            <div className="mt-8 flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-4 text-xs text-[var(--text-tertiary)]">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-tertiary)]" />
              <div>
                <p className="font-semibold text-[var(--text-secondary)]">Idea Withdrawn</p>
                <p className="mt-0.5">
                  The author chose to withdraw this idea from the active cycle. Recorded votes
                  remain on ledger for transparency but this proposal is not eligible for cycle
                  rewards.
                </p>
              </div>
            </div>
          )}

          {idea.locked_at && idea.status === 'published' && (
            <div className="mt-8 flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
              <CheckCircle2 className="h-4 w-4 text-[var(--indigo-bright)]" />
              <span>Permanently locked for community vote integrity (BR-022).</span>
            </div>
          )}
        </article>
      </div>
    </main>
  );
}
