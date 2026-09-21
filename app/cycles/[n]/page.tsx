import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CycleSweep } from '@/app/components/cycles/cycle-sweep';
import { format } from 'date-fns';
import {
  Trophy,
  Award,
  Calendar,
  Lightbulb,
  ThumbsUp,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface CycleArchivePageProps {
  params: Promise<{ n: string }> | { n: string };
}

export async function generateMetadata({ params }: CycleArchivePageProps): Promise<Metadata> {
  const { n } = await Promise.resolve(params);
  return {
    title: `Cycle #${n} Archive — IdeaPulse`,
    description: `Final standings and reward recipients for IdeaPulse Cycle #${n}.`,
  };
}

/**
 * /cycles/[n] Archive Page per ARCHITECTURE.md §5.1 and TASKS.md [T-5.8]
 * - Displays final standings, reward recipients, and cycle statistics.
 * - Handles zero-qualifier cycles cleanly with the public note (RULES.md BR-048).
 * - Fires the one-time celebration sweep on qualified rows (DESIGN.md §6.4).
 */
export default async function CycleArchivePage({ params }: CycleArchivePageProps) {
  const { n } = await Promise.resolve(params);
  const cycleNumber = parseInt(n, 10);

  if (isNaN(cycleNumber)) {
    notFound();
  }

  const supabase = await createClient();

  // 1. Fetch cycle
  const { data: cycle } = await supabase
    .from('cycles')
    .select('*')
    .eq('cycle_number', cycleNumber)
    .maybeSingle();

  if (!cycle) {
    notFound();
  }

  // 2. Fetch rewards
  const { data: rawRewards } = await supabase
    .from('rewards')
    .select(
      `
      id,
      rank,
      verified_votes,
      qualified_at,
      title,
      status,
      idea_id,
      recipient_id,
      ideas (
        title,
        slug,
        category
      ),
      profiles (
        username,
        display_name,
        avatar_url
      )
    `,
    )
    .eq('cycle_id', cycle.id)
    .order('rank', { ascending: true });

  const rewards = rawRewards || [];

  // 3. Fetch proposals competing in this cycle
  const { data: rawIdeas } = await supabase
    .from('ideas')
    .select(
      `
      id,
      title,
      slug,
      summary,
      category,
      status,
      vote_count,
      verified_vote_count,
      qualified_at,
      created_at,
      author_id,
      profiles (
        username,
        display_name
      )
    `,
    )
    .eq('cycle_id', cycle.id)
    .eq('status', 'published')
    .order('verified_vote_count', { ascending: false })
    .order('created_at', { ascending: true });

  const ideas = rawIdeas || [];

  const startDate = format(new Date(cycle.starts_at), 'MMM d, yyyy');
  const endDate = format(new Date(cycle.ends_at), 'MMM d, yyyy');
  const isFinalized = cycle.status === 'finalized';

  return (
    <main className="min-h-[calc(100vh-64px)] py-10 sm:py-14">
      {/* One-time celebration sweep animation per T-5.10 */}
      <CycleSweep cycleId={cycle.id} isFinalized={isFinalized} hasQualifiers={rewards.length > 0} />

      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        {/* Navigation back */}
        <div className="mb-6">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-tertiary)] transition-colors hover:text-[var(--indigo-bright)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Leaderboard</span>
          </Link>
        </div>

        {/* Recount Required Banner (BR-047, T-6.9) */}
        {cycle.status === 'recount_required' && (
          <div
            role="alert"
            className="rounded-2xl border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.08)] p-4 text-xs text-[var(--text-secondary)] shadow-lg backdrop-blur-md sm:p-5"
            style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
          >
            <div className="flex items-center gap-2.5 text-sm font-semibold text-[var(--accent-warning)]">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>Recount Required — Cycle Results Under Review</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
              One or more votes in this finalized cycle were voided during post-finalization
              moderation. The standings below reflect the original final results while an
              administrative review is conducted (RULES.md BR-047).
            </p>
          </div>
        )}

        {/* Cycle Header Panel */}
        <div
          className="glass-panel relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)] sm:p-8"
          style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
        >
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-display text-2xl font-extrabold text-[var(--text-primary)] sm:text-3xl">
                  Cycle #{cycle.cycle_number}
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 font-mono text-xs font-semibold uppercase ${
                    cycle.status === 'recount_required'
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                      : isFinalized
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : 'border-[var(--border-accent)] bg-[rgba(99,102,241,0.12)] text-[var(--indigo-bright)]'
                  }`}
                >
                  {cycle.status === 'recount_required' ? 'Recount Required' : cycle.status}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-xs text-[var(--text-secondary)] sm:text-sm">
                <Calendar className="h-4 w-4 text-[var(--text-tertiary)]" />
                <span>
                  {startDate} — {endDate}
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 border-t border-[var(--border-subtle)] pt-4 md:border-l md:border-t-0 md:pl-8 md:pt-0">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center gap-1 text-xs text-[var(--text-tertiary)] md:justify-start">
                  <Lightbulb className="h-3.5 w-3.5" />
                  <span>Proposals</span>
                </div>
                <div className="mt-1 font-mono text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
                  {cycle.total_ideas ?? ideas.length}
                </div>
              </div>

              <div className="text-center md:text-left">
                <div className="flex items-center justify-center gap-1 text-xs text-[var(--text-tertiary)] md:justify-start">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>Total Votes</span>
                </div>
                <div className="mt-1 font-mono text-xl font-bold text-[var(--cyan-bright)] sm:text-2xl">
                  {cycle.total_votes ?? 0}
                </div>
              </div>

              <div className="text-center md:text-left">
                <div className="flex items-center justify-center gap-1 text-xs text-[var(--text-tertiary)] md:justify-start">
                  <Trophy className="h-3.5 w-3.5" />
                  <span>Qualifiers</span>
                </div>
                <div className="mt-1 font-mono text-xl font-bold text-[var(--violet-bright)] sm:text-2xl">
                  {rewards.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Zero Qualifiers Public Note per RULES.md BR-048 */}
        {isFinalized && rewards.length === 0 && (
          <div
            role="status"
            className="glass-panel mt-8 flex items-center gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-2)] p-6 text-sm text-[var(--text-secondary)] backdrop-blur-[var(--blur-md)]"
            style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
          >
            <AlertCircle className="h-6 w-6 shrink-0 text-[var(--text-tertiary)]" />
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Cycle Concluded</h3>
              <p className="mt-0.5">
                {cycle.finalization_note ||
                  `No idea reached the ${cycle.vote_threshold}-vote threshold this cycle.`}
              </p>
            </div>
          </div>
        )}

        {/* Winners Podium Section */}
        {rewards.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 flex items-center gap-2 font-display text-xl font-bold text-[var(--text-primary)]">
              <Trophy className="h-5 w-5 text-[var(--violet-bright)]" />
              <span>Reward Recipients</span>
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {rewards.map((reward) => {
                const idea = Array.isArray(reward.ideas) ? reward.ideas[0] : reward.ideas;
                const profile = Array.isArray(reward.profiles)
                  ? reward.profiles[0]
                  : reward.profiles;
                const isFirst = reward.rank === 1;

                return (
                  <div
                    key={reward.id}
                    className={`glass-panel relative flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-[var(--blur-md)] ${
                      isFirst
                        ? 'border-[var(--border-qualified)] bg-[var(--surface-2)] shadow-[var(--glow-violet-md)]'
                        : 'border-[var(--border-default)] bg-[var(--surface-1)]'
                    }`}
                    style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
                  >
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-mono text-xs font-bold ${
                            isFirst
                              ? 'border border-[var(--border-qualified)] bg-[rgba(139,92,246,0.25)] text-[var(--violet-bright)]'
                              : 'border border-[var(--border-subtle)] bg-[var(--surface-3)] text-[var(--text-secondary)]'
                          }`}
                        >
                          Rank #{String(reward.rank).padStart(2, '0')}
                        </span>

                        <span className="rounded-full border border-[rgba(6,182,212,0.2)] bg-[rgba(6,182,212,0.12)] px-2.5 py-0.5 font-mono text-xs font-bold text-[var(--cyan-bright)]">
                          {reward.verified_votes} verified votes
                        </span>
                      </div>

                      <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
                        {idea?.slug ? (
                          <Link
                            href={`/ideas/${idea.slug}`}
                            className="transition-colors hover:text-[var(--indigo-bright)]"
                          >
                            {idea.title}
                          </Link>
                        ) : (
                          reward.title
                        )}
                      </h3>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4 text-xs text-[var(--text-tertiary)]">
                      <span>
                        Author:{' '}
                        {profile?.username ? (
                          <Link
                            href={`/u/${profile.username}`}
                            className="font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--indigo-bright)]"
                          >
                            @{profile.username}
                          </Link>
                        ) : (
                          'Anonymous'
                        )}
                      </span>
                      <span className="font-semibold text-[var(--violet-bright)]">Awarded</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Full Final Standings List */}
        <section className="mt-14">
          <div className="mb-6 border-b border-[var(--border-subtle)] pb-4">
            <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
              Final Standings
            </h2>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)] sm:text-sm">
              Complete ranked standing of all proposals submitted in Cycle #{cycle.cycle_number}.
            </p>
          </div>

          {ideas.length === 0 ? (
            <div className="glass-panel rounded-2xl border border-[var(--border-default)] p-8 text-center text-sm text-[var(--text-secondary)]">
              No ideas were published in this cycle.
            </div>
          ) : (
            <div
              className="glass-panel overflow-x-auto rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] backdrop-blur-[var(--blur-md)]"
              style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
            >
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-2)] font-mono text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
                  <tr>
                    <th className="px-5 py-3.5">Rank</th>
                    <th className="px-5 py-3.5">Proposal</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Author</th>
                    <th className="px-5 py-3.5 text-right">Votes</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {ideas.map((idea, index) => {
                    const isQualified = !!idea.qualified_at;
                    const profile = Array.isArray(idea.profiles) ? idea.profiles[0] : idea.profiles;

                    return (
                      <tr key={idea.id} className="transition-colors hover:bg-[var(--surface-2)]">
                        <td className="px-5 py-4 font-mono text-xs font-bold text-[var(--text-secondary)]">
                          #{String(index + 1).padStart(2, '0')}
                        </td>
                        <td className="max-w-xs truncate px-5 py-4 font-medium text-[var(--text-primary)]">
                          <Link
                            href={`/ideas/${idea.slug}`}
                            className="transition-colors hover:text-[var(--indigo-bright)]"
                          >
                            {idea.title}
                          </Link>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-[var(--text-tertiary)]">
                          {idea.category}
                        </td>
                        <td className="px-5 py-4 text-xs text-[var(--text-secondary)]">
                          {profile?.username ? (
                            <Link
                              href={`/u/${profile.username}`}
                              className="transition-colors hover:text-[var(--indigo-bright)]"
                            >
                              @{profile.username}
                            </Link>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-xs font-bold text-[var(--cyan-bright)]">
                          {idea.verified_vote_count}
                        </td>
                        <td className="px-5 py-4 text-center">
                          {isQualified ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-qualified)] bg-[rgba(139,92,246,0.15)] px-2 py-0.5 text-[11px] font-semibold text-[var(--violet-bright)]">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Qualified</span>
                            </span>
                          ) : (
                            <span className="font-mono text-[11px] text-[var(--text-tertiary)]">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
