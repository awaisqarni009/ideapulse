import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Calendar,
  Zap,
  Trophy,
  ArrowRight,
  PlusCircle,
  HelpCircle,
  Activity,
} from 'lucide-react';

interface FeedHeroProps {
  cycleNumber: number;
  totalIdeasCount?: number;
}

/**
 * Premium Eventify & IdeaPulse Feed Hero Section
 * Communicates discovery purpose, active cycle metrics, and guides user exploration.
 */
export function FeedHero({ cycleNumber = 1, totalIdeasCount = 12 }: FeedHeroProps) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-5 shadow-lg sm:mb-10 sm:rounded-3xl sm:p-8 lg:p-10">
      {/* Background ambient lighting/gradient accents */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-gradient-to-tr from-cyan-500/15 via-blue-500/10 to-transparent blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Text & Badges */}
        <div className="max-w-2xl">
          {/* Cycle & Live Status Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[rgba(99,102,241,0.12)] px-3 py-1 text-[11px] font-semibold text-[var(--indigo-bright)] shadow-sm backdrop-blur-md sm:px-3.5 sm:py-1.5 sm:text-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Cycle #{cycleNumber} Discovery Showcase · Live</span>
          </div>

          {/* Heading */}
          <h1 className="mt-3 font-display text-2xl font-extrabold leading-tight tracking-tight text-[var(--text-primary)] sm:mt-4 sm:text-4xl lg:text-5xl">
            Discover Events,{' '}
            <span className="bg-gradient-to-r from-[var(--indigo-bright)] via-purple-400 to-[var(--cyan-bright)] bg-clip-text text-transparent">
              Innovations & Showcases
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-2.5 text-xs leading-relaxed text-[var(--text-secondary)] sm:mt-3 sm:text-sm">
            Find experiences, connect with creators, and back community-led breakthroughs. Every
            verified member receives <strong>5 daily votes</strong> to elevate the projects that
            shape tomorrow.
          </p>

          {/* Action Buttons */}
          <div className="mt-5 flex flex-col items-stretch gap-2.5 sm:mt-6 sm:flex-row sm:items-center sm:gap-3">
            <Link
              href="/submit"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border-accent)] bg-gradient-to-r from-[var(--indigo)] to-[var(--indigo-deep)] px-5 py-2.5 text-xs font-semibold text-white shadow-[var(--glow-indigo-sm)] transition-all hover:scale-[1.02] hover:shadow-[var(--glow-indigo-md)] active:scale-[0.98] sm:text-sm"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Submit Event / Proposal</span>
            </Link>

            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] px-4 py-2.5 text-xs font-semibold text-[var(--text-secondary)] transition-all hover:border-[var(--border-strong)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)] sm:text-sm"
            >
              <HelpCircle className="h-4 w-4 text-[var(--text-tertiary)]" />
              <span>How Voting Works</span>
            </Link>
          </div>
        </div>

        {/* Right: Live Metrics Cards */}
        <div className="grid shrink-0 grid-cols-2 gap-2.5 sm:gap-4 lg:w-80">
          <div className="glass-panel flex flex-col justify-between rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] p-3 shadow-sm backdrop-blur-md sm:rounded-2xl sm:p-4">
            <div className="flex items-center justify-between text-[var(--indigo-bright)]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] sm:text-[11px]">
                Active Cycle
              </span>
              <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="mt-1.5 sm:mt-2">
              <span className="font-display text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
                #{cycleNumber}
              </span>
              <p className="text-[10px] leading-tight text-[var(--text-secondary)] sm:text-[11px]">
                Open for Votes
              </p>
            </div>
          </div>

          <div className="glass-panel flex flex-col justify-between rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] p-3 shadow-sm backdrop-blur-md sm:rounded-2xl sm:p-4">
            <div className="flex items-center justify-between text-[var(--cyan-bright)]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] sm:text-[11px]">
                Grant Pool
              </span>
              <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="mt-1.5 sm:mt-2">
              <span className="font-display text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
                $25,000
              </span>
              <p className="text-[10px] leading-tight text-[var(--text-secondary)] sm:text-[11px]">
                Top 3 ranked
              </p>
            </div>
          </div>

          <div className="glass-panel flex flex-col justify-between rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] p-3 shadow-sm backdrop-blur-md sm:rounded-2xl sm:p-4">
            <div className="flex items-center justify-between text-purple-400">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] sm:text-[11px]">
                Goal
              </span>
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="mt-1.5 sm:mt-2">
              <span className="font-display text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
                50 Votes
              </span>
              <p className="text-[10px] leading-tight text-[var(--text-secondary)] sm:text-[11px]">
                To qualify
              </p>
            </div>
          </div>

          <div className="glass-panel flex flex-col justify-between rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] p-3 shadow-sm backdrop-blur-md sm:rounded-2xl sm:p-4">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] sm:text-[11px]">
                Cadence
              </span>
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="mt-1.5 sm:mt-2">
              <span className="font-display text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
                7 Days
              </span>
              <p className="text-[10px] leading-tight text-[var(--text-secondary)] sm:text-[11px]">
                Weekly sweep
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
