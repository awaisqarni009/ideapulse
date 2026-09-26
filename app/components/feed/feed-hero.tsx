'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/auth/use-user';
import { useEnergy } from '@/lib/energy/energy-context';
import {
  Sparkles,
  Zap,
  Trophy,
  ArrowRight,
  PlusCircle,
  HelpCircle,
  Activity,
  DollarSign,
  TrendingUp,
  Award,
  CheckCircle2,
  Gift,
  Coins,
} from 'lucide-react';

interface FeedHeroProps {
  cycleNumber: number;
  totalIdeasCount?: number;
}

/**
 * Ultra-Modern Eventify & IdeaPulse Feed Hero
 * Features:
 * - Dynamic Personalized Welcome banner with time-of-day greeting
 * - Spectacular glowing Dollar Effects, floating currency particles & $50,000 Grant Vault
 * - Live interactive breakdown of 1st, 2nd, and 3rd place cash awards
 * - Direct triggers to Energy Quests & Submission workflows
 */
export function FeedHero({ cycleNumber = 1, totalIdeasCount = 12 }: FeedHeroProps) {
  const { user, profile } = useUser();
  const { energy, setIsHubOpen } = useEnergy();
  const [greeting, setGreeting] = useState('Welcome');
  const [showVaultDetails, setShowVaultDetails] = useState(false);
  const [isSparkling, setIsSparkling] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const displayName = profile?.display_name || profile?.username || user?.email?.split('@')[0];

  const triggerSparkle = () => {
    setIsSparkling(true);
    setTimeout(() => setIsSparkling(false), 1200);
  };

  return (
    <section className="relative mb-8 overflow-hidden rounded-3xl border border-[var(--border-default)] bg-gradient-to-b from-[var(--surface-1)] via-[var(--surface-1)] to-[var(--surface-2)] p-6 shadow-2xl backdrop-blur-xl sm:mb-12 sm:p-8 lg:p-10">
      {/* Background ambient lighting: Emerald, Indigo & Cyan radials */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-[450px] w-[450px] rounded-full bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-transparent blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-cyan-500/5 to-transparent blur-3xl"
        aria-hidden="true"
      />

      {/* Floating Dollar / Currency Particle Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Floating Badge 1 - Top Right above vault */}
        <div className="animate-float-dollar-1 absolute right-8 top-4 hidden select-none items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] backdrop-blur-md xl:flex">
          <DollarSign className="h-3.5 w-3.5 text-emerald-300" />
          <span>+$25,000 Grand Prize</span>
        </div>

        {/* Floating Badge 2 - Top Center Header */}
        <div className="animate-float-dollar-2 absolute left-1/2 top-4 hidden -translate-x-1/2 select-none items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/50 px-3.5 py-1 text-xs font-bold text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] backdrop-blur-md 2xl:flex">
          <Coins className="h-3.5 w-3.5 text-cyan-300" />
          <span>$50,000 Treasury Backed</span>
        </div>

        {/* Floating Badge 3 - Floating near bottom right above metrics */}
        <div className="animate-float-dollar-3 absolute right-[390px] top-1/2 hidden -translate-y-1/2 select-none items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-950/60 px-3 py-1 text-xs font-bold text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)] backdrop-blur-md xl:flex">
          <Trophy className="h-3.5 w-3.5 text-amber-400" />
          <span>Top 3 Backed</span>
        </div>

        {/* Ambient Glowing Floating Coins */}
        <div className="animate-float-dollar-2 coin-glow-effect absolute bottom-14 right-24 hidden h-8 w-8 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-900/50 text-xs font-black text-emerald-300 shadow-lg lg:flex">
          $
        </div>
        <div className="animate-float-dollar-1 absolute left-1/3 top-6 hidden h-6 w-6 items-center justify-center rounded-full border border-teal-400/30 bg-teal-900/40 text-[10px] font-black text-teal-300 shadow-md md:flex">
          $
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Section: Welcome Message, Heading & CTAs */}
        <div className="max-w-2xl">
          {/* Dynamic Welcome Pill with Pulse */}
          <div className="mb-3.5 flex flex-wrap items-center gap-2 sm:mb-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>
                {user ? `${greeting}, ${displayName}! 👋` : `${greeting} & Welcome to Eventify! 🌟`}
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Cycle #{cycleNumber} Live Grant Stage</span>
            </div>
          </div>

          {/* Main Title with Shimmering Gradient */}
          <h1 className="font-display text-3xl font-extrabold leading-[1.15] tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl">
            Discover Events & Ideas{' '}
            <span className="animate-shimmer-dollar block sm:inline">Funded by the Crowd.</span>
          </h1>

          {/* Subtitle with Value Proposition */}
          <p className="mt-3.5 text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
            Where breakthrough summits, hackathons, and visionary proposals compete for the{' '}
            <strong className="font-semibold text-emerald-400">$50,000 community grant pool</strong>
            . Every verified member receives <strong>5 daily voting sparks</strong> to allocate real
            backing signals.
          </p>

          {/* Action CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-7">
            <Link
              href="/submit"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500/40 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all hover:scale-[1.03] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] active:scale-[0.98] sm:text-sm"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Submit for $50K Grants</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsHubOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border-accent)] bg-[var(--surface-2)] px-5 py-3 text-xs font-semibold text-[var(--indigo-bright)] shadow-sm transition-all hover:border-[var(--indigo)] hover:bg-[var(--surface-3)] active:scale-[0.98] sm:text-sm"
            >
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Energy Quests ({energy}⚡)</span>
            </button>

            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] px-4 py-3 text-xs font-medium text-[var(--text-secondary)] transition-all hover:text-[var(--text-primary)] sm:text-sm"
            >
              <HelpCircle className="h-4 w-4 text-[var(--text-tertiary)]" />
              <span>How Grants Work</span>
            </Link>
          </div>
        </div>

        {/* Right Section: The Ultra-Modern Dollar Grant Vault Showcase */}
        <div className="relative shrink-0 lg:w-[360px]">
          <div
            onClick={triggerSparkle}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && triggerSparkle()}
            className={`group relative cursor-pointer overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[var(--surface-2)] to-[var(--surface-3)] p-5 shadow-[0_0_40px_rgba(16,185,129,0.15)] backdrop-blur-xl transition-all duration-300 hover:border-emerald-400 hover:shadow-[0_0_50px_rgba(16,185,129,0.3)] sm:p-6 ${
              isSparkling
                ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-[var(--surface-1)]'
                : ''
            }`}
            style={{ boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.15)' }}
          >
            {/* Top Vault Ribbon */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/20 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Cycle #{cycleNumber} Grant Vault
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-[var(--text-tertiary)]">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    <span>Treasury Backed</span>
                  </div>
                </div>
              </div>

              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                Active
              </span>
            </div>

            {/* Glowing Big Dollar Counter */}
            <div className="my-4 text-center">
              <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                Total Available Backing
              </div>
              <div className="animate-shimmer-dollar font-display text-4xl font-black tracking-tight sm:text-5xl">
                $50,000
              </div>
              <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
                Disbursed to top 3 ranked proposals on Sunday midnight
              </p>
            </div>

            {/* Prize Distribution Tiers */}
            <div className="bg-[var(--surface-1)]/70 space-y-2 rounded-2xl border border-[var(--border-subtle)] p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-400">
                    1
                  </span>
                  <span>1st Grand Prize</span>
                </span>
                <span className="font-mono font-bold text-emerald-400">$25,000</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-400/20 text-[10px] font-bold text-slate-300">
                    2
                  </span>
                  <span>2nd Velocity Award</span>
                </span>
                <span className="font-mono font-bold text-teal-400">$15,000</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-700/20 text-[10px] font-bold text-amber-600">
                    3
                  </span>
                  <span>3rd Community Prize</span>
                </span>
                <span className="font-mono font-bold text-cyan-400">$10,000</span>
              </div>
            </div>

            {/* Bottom info link */}
            <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
              <span className="flex items-center gap-1">
                <Award className="h-3 w-3 text-amber-400" />
                <span>50 votes needed to qualify</span>
              </span>
              <span className="font-medium text-emerald-400 group-hover:underline">
                View Rules →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Mini Metrics Bar: Cycle, Goal, Votes, Security */}
      <div className="mt-8 grid grid-cols-2 gap-3 border-t border-[var(--border-subtle)] pt-6 sm:grid-cols-4 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-base font-bold text-[var(--text-primary)]">
              Cycle #{cycleNumber}
            </div>
            <div className="text-[11px] text-[var(--text-tertiary)]">Weekly Window</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-base font-bold text-emerald-400">$50K Grant</div>
            <div className="text-[11px] text-[var(--text-tertiary)]">Automated Payout</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-base font-bold text-[var(--text-primary)]">
              50 Votes
            </div>
            <div className="text-[11px] text-[var(--text-tertiary)]">Qualification Bar</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-base font-bold text-[var(--text-primary)]">
              {totalIdeasCount} Projects
            </div>
            <div className="text-[11px] text-[var(--text-tertiary)]">Competing Live</div>
          </div>
        </div>
      </div>
    </section>
  );
}
