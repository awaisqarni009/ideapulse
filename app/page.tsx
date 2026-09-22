import React from 'react';
import type { Metadata } from 'next';
import { getLeaderboardAction } from '@/app/actions/leaderboard';
import { HeroShowcase } from '@/app/components/landing/hero-showcase';

export const metadata: Metadata = {
  title: 'IdeaPulse — Where Great Ideas Earn Their Backing',
  description:
    'A fraud-resistant product idea validation engine. One idea per author per cycle, five votes per 24 hours, and automated weekly rewards for top community proposals.',
};

/**
 * Landing Page (RSC) per ARCHITECTURE.md §5.1 and TASKS.md [T-4.16]
 * - Staggered hero entrance
 * - Live top 3 proposals from active cycle
 * - The three fundamental rules stated in 3 lines
 * - Single primary CTA
 */
export default async function HomePage() {
  const { cycleNumber, items } = await getLeaderboardAction();
  const topThree = items.slice(0, 3);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex min-h-[calc(100vh-64px)] flex-col justify-center focus:outline-none"
    >
      <HeroShowcase topThree={topThree} cycleNumber={cycleNumber} />
    </main>
  );
}
