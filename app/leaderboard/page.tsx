import React from 'react';
import type { Metadata } from 'next';
import { getLeaderboardAction } from '@/app/actions/leaderboard';
import { RealtimeLeaderboard } from '@/app/components/leaderboard/realtime-leaderboard';
import { Trophy, ShieldCheck } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';

export const metadata: Metadata = {
  title: 'Live Leaderboard — IdeaPulse',
  description: 'Real-time standings and verified vote tallies for top community proposals.',
};

/**
 * /leaderboard Page (RSC) per ARCHITECTURE.md §1.5, §5.1 and TASKS.md [T-4.9, T-4.10]
 * Renders top 20 ranked proposals in a semantic <ol> list from idea_public_stats.
 */
export default async function LeaderboardPage() {
  const { cycleId, cycleNumber, endsAt, items } = await getLeaderboardAction();

  let endsText = 'soon';
  if (endsAt) {
    try {
      endsText = formatDistanceToNowStrict(new Date(endsAt), { addSuffix: true });
    } catch {
      endsText = 'soon';
    }
  }

  return (
    <main className="min-h-[calc(100vh-64px)] py-10 sm:py-14">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header Title & Cycle Context */}
        <div className="mb-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(139,92,246,0.4)] bg-[rgba(139,92,246,0.12)] px-3 py-1 text-xs font-semibold text-[var(--violet-bright)] shadow-[var(--glow-violet-md)]">
              <Trophy className="h-3.5 w-3.5 text-[var(--violet-bright)]" />
              <span>Cycle #{cycleNumber} Standings</span>
            </div>

            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl">
              Leaderboard
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
              Proposals reaching 50 verified votes qualify for the final cycle sweep. Top 3
              qualified ideas receive recognition and pool rewards at cycle close ({endsText}).
            </p>
          </div>

          {/* Rules Summary Badge */}
          <div className="flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] px-4 py-2 text-xs text-[var(--text-secondary)]">
            <ShieldCheck className="h-4 w-4 text-[var(--cyan-bright)]" />
            <span>Verified votes only · Strict anti-cheat</span>
          </div>
        </div>

        {/* Realtime Animated Ordered List <ol> per T-4.10, T-4.11, T-4.12 */}
        <RealtimeLeaderboard initialItems={items} cycleId={cycleId} cycleNumber={cycleNumber} />
      </div>
    </main>
  );
}
