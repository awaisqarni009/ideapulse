import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArticleZoomControls } from '@/app/components/ui/article-zoom-controls';
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
  ShoppingBag,
  Cpu,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'How It Works — IdeaPulse',
  description:
    'Understand the PulseWear streetwear drop lifecycle: from submitting concept proposals to rolling quotas, qualification thresholds, and weekly cycle sweeps.',
};

export default function HowItWorksPage() {
  const steps = [
    {
      step: '01',
      title: 'Submit Your Proposal',
      badge: '1 per Cycle Rule',
      desc: 'Designers, creators, and community members submit technical outerwear concepts, 500 GSM loopback cotton hoodies, and modular jacket prototypes for the next drop.',
      icon: Lightbulb,
      boxBg: 'from-amber-500/20 to-orange-600/20 border-amber-500/30 text-amber-400',
    },
    {
      step: '02',
      title: 'Cast Rolling Votes',
      badge: '5 Votes / 24h Quota',
      desc: 'Verified collective members receive a rolling quota of 5 votes every 24 hours. Vote for your favorite garment silhouettes, pocket configurations, and colorways.',
      icon: Vote,
      boxBg: 'from-indigo-500/20 to-purple-600/20 border-indigo-500/30 text-indigo-400',
    },
    {
      step: '03',
      title: 'Hit Qualification Threshold',
      badge: '5 Verified Votes',
      desc: 'When a garment design accumulates 5 verified human votes, it earns official Qualified status and locks its priority manufacturing timestamp.',
      icon: TrendingUp,
      boxBg: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/30 text-cyan-400',
    },
    {
      step: '04',
      title: 'Automated Cycle Finalization',
      badge: 'Weekly Drop Sweep',
      desc: 'At weekly cycle close, our automated engine tallies verified votes. The #1 ranked garment enters limited custom production, ready for priority member dispatch.',
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
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400 shadow-[var(--glow-indigo-sm)]">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>PULSEWEAR // DROP LIFECYCLE</span>
          </div>

          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
            How{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              PULSEWEAR
            </span>{' '}
            Drops Work
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            From 500 GSM loopback cotton milling to decentralized community voting and priority
            worldwide fulfillment. Here is how limited technical outerwear drops are brought to
            reality.
          </p>

          {/* Interactive Zoom In / Zoom Out Controls for Reading Article (Teacher Requirement) */}
          <div className="mt-8 flex justify-center">
            <ArticleZoomControls targetId="reading-article" />
          </div>
        </section>

        {/* 4 Steps Grid Article */}
        <article id="reading-article" className="transition-all duration-200">
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
                        <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-3)] px-2.5 py-0.5 text-[11px] font-semibold text-indigo-400">
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

          {/* Featured Velocity Tablet & Interactive Highlights */}
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
                      <TrendingUp className="h-3 w-3 text-cyan-400" />
                      <span>Textile Density Index</span>
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)]">500 GSM Heavyweight</span>
                  </div>

                  <div className="mt-6">
                    <div className="font-display text-5xl font-extrabold text-[var(--cyan-bright)]">
                      120%
                    </div>
                    <div className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
                      Greater Fabric Weight vs Standard 280 GSM Fleece
                    </div>
                  </div>

                  {/* Stylized Neon Bar Chart */}
                  <div className="mt-6 flex h-28 items-end gap-3 border-b border-[var(--border-subtle)] pb-2">
                    <div
                      className="h-[30%] w-full rounded-t-sm bg-slate-700/40 transition-all hover:bg-slate-600"
                      title="Fast Fashion 240 GSM"
                    />
                    <div
                      className="h-[45%] w-full rounded-t-sm bg-slate-700/60 transition-all hover:bg-slate-600"
                      title="Retail Average 280 GSM"
                    />
                    <div
                      className="bg-[var(--indigo)]/50 h-[60%] w-full rounded-t-sm transition-all hover:bg-[var(--indigo)]"
                      title="Mid-weight 350 GSM"
                    />
                    <div
                      className="h-[80%] w-full rounded-t-sm bg-[var(--cyan-bright)] shadow-[0_0_12px_rgba(6,182,212,0.5)] transition-all"
                      title="Technical 420 GSM"
                    />
                    <div
                      className="h-[95%] w-full rounded-t-sm bg-gradient-to-t from-[var(--indigo)] to-[var(--cyan-bright)] shadow-[0_0_16px_rgba(99,102,241,0.6)]"
                      title="PULSEWEAR 500 GSM"
                    />
                  </div>

                  {/* Status Badges */}
                  <div className="mt-6 space-y-2.5">
                    <div className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-2 text-xs">
                      <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <Clock className="h-3.5 w-3.5 text-amber-400" />
                        <span>Pre-Shrunk Cold Wash</span>
                      </span>
                      <span className="font-semibold text-emerald-400">0% Shrinkage</span>
                    </div>

                    <div className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-2 text-xs">
                      <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <ShieldCheck className="h-3.5 w-3.5 text-[var(--cyan-bright)]" />
                        <span>Weatherproof Shell</span>
                      </span>
                      <span className="font-semibold text-[var(--cyan-bright)]">20,000 MM</span>
                    </div>

                    <div className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-2 text-xs">
                      <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <Layers className="h-3.5 w-3.5 text-[var(--violet-bright)]" />
                        <span>Hardware Standard</span>
                      </span>
                      <span className="font-semibold text-[var(--violet-bright)]">
                        YKK Aquaguard
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Explanatory Content */}
              <div className="lg:col-span-6">
                <span className="badge-pill">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Textile Architecture & Integrity</span>
                </span>

                <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                  Engineered for Longevity, Never Fast Fashion
                </h2>

                <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                  Unlike mass-market polyester blends that pill, lose shape, and fray within a few
                  washes, PulseWear garments are constructed with structural architecture:
                </p>

                <div className="mt-6 space-y-4">
                  <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-4">
                    <div className="flex items-center gap-2 font-display text-sm font-bold text-[var(--text-primary)]">
                      <Lock className="h-4 w-4 text-indigo-400" />
                      <span>500 GSM Loopback French Terry Cotton</span>
                    </div>
                    <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
                      Custom dense knitting provides an architectural drape, erect double-lined
                      hood, and extreme thermal insulation without synthetic additives.
                    </p>
                  </div>

                  <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-4">
                    <div className="flex items-center gap-2 font-display text-sm font-bold text-[var(--text-primary)]">
                      <FileCode2 className="h-4 w-4 text-cyan-400" />
                      <span>20,000 MM Hydrostatic Rain Barrier</span>
                    </div>
                    <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
                      Tactical jackets feature monolithic waterproof membranes with sealed flatlock
                      seams to withstand torrential storms and gale-force wind chills.
                    </p>
                  </div>

                  <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-4">
                    <div className="flex items-center gap-2 font-display text-sm font-bold text-emerald-400">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Decentralized Community Drop Voting</span>
                    </div>
                    <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
                      Every drop is validated by real members through our bot-proof voting protocol.
                      Only the highest-conviction designs reach the manufacturing line.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-4">
                  <Link
                    href="/#catalog"
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-600/20 transition-all hover:brightness-110"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Shop The Drop Now</span>
                  </Link>
                  <Link
                    href="/faq"
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-2)] px-5 py-2.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <span>Read FAQ & Sizing Guide</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
