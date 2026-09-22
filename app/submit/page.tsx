import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/user';
import { SUBMISSION_COOLDOWN_MS } from '@/lib/constants';
import { IdeaForm } from '@/app/components/ideas/idea-form';
import { CooldownPanel } from '@/app/components/ideas/cooldown-panel';
import { Lightbulb, Info, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit an Idea — IdeaPulse',
  description: 'Submit your proposal for the active cycle. One submission per rolling 7 days.',
};

export default async function SubmitPage() {
  const { user, profile, isWritable, isConfirmed } = await getCurrentUser();

  if (!user) {
    redirect('/login?next=/submit');
  }

  // Suspended accounts are barred from submission per RULES.md BR-004
  if (profile?.status === 'suspended') {
    redirect('/suspended');
  }

  const supabase = await createClient();

  // 1. Fetch active cycle
  const { data: activeCycle } = await supabase
    .from('cycles')
    .select('id, cycle_number, status, vote_threshold')
    .eq('status', 'active')
    .maybeSingle();

  if (!activeCycle) {
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="container mx-auto max-w-2xl px-4 py-16 focus:outline-none"
      >
        <div className="glass-panel rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-1)] p-8 text-center">
          <Info className="mx-auto mb-3 h-10 w-10 text-[var(--text-tertiary)]" />
          <h1 className="text-xl font-bold text-[var(--text-primary)]">No Active Cycle</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Submissions are temporarily closed until the next cycle begins.
          </p>
          <Link href="/" className="btn btn-secondary mt-6 inline-flex">
            Return to Leaderboard
          </Link>
        </div>
      </main>
    );
  }

  // 2. Fetch user's latest submission to determine cooldown state (RULES.md BR-020)
  const { data: latestIdea } = await supabase
    .from('ideas')
    .select('id, title, created_at, status')
    .eq('author_id', user.id)
    .in('status', ['published', 'withdrawn', 'under_review'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestIdea) {
    const lastCreatedAt = new Date(latestIdea.created_at).getTime();
    const nextSlotTime = lastCreatedAt + SUBMISSION_COOLDOWN_MS;
    const isUnderCooldown = nextSlotTime > Date.now();

    if (isUnderCooldown) {
      return (
        <main className="min-h-[calc(100vh-80px)] py-12">
          <CooldownPanel nextSlotAt={new Date(nextSlotTime).toISOString()} />
        </main>
      );
    }
  }

  // 3. If email unconfirmed, render warning prompt above the form
  const unconfirmedWarning = !isConfirmed && (
    <div
      role="alert"
      className="mb-8 flex items-start gap-3 rounded-[var(--radius-md)] border border-[rgba(234,179,8,0.3)] bg-[rgba(234,179,8,0.08)] p-4 text-sm text-[var(--accent-warning)]"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="font-semibold text-[var(--text-primary)]">Email confirmation required</p>
        <p className="mt-1 text-[var(--text-secondary)]">
          You can draft your idea below, but your email must be confirmed before submitting. Please
          check your inbox.
        </p>
      </div>
    </div>
  );

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-[calc(100vh-80px)] py-12 focus:outline-none"
    >
      <div className="container mx-auto max-w-3xl px-4">
        {/* Header */}
        <header className="mb-8">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[rgba(99,102,241,0.1)] px-3 py-1 text-xs font-semibold text-[var(--indigo-bright)]">
            <Lightbulb className="h-3.5 w-3.5" />
            Cycle {activeCycle.cycle_number} Submissions
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Submit a New Proposal
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--text-secondary)]">
            Make your case. Once submitted, your idea competes in the active cycle. Your idea
            requires {activeCycle.vote_threshold} verified votes to qualify for rewards.
          </p>
        </header>

        {unconfirmedWarning}

        {/* Main form container with glass elevation */}
        <div className="glass-panel relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-1)] p-6 shadow-xl sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-[var(--edge-specular)]" />
          <IdeaForm cycleId={activeCycle.id} />
        </div>

        {/* Rules footer notes */}
        <footer className="mt-8 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-4 text-xs text-[var(--text-tertiary)]">
          <p className="font-medium text-[var(--text-secondary)]">Submission rules:</p>
          <ul className="mt-1.5 list-inside list-disc space-y-1">
            <li>One submission every 7 rolling days (168 hours).</li>
            <li>Edits lock permanently upon receiving the first vote (BR-022).</li>
            <li>Self-voting is strictly forbidden by database constraint (BR-012).</li>
          </ul>
        </footer>
      </div>
    </main>
  );
}
