import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Scale, CheckCircle2, AlertOctagon, Trophy, ShieldAlert, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service & Incubation — IdeaPulse',
  description:
    'Terms of service, community participation standards, anti-abuse policies, and reward qualification rules for IdeaPulse.',
};

export default function TermsPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-[calc(100vh-64px)] py-12 focus:outline-none sm:py-16"
    >
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Feed</span>
        </Link>

        {/* Header */}
        <div className="mb-12 mt-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[rgba(99,102,241,0.12)] px-3 py-1 text-xs font-semibold text-[var(--indigo-bright)]">
            <Scale className="h-3.5 w-3.5" />
            <span>Community Agreement · Effective Cycle 1</span>
          </div>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-5xl">
            Terms of Incubation
          </h1>
          <p className="mt-3 text-base text-[var(--text-secondary)] sm:text-lg">
            By participating in IdeaPulse voting, proposals, or community reviews, you agree to
            these terms.
          </p>
        </div>

        {/* Content Panels */}
        <div className="space-y-8 text-sm leading-relaxed text-[var(--text-secondary)]">
          {/* Section 1: Overview */}
          <section
            className="glass-panel rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)] sm:p-8"
            style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
          >
            <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
              1. Platform Governance & Philosophy
            </h2>
            <p className="mt-3">
              IdeaPulse is a meritocratic incubator where community voting determines which product
              proposals advance to grant reviews and accelerator attention. All rules are specified
              in{' '}
              <Link href="/rules" className="text-[var(--indigo-bright)] hover:underline">
                RULES.md
              </Link>{' '}
              and enforced natively via PostgreSQL transactions, constraints, and Row Level
              Security.
            </p>
          </section>

          {/* Section 2: Prohibited Conduct & Anti-Sybil */}
          <section
            className="glass-panel rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)] sm:p-8"
            style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
                <AlertOctagon className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
                2. Anti-Sybil Standards & Prohibited Conduct
              </h2>
            </div>
            <div className="mt-4 space-y-3">
              <p>
                The following practices violate platform integrity and result in immediate account
                suspension and vote invalidation:
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong>Sybil Farming & Sockpuppets:</strong> Registering multiple accounts to
                  circumvent the 5-vote rolling 24h quota (BR-010).
                </li>
                <li>
                  <strong>Vote Trading & Bribery:</strong> Offering financial compensation,
                  reciprocal votes, or external rewards in exchange for votes.
                </li>
                <li>
                  <strong>Self-Voting & Proxy Voting:</strong> Voting on your own submission,
                  directly or via affiliated sockpuppet accounts (BR-012).
                </li>
                <li>
                  <strong>Content Piracy & Plagiarism:</strong> Submitting intellectual property,
                  trademarks, or proprietary concepts belonging to third parties without
                  authorization.
                </li>
              </ul>
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-300">
                <strong>Enforcement (BR-004):</strong> When an account is suspended, all active
                cycle votes cast by that account are permanently de-verified (
                <code className="text-red-200">is_verified = false</code>), and idea vote counters
                automatically re-sync.
              </div>
            </div>
          </section>

          {/* Section 3: Cycle Rules & Reward Finality */}
          <section
            className="glass-panel rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)] sm:p-8"
            style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-accent)] bg-[rgba(99,102,241,0.1)] text-[var(--indigo-bright)]">
                <Trophy className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
                3. Cycle Lifecycles, Thresholds, & Finality
              </h2>
            </div>
            <div className="mt-4 space-y-3">
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong>Weekly Incubation Cycles:</strong> Cycles rotate automatically every 7
                  days (Sundays at 23:59:59 UTC).
                </li>
                <li>
                  <strong>Verified Vote Qualification:</strong> Proposals must reach the cycle
                  qualification threshold (50 verified votes) during an active cycle to qualify for
                  incubator rewards (BR-045).
                </li>
                <li>
                  <strong>Immutable Finality (BR-047):</strong> Once a cycle closes and ranks are
                  recorded, finalized results cannot be modified or recomputed. Historical records
                  remain permanent.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4: Content Licensing */}
          <section
            className="glass-panel rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)] sm:p-8"
            style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
          >
            <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
              4. Intellectual Property & Content License
            </h2>
            <div className="mt-4 space-y-3">
              <p>
                <strong>You retain 100% ownership</strong> of your ideas, proposals, and project
                specifications. By submitting an idea to IdeaPulse, you grant IdeaPulse a
                non-exclusive, worldwide, royalty-free license to display, index, distribute, and
                format your submission for public voting and platform curation.
              </p>
              <p>
                Once an idea receives its first vote, its content fields lock (BR-022) to prevent
                bait-and-switch modifications after community members have cast their votes.
              </p>
            </div>
          </section>

          {/* Section 5: Limitation of Liability */}
          <section
            className="glass-panel rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)] sm:p-8"
            style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
          >
            <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
              5. Disclaimer of Warranties & Limitation of Liability
            </h2>
            <p className="mt-3">
              IdeaPulse is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis.
              We make no warranty that winning or qualifying an idea in an incubation cycle
              guarantees external funding, investment, or commercial success. We disclaim all
              liability for damages arising from network interruptions or protocol events.
            </p>
          </section>

          {/* Section 6: Inquiries */}
          <section
            className="glass-panel rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)] sm:p-8"
            style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
          >
            <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
              6. Governance Questions & Legal Contact
            </h2>
            <p className="mt-3">
              For terms clarifications, dispute arbitration, or legal notices, contact our
              compliance team:
            </p>
            <p className="mt-2 font-mono text-sm text-[var(--indigo-bright)]">
              support@ideapulse.dev
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
