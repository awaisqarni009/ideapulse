import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/user';
import { createClient } from '@/lib/supabase/server';
import { getVoteQuotaAction } from '@/app/actions/votes';
import { Dashboard3DPulse } from '@/app/components/dashboard/dashboard-3d-pulse';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  Flame,
  Lightbulb,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export const metadata: Metadata = {
  title: 'Creator Dashboard — IdeaPulse',
  description:
    'Monitor your proposals, vote quota, consensus trajectory, and active cycle metrics in real time.',
};

export const revalidate = 0; // Always fresh user data

export default async function DashboardPage() {
  const { user, profile, isConfirmed } = await getCurrentUser();

  if (!user) {
    redirect('/login?next=/dashboard');
  }

  const supabase = await createClient();

  // 1. Fetch active cycle
  const { data: activeCycle } = await supabase
    .from('cycles')
    .select('*')
    .eq('status', 'active')
    .maybeSingle();

  // 2. Fetch user's vote quota for the rolling 24 hours
  const quota = await getVoteQuotaAction();
  const availableVotes = quota ? quota.remaining : 5;
  const totalVotesLimit = quota ? quota.totalLimit : 5;

  // 3. Fetch user's authored ideas
  const { data: userIdeas } = await supabase
    .from('ideas')
    .select(
      'id, slug, title, summary, category, status, vote_count, verified_vote_count, qualified_at, cycle_id, created_at',
    )
    .eq('author_id', user.id)
    .order('created_at', { ascending: false });

  const ideas = userIdeas || [];
  const totalIdeas = ideas.length;
  const totalVerifiedVotes = ideas.reduce((acc, i) => acc + (i.verified_vote_count || 0), 0);
  const totalRawVotes = ideas.reduce((acc, i) => acc + (i.vote_count || 0), 0);
  const qualifiedIdeas = ideas.filter((i) => (i.verified_vote_count || 0) >= 50);

  // Check if author already submitted an idea in this active cycle (BR-020: 1 idea per cycle)
  const activeCycleSubmission = activeCycle
    ? ideas.find((i) => i.cycle_id === activeCycle.id)
    : null;

  // 4. Fetch active cycle qualifying ideas count and top 3 leaders
  const threshold = activeCycle?.vote_threshold ?? 50;
  const { data: topCycleIdeas } = activeCycle
    ? await supabase
        .from('ideas')
        .select('id, slug, title, verified_vote_count, profiles(username, display_name)')
        .eq('cycle_id', activeCycle.id)
        .order('verified_vote_count', { ascending: false })
        .limit(3)
    : { data: [] };

  // Calculate cycle deadline
  const endsAtDate = activeCycle?.ends_at ? new Date(activeCycle.ends_at) : null;
  const timeLeft =
    endsAtDate && endsAtDate > new Date()
      ? formatDistanceToNow(endsAtDate, { addSuffix: true })
      : 'Ending soon';

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-[var(--canvas)] px-4 py-8 focus:outline-none sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Top Banner / Welcome Bar */}
        <div
          className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 shadow-xl backdrop-blur-md sm:flex-row sm:items-center sm:p-8"
          style={{
            boxShadow: '0 20px 48px -12px rgba(0, 0, 0, 0.35), inset 0 1px 0 var(--edge-specular)',
          }}
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(99,102,241,0.25)] bg-[var(--tint-indigo)] px-2.5 py-0.5 text-xs font-semibold text-[var(--indigo-bright)]">
                <Sparkles className="h-3 w-3" />
                <span>Creator Command Center</span>
              </span>
              {isConfirmed ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Verified Identity</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                  <Clock className="h-3 w-3" />
                  <span>Unconfirmed Email</span>
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
              Welcome back, {profile?.display_name || user.email?.split('@')[0]}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] sm:text-sm">
              Track your proposal consensus velocity, manage your daily votes, and watch active
              cycle outcomes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {activeCycleSubmission ? (
              <Link
                href={`/idea/${activeCycleSubmission.slug}`}
                className="btn inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-accent)] bg-[var(--tint-indigo)] px-4 py-2.5 text-xs font-semibold text-[var(--indigo-bright)] transition-all hover:bg-[var(--indigo)] hover:text-white"
              >
                <Activity className="h-4 w-4" />
                <span>View Cycle Idea</span>
              </Link>
            ) : (
              <Link
                href="/submit"
                className="btn btn-primary inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--indigo)] px-4 py-2.5 text-xs font-semibold text-white shadow-[var(--glow-indigo-sm)] transition-all hover:bg-[var(--indigo-bright)] hover:shadow-[var(--glow-indigo-md)]"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Submit Idea for Cycle {activeCycle?.cycle_number ?? 1}</span>
              </Link>
            )}

            <Link
              href="/feed"
              className="btn inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-2)] px-4 py-2.5 text-xs font-medium text-[var(--text-primary)] transition-all hover:border-[var(--border-strong)] hover:bg-[var(--surface-3)]"
            >
              <Compass className="h-4 w-4" />
              <span>Explore Feed</span>
            </Link>
          </div>
        </div>

        {/* 4 Key Metrics Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Daily Quota Card */}
          <div
            className="hover:border-[var(--indigo)]/40 rounded-xl border border-[var(--border-default)] bg-[var(--surface-1)] p-5 shadow-sm backdrop-blur-sm transition-all"
            style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Daily Vote Quota
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(6,182,212,0.3)] bg-[rgba(6,182,212,0.1)] text-[var(--cyan-bright)]">
                <Zap className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-extrabold text-[var(--cyan-bright)]">
                {availableVotes}
              </span>
              <span className="text-xs text-[var(--text-tertiary)]">
                of {totalVotesLimit} available
              </span>
            </div>
            <div className="mt-3 flex gap-1.5">
              {Array.from({ length: totalVotesLimit }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    idx < availableVotes
                      ? 'bg-[var(--cyan-bright)] shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                      : 'bg-[var(--surface-3)]'
                  }`}
                  title={idx < availableVotes ? 'Available vote pip' : 'Used vote slot'}
                />
              ))}
            </div>
            <div className="mt-3 text-[11px] text-[var(--text-secondary)]">
              {quota?.nextSlotAt ? (
                <span>
                  Next slot restores{' '}
                  {formatDistanceToNow(new Date(quota.nextSlotAt), { addSuffix: true })}
                </span>
              ) : (
                <span>All 5 daily slots ready for casting</span>
              )}
            </div>
          </div>

          {/* Active Cycle Status */}
          <div
            className="hover:border-[var(--indigo)]/40 rounded-xl border border-[var(--border-default)] bg-[var(--surface-1)] p-5 shadow-sm backdrop-blur-sm transition-all"
            style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Active Cycle
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(99,102,241,0.3)] bg-[rgba(99,102,241,0.1)] text-[var(--indigo-bright)]">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-extrabold text-[var(--text-primary)]">
                #{activeCycle?.cycle_number ?? 1}
              </span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                ACTIVE
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>Time Remaining:</span>
              <span className="font-mono font-medium text-[var(--text-primary)]">{timeLeft}</span>
            </div>
            <div className="mt-2 text-[11px] text-[var(--text-tertiary)]">
              Ends {endsAtDate ? format(endsAtDate, 'MMM d, HH:mm UTC') : 'Weekly rotation'}
            </div>
          </div>

          {/* Backers / Votes Received */}
          <div
            className="hover:border-[var(--indigo)]/40 rounded-xl border border-[var(--border-default)] bg-[var(--surface-1)] p-5 shadow-sm backdrop-blur-sm transition-all"
            style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Votes Received
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.1)] text-[var(--violet-bright)]">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-extrabold text-[var(--violet-bright)]">
                {totalVerifiedVotes}
              </span>
              <span className="text-xs text-[var(--text-tertiary)]">verified votes</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>Raw Consensus:</span>
              <span className="font-mono">{totalRawVotes} total</span>
            </div>
            <div className="mt-2 text-[11px] text-emerald-400">
              {totalRawVotes > 0
                ? `${Math.round((totalVerifiedVotes / totalRawVotes) * 100)}% verified authenticity`
                : 'Zero sybil-risk flags detected'}
            </div>
          </div>

          {/* Qualified Milestones */}
          <div
            className="hover:border-[var(--indigo)]/40 rounded-xl border border-[var(--border-default)] bg-[var(--surface-1)] p-5 shadow-sm backdrop-blur-sm transition-all"
            style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Qualified Ideas
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.1)] text-[var(--accent-warning)]">
                <Trophy className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-extrabold text-[var(--accent-warning)]">
                {qualifiedIdeas.length}
              </span>
              <span className="text-xs text-[var(--text-tertiary)]">of {totalIdeas} total</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>Threshold Target:</span>
              <span className="font-mono">≥ 50 verified votes</span>
            </div>
            <div className="mt-2 text-[11px] text-[var(--text-tertiary)]">
              Qualifiers enter weekly funding reward evaluation
            </div>
          </div>
        </div>

        {/* Main Grid: Left (Proposals & Activity) + Right (3D Model & Network HUD) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: 7 Cols */}
          <div className="space-y-8 lg:col-span-7">
            {/* My Authored Proposals Deck */}
            <div
              className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 shadow-xl backdrop-blur-md"
              style={{
                boxShadow:
                  '0 20px 48px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 var(--edge-specular)',
              }}
            >
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border-accent)] bg-[var(--tint-indigo)] text-[var(--indigo-bright)]">
                    <Lightbulb className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[var(--text-primary)]">
                      Your Authored Proposals
                    </h2>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {totalIdeas} total submission{totalIdeas === 1 ? '' : 's'} across active and
                      archived cycles
                    </p>
                  </div>
                </div>

                {!activeCycleSubmission && (
                  <Link
                    href="/submit"
                    className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-accent)] bg-[var(--tint-indigo)] px-3 py-1.5 text-xs font-semibold text-[var(--indigo-bright)] transition-colors hover:bg-[var(--indigo)] hover:text-white"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Submit</span>
                  </Link>
                )}
              </div>

              <div className="mt-6 space-y-4">
                {ideas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-default)] py-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-accent)] bg-[var(--tint-indigo)] text-[var(--indigo-bright)]">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-bold text-[var(--text-primary)]">
                      No proposals submitted yet
                    </h3>
                    <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-[var(--text-secondary)]">
                      Have an idea that deserves funding? Submit your first proposal to start
                      collecting verified community votes.
                    </p>
                    <Link
                      href="/submit"
                      className="btn btn-primary mt-5 inline-flex items-center gap-2 rounded-md bg-[var(--indigo)] px-4 py-2 text-xs font-semibold text-white shadow-[var(--glow-indigo-sm)] transition-all hover:bg-[var(--indigo-bright)]"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Draft Your Proposal</span>
                    </Link>
                  </div>
                ) : (
                  ideas.map((idea) => {
                    const verifiedVotes = idea.verified_vote_count || 0;
                    const progressPercent = Math.min(
                      100,
                      Math.round((verifiedVotes / threshold) * 100),
                    );
                    const isQualified = verifiedVotes >= threshold;

                    return (
                      <div
                        key={idea.id}
                        className="bg-[var(--surface-2)]/70 hover:border-[var(--indigo)]/50 group relative rounded-xl border border-[var(--border-subtle)] p-4 transition-all duration-200 hover:bg-[var(--surface-2)]"
                        style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-[var(--radius-xs)] border border-[var(--border-subtle)] bg-[var(--surface-3)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                                {idea.category}
                              </span>
                              {isQualified ? (
                                <span className="inline-flex items-center gap-1 rounded-[var(--radius-xs)] border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>QUALIFIED</span>
                                </span>
                              ) : (
                                <span className="rounded-[var(--radius-xs)] border border-[var(--border-subtle)] bg-[var(--surface-3)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-tertiary)]">
                                  {idea.status.toUpperCase()}
                                </span>
                              )}
                              {activeCycle && idea.cycle_id === activeCycle.id && (
                                <span className="rounded-[var(--radius-xs)] border border-[rgba(6,182,212,0.3)] bg-[rgba(6,182,212,0.1)] px-2 py-0.5 text-[10px] font-semibold text-[var(--cyan-bright)]">
                                  CURRENT CYCLE
                                </span>
                              )}
                            </div>
                            <h3 className="font-display text-sm font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--indigo-bright)]">
                              <Link href={`/idea/${idea.slug}`} className="focus:outline-none">
                                {idea.title}
                              </Link>
                            </h3>
                            <p className="line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                              {idea.summary}
                            </p>
                          </div>

                          <div className="flex shrink-0 flex-col items-end">
                            <div className="flex items-baseline gap-1">
                              <span className="font-mono text-lg font-extrabold text-[var(--cyan-bright)]">
                                {verifiedVotes}
                              </span>
                              <span className="text-[10px] text-[var(--text-tertiary)]">
                                /{threshold}
                              </span>
                            </div>
                            <span className="text-[10px] text-[var(--text-tertiary)]">
                              verified
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar towards 50 votes */}
                        <div className="mt-3 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[var(--text-tertiary)]">Threshold Progress</span>
                            <span className="font-mono font-medium text-[var(--text-secondary)]">
                              {progressPercent}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isQualified
                                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                                  : 'bg-gradient-to-r from-[var(--indigo)] to-[var(--cyan-bright)]'
                              }`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="border-[var(--border-subtle)]/60 mt-3 flex items-center justify-between border-t pt-2 text-[11px] text-[var(--text-tertiary)]">
                          <span>
                            Submitted{' '}
                            {formatDistanceToNow(new Date(idea.created_at), { addSuffix: true })}
                          </span>
                          <Link
                            href={`/idea/${idea.slug}`}
                            className="inline-flex items-center gap-1 font-medium text-[var(--indigo-bright)] hover:underline"
                          >
                            <span>Open details</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Active Cycle Leaderboard Preview */}
            <div
              className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 shadow-xl backdrop-blur-md"
              style={{
                boxShadow:
                  '0 20px 48px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 var(--edge-specular)',
              }}
            >
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-[var(--accent-warning)]" />
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    Cycle {activeCycle?.cycle_number ?? 1} Leading Contenders
                  </h2>
                </div>
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[var(--indigo-bright)] hover:underline"
                >
                  <span>Full Standings</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="mt-4 divide-y divide-[var(--border-subtle)]">
                {topCycleIdeas && topCycleIdeas.length > 0 ? (
                  topCycleIdeas.map((leader, index) => {
                    const authorProfile = Array.isArray(leader.profiles)
                      ? leader.profiles[0]
                      : leader.profiles;

                    return (
                      <div key={leader.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                              index === 0
                                ? 'border border-amber-400/30 bg-amber-400/20 text-amber-400'
                                : index === 1
                                  ? 'border border-slate-300/30 bg-slate-300/20 text-slate-300'
                                  : 'border border-amber-700/30 bg-amber-700/20 text-amber-600'
                            }`}
                          >
                            {index + 1}
                          </span>
                          <div>
                            <Link
                              href={`/idea/${leader.slug}`}
                              className="text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--indigo-bright)]"
                            >
                              {leader.title}
                            </Link>
                            <div className="text-[10px] text-[var(--text-tertiary)]">
                              by @{authorProfile?.username || 'builder'}
                            </div>
                          </div>
                        </div>

                        <div className="font-mono text-xs font-bold text-[var(--cyan-bright)]">
                          {leader.verified_vote_count} votes
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-6 text-center text-xs text-[var(--text-tertiary)]">
                    No active proposals in Cycle {activeCycle?.cycle_number ?? 1} yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: 5 Cols (3D Model + Ecosystem Rules + Quick Actions) */}
          <div className="space-y-8 lg:col-span-5">
            {/* 3D Model Pulse Component */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Live Consensus Topology
                </span>
                <span className="font-mono text-[11px] text-[var(--cyan-bright)]">
                  3D Interactive Engine
                </span>
              </div>
              <Dashboard3DPulse
                availableVotes={availableVotes}
                totalVotesLimit={totalVotesLimit}
                activeCycleNumber={activeCycle?.cycle_number ?? 1}
                ideasCount={totalIdeas}
                verifiedCount={totalVerifiedVotes}
              />
            </div>

            {/* Protocol Rules Checklist */}
            <div
              className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 shadow-xl backdrop-blur-md"
              style={{
                boxShadow:
                  '0 20px 48px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 var(--edge-specular)',
              }}
            >
              <h3 className="font-display text-sm font-bold text-[var(--text-primary)]">
                Incubation Protocol Invariants
              </h3>
              <ul className="mt-4 space-y-3 text-xs">
                <li className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--tint-indigo)] text-[var(--indigo-bright)]">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <span className="text-[var(--text-secondary)]">
                    <strong className="text-[var(--text-primary)]">5 Daily Votes:</strong>{' '}
                    Replenishes every 24 hours on a rolling basis.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--tint-indigo)] text-[var(--indigo-bright)]">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <span className="text-[var(--text-secondary)]">
                    <strong className="text-[var(--text-primary)]">1 Idea per Cycle:</strong>{' '}
                    Authors may submit at most one idea per weekly cycle (BR-020).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--tint-indigo)] text-[var(--indigo-bright)]">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <span className="text-[var(--text-secondary)]">
                    <strong className="text-[var(--text-primary)]">
                      10-Min Retraction Window:
                    </strong>{' '}
                    Votes can only be retracted within 10 minutes (BR-014).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--tint-indigo)] text-[var(--indigo-bright)]">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <span className="text-[var(--text-secondary)]">
                    <strong className="text-[var(--text-primary)]">50-Vote Qualification:</strong>{' '}
                    Ideas must reach ≥ 50 verified votes to enter reward slots (BR-040).
                  </span>
                </li>
              </ul>

              <div className="mt-5 border-t border-[var(--border-subtle)] pt-4">
                <Link
                  href="/rules"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--indigo-bright)] hover:underline"
                >
                  <span>Review full protocol rulebook</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Quick Actions Matrix */}
            <div
              className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 shadow-xl backdrop-blur-md"
              style={{
                boxShadow:
                  '0 20px 48px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 var(--edge-specular)',
              }}
            >
              <h3 className="font-display text-sm font-bold text-[var(--text-primary)]">
                Quick Shortcuts
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link
                  href="/submit"
                  className="flex flex-col items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-4 text-center transition-all hover:border-[var(--indigo)] hover:bg-[var(--surface-3)]"
                >
                  <PlusCircle className="h-5 w-5 text-[var(--indigo-bright)]" />
                  <span className="mt-2 text-xs font-semibold text-[var(--text-primary)]">
                    Submit Idea
                  </span>
                </Link>

                <Link
                  href="/feed"
                  className="flex flex-col items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-4 text-center transition-all hover:border-[var(--cyan-bright)] hover:bg-[var(--surface-3)]"
                >
                  <Compass className="h-5 w-5 text-[var(--cyan-bright)]" />
                  <span className="mt-2 text-xs font-semibold text-[var(--text-primary)]">
                    Discover Feed
                  </span>
                </Link>

                <Link
                  href="/leaderboard"
                  className="flex flex-col items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-4 text-center transition-all hover:border-[var(--accent-warning)] hover:bg-[var(--surface-3)]"
                >
                  <Trophy className="h-5 w-5 text-[var(--accent-warning)]" />
                  <span className="mt-2 text-xs font-semibold text-[var(--text-primary)]">
                    Leaderboard
                  </span>
                </Link>

                <Link
                  href="/settings"
                  className="flex flex-col items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-4 text-center transition-all hover:border-[var(--violet-bright)] hover:bg-[var(--surface-3)]"
                >
                  <Users className="h-5 w-5 text-[var(--violet-bright)]" />
                  <span className="mt-2 text-xs font-semibold text-[var(--text-primary)]">
                    Profile & Settings
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
