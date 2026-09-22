import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Sparkles,
  Lightbulb,
  CheckCircle2,
  TrendingUp,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Clock,
  Vote,
  FileCode2,
  Lock,
  Layers,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'How It Works — IdeaPulse',
  description:
    'Understand the IdeaPulse incubation lifecycle: from submitting an idea to rolling quotas, qualification thresholds, and weekly cycle sweeps.',
};

export default function HowItWorksPage() {
  const steps = [
    {
      step: '01',
      title: 'Submit Your Proposal',
      badge: '1 per Cycle Rule',
      desc: 'Craft a compelling pitch with markdown, tags, and expected milestones. You are limited to exactly 1 proposal per active cycle to keep quality sky-high.',
      icon: Lightbulb,
      boxBg: 'from-amber-500/20 to-orange-600/20 border-amber-500/30 text-amber-400',
    },
    {
      step: '02',
      title: 'Cast Rolling Votes',
      badge: '5 Votes / 24h Quota',
      desc: 'Verified users receive a rolling quota of 5 votes every 24 hours. Vote for ideas you believe in or retract a vote within 1 hour if you change your mind.',
      icon: Vote,
      boxBg: 'from-indigo-500/20 to-purple-600/20 border-indigo-500/30 text-indigo-400',
    },
    {
      step: '03',
      title: 'Hit Qualification Threshold',
      badge: '5 Verified Votes',
      desc: 'Once an idea earns 5 verified human votes, it gains official "Qualified" status. Its qualification timestamp is locked for fair tie-breaking.',
      icon: TrendingUp,
      boxBg: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/30 text-cyan-400',
    },
    {
      step: '04',
      title: 'Automated Cycle Finalization',
      badge: 'Every Sunday Midnight',
      desc: 'At cycle close, our automated engine tabulates verified tallies. The #1 idea is crowned champion, with the top 3 enshrined on the permanent leaderboard.',
      icon: Trophy,
      boxBg: 'from-violet-500/20 to-fuchsia-600/20 border-violet-500/30 text-violet-400',
    },
  ];

  return (
    <main id="main-content" className="relative min-h-screen overflow-hidden pb-24 pt-12">
      {/* Background Volumetric Glow Orbs */}
      <div className="from-[var(--indigo)]/20 via-[var(--cyan)]/15 to-[var(--violet)]/20 pointer-events-none absolute -top-32 left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr blur-[130px]" />
      <div className="bg-[var(--indigo)]/10 pointer-events-none absolute left-[-10%] top-[40%] -z-10 h-[500px] w-[500px] rounded-full blur-[120px]" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <section className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[var(--tint-indigo)] px-4 py-1.5 text-xs font-semibold text-[var(--indigo-bright)] shadow-[var(--glow-indigo-sm)]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The Incubation Lifecycle</span>
          </div>

          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
            How <span className="text-gradient-dual">IdeaPulse</span> Works
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
            A transparent, anti-cheat validation pipeline built entirely on deterministic database
            guarantees. Here is how an idea travels from submission to victory.
          </p>
        </section>

        {/* 4 Steps Grid */}
        <section className="mt-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="glass-card-nextgen relative flex flex-col justify-between p-6 transition-all duration-300 hover:scale-[1.02]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-3xl font-extrabold text-[var(--text-tertiary)] opacity-60">
                        {item.step}
                      </span>
                      <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-3)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--indigo-bright)]">
                        {item.badge}
                      </span>
                    </div>

                    <div
                      className={`mt-4 inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] border bg-gradient-to-br ${item.boxBg} shadow-md`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <h3 className="mt-4 font-display text-lg font-bold text-[var(--text-primary)]">
                      {item.title}
                    </h3>
                    <p className="mt-2.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-[var(--border-subtle)] pt-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-tertiary)]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[var(--cyan-bright)]" />
                      <span>Phase {idx + 1} Automated</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Featured Velocity Tablet & Interactive Highlights (NextGen Reference Design Style) */}
        <section className="mt-24">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            {/* Left: Interactive Graphic (Volumetric 120% tablet) */}
            <div className="flex justify-center lg:col-span-6">
              <div className="relative w-full max-w-md overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-accent)] bg-[var(--surface-solid)] p-8 shadow-[var(--glow-indigo-lg)]">
                {/* Top highlight */}
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, var(--edge-specular), transparent)',
                  }}
                />

                <div className="flex items-center justify-between">
                  <span className="badge-pill">
                    <TrendingUp className="h-3 w-3" />
                    <span>Realtime Momentum</span>
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)]">Cycle #42</span>
                </div>

                <div className="mt-6">
                  <div className="font-display text-5xl font-extrabold text-[var(--cyan-bright)]">
                    120%
                  </div>
                  <div className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
                    Average Consensus Velocity
                  </div>
                </div>

                {/* Stylized Neon Bar Chart */}
                <div className="mt-6 flex h-28 items-end gap-3 border-b border-[var(--border-subtle)] pb-2">
                  <div className="bg-[var(--indigo)]/40 h-[30%] w-full rounded-t-sm transition-all hover:bg-[var(--indigo)]" />
                  <div className="bg-[var(--indigo)]/60 h-[55%] w-full rounded-t-sm transition-all hover:bg-[var(--indigo)]" />
                  <div className="bg-[var(--cyan)]/50 h-[40%] w-full rounded-t-sm transition-all hover:bg-[var(--cyan)]" />
                  <div className="h-[80%] w-full rounded-t-sm bg-[var(--cyan-bright)] shadow-[0_0_12px_rgba(6,182,212,0.5)] transition-all" />
                  <div className="bg-[var(--violet-bright)]/70 h-[65%] w-full rounded-t-sm transition-all hover:bg-[var(--violet)]" />
                  <div className="h-[95%] w-full rounded-t-sm bg-gradient-to-t from-[var(--indigo)] to-[var(--cyan-bright)] shadow-[0_0_16px_rgba(99,102,241,0.6)]" />
                </div>

                {/* Status Badges */}
                <div className="mt-6 space-y-2.5">
                  <div className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-2 text-xs">
                    <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Clock className="h-3.5 w-3.5 text-amber-400" />
                      <span>7-Day Cycle Window</span>
                    </span>
                    <span className="font-semibold text-emerald-400">Active</span>
                  </div>

                  <div className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-2 text-xs">
                    <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <ShieldCheck className="h-3.5 w-3.5 text-[var(--cyan-bright)]" />
                      <span>Advisory Locks</span>
                    </span>
                    <span className="font-semibold text-[var(--cyan-bright)]">Atomic</span>
                  </div>

                  <div className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-2 text-xs">
                    <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Layers className="h-3.5 w-3.5 text-[var(--violet-bright)]" />
                      <span>Ledger State</span>
                    </span>
                    <span className="font-semibold text-[var(--violet-bright)]">Append-Only</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Explanatory Content */}
            <div className="lg:col-span-6">
              <span className="badge-pill">
                <ShieldCheck className="h-3 w-3" />
                <span>Anti-Abuse Guarantees</span>
              </span>

              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                The Science of Anti-Sybil Voting
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                Most web platforms rely on simple count increments that bots can easily exploit.
                IdeaPulse uses deep database-level constraints to guarantee pure fairness:
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-4">
                  <div className="flex items-center gap-2 font-display text-sm font-bold text-[var(--text-primary)]">
                    <Lock className="h-4 w-4 text-[var(--indigo-bright)]" />
                    <span>PostgreSQL Advisory Locks</span>
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
                    Concurrent votes for the same user serialize sequentially. Race conditions to
                    bypass the 5-vote limit are mathematically impossible.
                  </p>
                </div>

                <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-4">
                  <div className="flex items-center gap-2 font-display text-sm font-bold text-[var(--text-primary)]">
                    <FileCode2 className="h-4 w-4 text-[var(--cyan-bright)]" />
                    <span>Deterministic Tie-Breaking</span>
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
                    If two proposals tie with the same verified votes, the idea that crossed the
                    5-vote qualification threshold first wins.
                  </p>
                </div>

                <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-4">
                  <div className="flex items-center gap-2 font-display text-sm font-bold text-[var(--text-primary)]">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Immutable History</span>
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
                    Once a cycle completes, winners and final ranks are frozen forever in historical
                    archives.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <Link
                  href="/submit"
                  className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-accent)] bg-[var(--indigo)] px-5 py-2.5 text-xs font-semibold text-white shadow-[var(--glow-indigo-sm)] transition-all hover:bg-[var(--indigo-bright)]"
                >
                  <span>Submit an Idea Now</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] px-5 py-2.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <span>Read FAQ</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
