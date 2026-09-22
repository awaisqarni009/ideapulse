import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Sparkles,
  Users,
  Star,
  Award,
  ShieldCheck,
  Zap,
  TrendingUp,
  Scale,
  Lock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us — IdeaPulse',
  description:
    'Empowering creators and communities to discover, validate, and fund breakthrough ideas through verifiable consensus.',
};

export default function AboutPage() {
  const stats = [
    {
      value: '10K+',
      label: 'Active Creators',
      detail: 'Building real solutions across 30+ countries',
      icon: Users,
      glowColor: 'from-indigo-500 to-purple-600',
    },
    {
      value: '4.9 / 5',
      label: 'Consensus Rating',
      detail: 'High signal, anti-spam verified participation',
      icon: Star,
      glowColor: 'from-cyan-500 to-blue-600',
    },
    {
      value: '500+',
      label: 'Ideas Validated',
      detail: 'Reaching qualified status across weekly cycles',
      icon: Award,
      glowColor: 'from-violet-500 to-fuchsia-600',
    },
    {
      value: '100%',
      label: 'Anti-Sybil Verified',
      detail: 'Immutable PostgreSQL audit trail & verified accounts',
      icon: ShieldCheck,
      glowColor: 'from-emerald-500 to-teal-600',
    },
  ];

  const corePillars = [
    {
      title: 'Decentralized Meritocracy',
      desc: 'No venture gatekeepers, no backroom algorithms. Ideas rise strictly on community consensus and verified peer votes.',
      icon: Zap,
      accent: 'var(--cyan-bright)',
      boxBg: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/30 text-cyan-400',
    },
    {
      title: 'Anti-Sybil By Design',
      desc: 'Rigid rolling quotas (5 votes / 24h) and verified human checks make vote botting mathematically non-viable.',
      icon: ShieldCheck,
      accent: 'var(--indigo-bright)',
      boxBg: 'from-indigo-500/20 to-purple-600/20 border-indigo-500/30 text-indigo-400',
    },
    {
      title: 'Immutable Consensus Ledger',
      desc: 'Every vote is written to an append-only PostgreSQL ledger with row-level security and strict verification state tracking.',
      icon: Lock,
      accent: 'var(--violet-bright)',
      boxBg: 'from-violet-500/20 to-fuchsia-600/20 border-violet-500/30 text-violet-400',
    },
    {
      title: 'Equal Playing Field',
      desc: 'Every creator is bound to exactly one idea per active cycle. Big teams cannot drown out independent innovators.',
      icon: Scale,
      accent: 'var(--success)',
      boxBg: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/30 text-emerald-400',
    },
  ];

  return (
    <main id="main-content" className="relative min-h-screen overflow-hidden pb-24 pt-12">
      {/* Background Volumetric Glow Orbs */}
      <div className="from-[var(--indigo)]/20 via-[var(--violet)]/15 to-[var(--cyan)]/20 pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-tr blur-[130px]" />
      <div className="bg-[var(--cyan-bright)]/10 pointer-events-none absolute right-[-10%] top-[40%] -z-10 h-[500px] w-[500px] rounded-full blur-[120px]" />
      <div className="bg-[var(--violet-bright)]/10 pointer-events-none absolute left-[-10%] top-[70%] -z-10 h-[500px] w-[500px] rounded-full blur-[120px]" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="mx-auto max-w-4xl text-center">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[var(--tint-indigo)] px-4 py-1.5 text-xs font-semibold text-[var(--indigo-bright)] shadow-[var(--glow-indigo-sm)]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The Next Generation Community Incubator</span>
          </div>

          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-[1.15]">
            Creative Solutions for a <span className="text-gradient-dual">Brighter Future</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
            IdeaPulse is a community-governed innovation engine where creators propose bold visions
            and verified peers validate, elevate, and fund the most promising initiatives without
            corporate intermediaries.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-accent)] bg-[var(--indigo)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--glow-indigo-md)] transition-all hover:bg-[var(--indigo-bright)] hover:shadow-[var(--glow-indigo-lg)] active:scale-95"
            >
              <span>Submit Your Idea</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-2)] px-6 py-3 text-sm font-semibold text-[var(--text-primary)] transition-all hover:border-[var(--border-accent)] hover:bg-[var(--surface-3)]"
            >
              <span>How It Works</span>
            </Link>
          </div>
        </section>

        {/* 4 Metric Stats Cards (NextGen Style) */}
        <section className="mt-20">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="glass-card-nextgen group relative p-6 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-br ${stat.glowColor} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-display text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                        {stat.value}
                      </div>
                      <div className="text-xs font-semibold text-[var(--text-secondary)]">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-xs leading-relaxed text-[var(--text-tertiary)]">
                    {stat.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* The Core Pillars Section */}
        <section className="mt-24">
          <div className="text-center">
            <span className="badge-pill">
              <TrendingUp className="h-3 w-3" />
              <span>Architectural Rigor</span>
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
              Why IdeaPulse Is Built Differently
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-[var(--text-secondary)]">
              Traditional voting sites are vulnerable to bots, paid promotion, and popularity
              contests. Here is how our architecture restores authenticity.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {corePillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div key={i} className="glass-card-nextgen flex flex-col justify-between p-6">
                  <div>
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] border bg-gradient-to-br ${pillar.boxBg} shadow-sm`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 font-display text-base font-bold text-[var(--text-primary)]">
                      {pillar.title}
                    </h3>
                    <p className="mt-2.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {pillar.desc}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-1 text-[11px] font-semibold text-[var(--indigo-bright)]">
                    <span>Enforced at DB Layer</span>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Mission & Story Box */}
        <section className="mt-24">
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-2)] p-8 backdrop-blur-[var(--blur-md)] sm:p-12">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
              style={{
                background:
                  'linear-gradient(90deg, transparent, var(--edge-specular), transparent)',
              }}
            />
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <span className="badge-pill">Our Mission</span>
                <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                  Turning Community Spark Into Verified Reality
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                  Great ideas exist everywhere, but distribution and validation are heavily
                  gatekept. We created IdeaPulse so any thinker, engineer, designer, or creator can
                  pitch their vision to a verified community.
                </p>
                <div className="mt-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cyan-bright)]" />
                    <span className="text-xs text-[var(--text-secondary)]">
                      <strong>Zero Pay-to-Win:</strong> Votes cannot be bought, sponsored, or
                      boosted.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cyan-bright)]" />
                    <span className="text-xs text-[var(--text-secondary)]">
                      <strong>7-Day Incubation Cycles:</strong> Fast-paced weekly cycles keep
                      momentum high and focus sharp.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cyan-bright)]" />
                    <span className="text-xs text-[var(--text-secondary)]">
                      <strong>Verifiable Hall of Fame:</strong> Winning ideas earn permanent
                      accolades and grants.
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center lg:col-span-5">
                <div className="relative w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--border-accent)] bg-gradient-to-br from-[var(--surface-3)] to-[var(--surface-1)] p-6 shadow-[var(--glow-indigo-md)]">
                  <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--indigo)] to-[var(--violet)] text-white shadow-lg">
                      <Sparkles className="h-7 w-7" />
                    </div>
                    <h4 className="mt-4 font-display text-lg font-bold text-[var(--text-primary)]">
                      Ready to share your idea?
                    </h4>
                    <p className="mt-2 text-xs text-[var(--text-secondary)]">
                      Join hundreds of innovators in the current active cycle.
                    </p>
                    <Link
                      href="/submit"
                      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-accent)] bg-[var(--indigo)] py-2.5 text-xs font-semibold text-white shadow-[var(--glow-indigo-sm)] transition-all hover:bg-[var(--indigo-bright)]"
                    >
                      <span>Submit Proposal</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
