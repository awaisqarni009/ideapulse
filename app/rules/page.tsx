import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { RulesSearch } from '@/app/components/rules/rules-search';
import {
  ShieldCheck,
  BookOpen,
  Lock,
  AlertTriangle,
  Scale,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Protocol Rules & Enforcement Specification — IdeaPulse',
  description:
    'Authoritative business rules, anti-abuse invariants, and database-level enforcement mechanisms governing IdeaPulse cycles, voting, and rewards.',
};

function EnforcementBadge({ type }: { type: 'STRUCTURAL' | 'PROCEDURAL' | 'POLICY' | 'ADVISORY' }) {
  const styles = {
    STRUCTURAL: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    PROCEDURAL: 'border-cyan-500/30 bg-cyan-500/10 text-[var(--cyan-bright)]',
    POLICY: 'border-purple-500/30 bg-purple-500/10 text-[var(--violet-bright)]',
    ADVISORY: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px] font-semibold uppercase ${styles[type]}`}
    >
      {type}
    </span>
  );
}

export default function RulesPage() {
  return (
    <main className="min-h-[calc(100vh-64px)] py-12 sm:py-16">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header Title */}
        <div className="mb-10 text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[rgba(99,102,241,0.12)] px-3 py-1 text-xs font-semibold text-[var(--indigo-bright)]">
            <Scale className="h-3.5 w-3.5" />
            <span>RULES.md · Effective Cycle 1</span>
          </div>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-5xl">
            Protocol Rules & Invariants
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
            Every business rule in IdeaPulse is enforced natively in PostgreSQL via constraints,
            triggers, and Row Level Security. Client validation exists solely for instant user
            feedback.
          </p>
        </div>

        {/* Interactive Search & Quick Jump */}
        <RulesSearch />

        {/* Quick Nav / Table of Contents */}
        <div
          className="glass-panel mb-12 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)]"
          style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
        >
          <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            Rule Catalog Sections
          </h2>
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 md:grid-cols-3">
            <a
              href="#sec-identity"
              className="flex items-center gap-2 text-[var(--text-secondary)] transition-colors hover:text-[var(--indigo-bright)]"
            >
              <span className="font-mono text-xs text-[var(--text-tertiary)]">01.</span>
              <span>Identity & Eligibility</span>
            </a>
            <a
              href="#sec-voting"
              className="flex items-center gap-2 text-[var(--text-secondary)] transition-colors hover:text-[var(--indigo-bright)]"
            >
              <span className="font-mono text-xs text-[var(--text-tertiary)]">02.</span>
              <span>Voting Mechanics</span>
            </a>
            <a
              href="#sec-ideas"
              className="flex items-center gap-2 text-[var(--text-secondary)] transition-colors hover:text-[var(--indigo-bright)]"
            >
              <span className="font-mono text-xs text-[var(--text-tertiary)]">03.</span>
              <span>Idea Submission</span>
            </a>
            <a
              href="#sec-anticheat"
              className="flex items-center gap-2 text-[var(--text-secondary)] transition-colors hover:text-[var(--indigo-bright)]"
            >
              <span className="font-mono text-xs text-[var(--text-tertiary)]">04.</span>
              <span>Anti-Cheat & Trust</span>
            </a>
            <a
              href="#sec-cycles"
              className="flex items-center gap-2 text-[var(--text-secondary)] transition-colors hover:text-[var(--indigo-bright)]"
            >
              <span className="font-mono text-xs text-[var(--text-tertiary)]">05.</span>
              <span>Cycle Management</span>
            </a>
            <a
              href="#sec-rewards"
              className="flex items-center gap-2 text-[var(--text-secondary)] transition-colors hover:text-[var(--indigo-bright)]"
            >
              <span className="font-mono text-xs text-[var(--text-tertiary)]">06.</span>
              <span>Reward Qualification</span>
            </a>
            <a
              href="#sec-errors"
              className="flex items-center gap-2 text-[var(--text-secondary)] transition-colors hover:text-[var(--indigo-bright)]"
            >
              <span className="font-mono text-xs text-[var(--text-tertiary)]">07.</span>
              <span>Error Code Index</span>
            </a>
          </div>
        </div>

        {/* SECTION 1: Identity & Eligibility */}
        <section id="sec-identity" className="mb-14 scroll-mt-24">
          <div className="mb-6 border-b border-[var(--border-subtle)] pb-3">
            <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
              1. Identity & Eligibility
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Rules governing who can write to the protocol and when votes mature into verified
              status.
            </p>
          </div>

          <div className="space-y-6">
            {/* BR-001 */}
            <article
              id="BR-001"
              className="glass-panel scroll-mt-24 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)]"
              style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    BR-001
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-[var(--text-primary)]">
                    An account is required to write
                  </h3>
                </div>
                <EnforcementBadge type="POLICY" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                Reading proposals and leaderboards is open to everyone. Voting, submitting, and
                reporting require an authenticated account.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-tertiary)]">
                <span>
                  <strong>Error:</strong>{' '}
                  <code className="text-[var(--indigo-bright)]">IP_UNAUTHENTICATED</code>
                </span>
                <span>
                  <strong>Message:</strong> &ldquo;Sign in to vote.&rdquo;
                </span>
              </div>
            </article>

            {/* BR-002 */}
            <article
              id="BR-002"
              className="glass-panel scroll-mt-24 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)]"
              style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    BR-002
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-[var(--text-primary)]">
                    Email confirmation gates all writes
                  </h3>
                </div>
                <EnforcementBadge type="PROCEDURAL" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                An account must have a confirmed email before it can vote, submit, or report. This
                meaningfully raises the cost of automated sockpuppet creation.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-tertiary)]">
                <span>
                  <strong>Error:</strong>{' '}
                  <code className="text-[var(--indigo-bright)]">IP_ACCOUNT_NOT_WRITABLE</code>
                </span>
                <span>
                  <strong>Message:</strong> &ldquo;Confirm your email to start voting. Resend the
                  link →&rdquo;
                </span>
              </div>
            </article>

            {/* BR-003 */}
            <article
              id="BR-003"
              className="glass-panel scroll-mt-24 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)]"
              style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    BR-003
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-[var(--text-primary)]">
                    Votes become verified after 24 hours of account age
                  </h3>
                </div>
                <EnforcementBadge type="PROCEDURAL" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                A vote cast from an account under 24 hours old is recorded and displayed in total
                votes, but marked{' '}
                <code className="text-[var(--cyan-bright)]">is_verified = false</code>. Verification
                status is frozen at the moment of voting.
              </p>
              <div className="mt-4 border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-tertiary)]">
                <span>
                  <strong>Rationale:</strong> Sybil rings must be seeded at least a full day before
                  casting votes that affect reward qualification.
                </span>
              </div>
            </article>

            {/* BR-004 */}
            <article
              id="BR-004"
              className="glass-panel scroll-mt-24 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)]"
              style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    BR-004
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-[var(--text-primary)]">
                    Suspended accounts cannot write, and active votes are de-verified
                  </h3>
                </div>
                <EnforcementBadge type="PROCEDURAL" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                When an account is suspended, all votes in the currently active cycle flip to
                unverified and counters recompute. Finalized cycle records remain immutable.
              </p>
            </article>

            {/* BR-005 */}
            <article
              id="BR-005"
              className="glass-panel scroll-mt-24 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)]"
              style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    BR-005
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-[var(--text-primary)]">
                    Role escalation is impossible from the client
                  </h3>
                </div>
                <EnforcementBadge type="POLICY" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                Users cannot modify their own role, status, or system flags. Column grants restrict
                updates to display name, username, bio, and avatar.
              </p>
            </article>
          </div>
        </section>

        {/* SECTION 2: Voting */}
        <section id="sec-voting" className="mb-14 scroll-mt-24">
          <div className="mb-6 border-b border-[var(--border-subtle)] pb-3">
            <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
              2. Voting & Quota Mechanics
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Rules defining the rolling quota window, one-vote constraints, and retraction
              boundaries.
            </p>
          </div>

          <div className="space-y-6">
            {/* BR-010 */}
            <article
              id="BR-010"
              className="glass-panel scroll-mt-24 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)]"
              style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    BR-010
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-[var(--text-primary)]">
                    Five votes per rolling 24 hours
                  </h3>
                </div>
                <EnforcementBadge type="PROCEDURAL" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                A user may cast at most 5 votes in any rolling 24-hour window. The window is
                continuous and never resets at midnight. The unlock timestamp is precisely{' '}
                <code className="text-[var(--cyan-bright)]">min(created_at) + 24h</code>.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-tertiary)]">
                <span>
                  <strong>Error:</strong>{' '}
                  <code className="text-[var(--indigo-bright)]">IP_VOTE_QUOTA</code>
                </span>
                <span>
                  <strong>Message:</strong> &ldquo;You&apos;ve used all 5 votes. Your next vote
                  unlocks in &#123;duration&#125;.&rdquo;
                </span>
              </div>
            </article>

            {/* BR-011 */}
            <article
              id="BR-011"
              className="glass-panel scroll-mt-24 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)]"
              style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    BR-011
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-[var(--text-primary)]">
                    One vote per user per idea, permanently
                  </h3>
                </div>
                <EnforcementBadge type="STRUCTURAL" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                Enforced by a Postgres{' '}
                <code className="text-blue-400">UNIQUE (idea_id, voter_id)</code> constraint on the
                votes ledger. Retracting does not restore the ability to vote on that idea again.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-tertiary)]">
                <span>
                  <strong>Error:</strong>{' '}
                  <code className="text-[var(--indigo-bright)]">IP_DUPLICATE_VOTE</code>
                </span>
                <span>
                  <strong>Message:</strong> &ldquo;You&apos;ve already voted on this idea.&rdquo;
                </span>
              </div>
            </article>

            {/* BR-012 */}
            <article
              id="BR-012"
              className="glass-panel scroll-mt-24 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)]"
              style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    BR-012
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-[var(--text-primary)]">
                    Self-voting is strictly forbidden
                  </h3>
                </div>
                <EnforcementBadge type="STRUCTURAL" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                Enforced structurally via{' '}
                <code className="text-blue-400">CHECK (voter_id &lt;&gt; idea_author_id)</code>{' '}
                backed by composite foreign key
                <code className="text-blue-400">
                  {' '}
                  (idea_id, idea_author_id) &rarr; ideas(id, author_id)
                </code>
                .
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-tertiary)]">
                <span>
                  <strong>Error:</strong>{' '}
                  <code className="text-[var(--indigo-bright)]">IP_SELF_VOTE</code>
                </span>
                <span>
                  <strong>Message:</strong> &ldquo;You can&apos;t vote on your own idea.&rdquo;
                </span>
              </div>
            </article>

            {/* BR-013 */}
            <article
              id="BR-013"
              className="glass-panel scroll-mt-24 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)]"
              style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    BR-013
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-[var(--text-primary)]">
                    Votes cannot be cast on non-published ideas
                  </h3>
                </div>
                <EnforcementBadge type="POLICY" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                Proposals in withdrawn, under-review, or removed states are closed to voting.
              </p>
              <div className="mt-4 border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-tertiary)]">
                <span>
                  <strong>Error:</strong>{' '}
                  <code className="text-[var(--indigo-bright)]">IP_IDEA_CLOSED</code>
                </span>
              </div>
            </article>

            {/* BR-014 */}
            <article
              id="BR-014"
              className="glass-panel scroll-mt-24 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)]"
              style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    BR-014
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-[var(--text-primary)]">
                    Retraction has a 10-minute window and never refunds quota
                  </h3>
                </div>
                <EnforcementBadge type="PROCEDURAL" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                A vote may be retracted within 10 minutes to resolve honest misclicks. The slot
                consumed remains occupied for the full 24 hours to prevent vote-shuttling exploits.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-tertiary)]">
                <span>
                  <strong>Error:</strong>{' '}
                  <code className="text-[var(--indigo-bright)]">IP_RETRACTION_WINDOW_CLOSED</code>
                </span>
                <span>
                  <strong>Message:</strong> &ldquo;Votes can only be taken back within 10
                  minutes.&rdquo;
                </span>
              </div>
            </article>

            {/* BR-017 */}
            <article
              id="BR-017"
              className="glass-panel scroll-mt-24 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)]"
              style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    BR-017
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-[var(--text-primary)]">
                    The vote ledger is append-only and strictly private
                  </h3>
                </div>
                <EnforcementBadge type="POLICY" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                No user can see what another user voted for. The{' '}
                <code className="text-[var(--indigo-bright)]">votes</code> table is excluded from
                Realtime publications to eliminate collusion and vote trading.
              </p>
            </article>
          </div>
        </section>

        {/* SECTION 3: Idea Submission */}
        <section id="sec-ideas" className="mb-14 scroll-mt-24">
          <div className="mb-6 border-b border-[var(--border-subtle)] pb-3">
            <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
              3. Idea Submission & Lifecycle
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Limits on submissions, immutability upon first vote, and withdrawal rules.
            </p>
          </div>

          <div className="space-y-6">
            {/* BR-020 */}
            <article
              id="BR-020"
              className="glass-panel scroll-mt-24 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)]"
              style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    BR-020
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-[var(--text-primary)]">
                    One idea per rolling 7 days
                  </h3>
                </div>
                <EnforcementBadge type="PROCEDURAL" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                A user may publish one idea per rolling 168-hour window. This ensures high-signal
                concepts and prevents spamming.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-tertiary)]">
                <span>
                  <strong>Error:</strong>{' '}
                  <code className="text-[var(--indigo-bright)]">IP_SUBMIT_COOLDOWN</code>
                </span>
                <span>
                  <strong>Message:</strong> &ldquo;You&apos;ve used this week&apos;s submission.
                  Your next slot opens &#123;datetime&#125;.&rdquo;
                </span>
              </div>
            </article>

            {/* BR-021 */}
            <article
              id="BR-021"
              className="glass-panel scroll-mt-24 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)]"
              style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    BR-021
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-[var(--text-primary)]">
                    Content bounds are enforced in PostgreSQL
                  </h3>
                </div>
                <EnforcementBadge type="STRUCTURAL" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                Title (10–120 chars), Summary (40–280 chars), Body (100–5,000 chars), Tags (0–5
                items), and exactly 1 allowed category.
              </p>
              <div className="mt-4 border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-tertiary)]">
                <span>
                  <strong>Error:</strong>{' '}
                  <code className="text-[var(--indigo-bright)]">IP_VALIDATION</code>
                </span>
              </div>
            </article>

            {/* BR-022 */}
            <article
              id="BR-022"
              className="glass-panel scroll-mt-24 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)]"
              style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    BR-022
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-[var(--text-primary)]">
                    An idea locks upon receiving its first vote
                  </h3>
                </div>
                <EnforcementBadge type="PROCEDURAL" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                Once an idea receives a vote, its title, summary, and body become immutable so an
                author cannot change what voters supported.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-tertiary)]">
                <span>
                  <strong>Error:</strong>{' '}
                  <code className="text-[var(--indigo-bright)]">IP_IDEA_LOCKED</code>
                </span>
                <span>
                  <strong>Message:</strong> &ldquo;This idea is locked because people have already
                  voted on it.&rdquo;
                </span>
              </div>
            </article>
          </div>
        </section>

        {/* SECTION 4: Anti-Cheat & Integrity */}
        <section id="sec-anticheat" className="mb-14 scroll-mt-24">
          <div className="mb-6 border-b border-[var(--border-subtle)] pb-3">
            <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
              4. Anti-Cheat & Operational Integrity
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Multi-layered security preventing duplicate submissions, vote farming, and concurrency
              races.
            </p>
          </div>

          <div className="space-y-6">
            {/* BR-030 */}
            <article
              id="BR-030"
              className="glass-panel scroll-mt-24 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)]"
              style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    BR-030
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-[var(--text-primary)]">
                    Layered multi-barrier enforcement
                  </h3>
                </div>
                <EnforcementBadge type="STRUCTURAL" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                Every abuse vector is blocked at 2 or more layers (Postgres constraint, trigger/RPC
                function, RLS policy). A single layer failing never creates an exploit.
              </p>
            </article>

            {/* BR-031 */}
            <article
              id="BR-031"
              className="glass-panel scroll-mt-24 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)]"
              style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    BR-031
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-[var(--text-primary)]">
                    Advisory locks serialize concurrent requests
                  </h3>
                </div>
                <EnforcementBadge type="PROCEDURAL" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                Concurrent vote requests are serialized by transactional advisory locks on the voter
                ID, making it mathematically impossible to cast over-quota votes via parallel race
                conditions.
              </p>
            </article>

            {/* BR-035 */}
            <article
              id="BR-035"
              className="glass-panel scroll-mt-24 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)]"
              style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    BR-035
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-[var(--text-primary)]">
                    Zero raw IP storage
                  </h3>
                </div>
                <EnforcementBadge type="PROCEDURAL" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                Only salted hashes (
                <code className="text-[var(--cyan-bright)]">sha256(ip || daily_salt)</code>) are
                stored, with daily rotating salts. No user can be tracked across days by IP.
              </p>
            </article>
          </div>
        </section>

        {/* SECTION 5: Cycles & Rewards */}
        <section id="sec-rewards" className="mb-14 scroll-mt-24">
          <div className="mb-6 border-b border-[var(--border-subtle)] pb-3">
            <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
              5. Qualification & Rewards
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Deterministic scoring, threshold criteria, and tie-breaking algorithms.
            </p>
          </div>

          <div className="space-y-6">
            {/* BR-045 */}
            <article
              id="BR-045"
              className="glass-panel scroll-mt-24 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)]"
              style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    BR-045
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-[var(--text-primary)]">
                    Qualification requires 50 verified votes
                  </h3>
                </div>
                <EnforcementBadge type="PROCEDURAL" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                Proposals must reach the cycle threshold (default 50 verified votes) before cycle
                close to qualify for rewards.
              </p>
            </article>

            {/* BR-046 */}
            <article
              id="BR-046"
              className="glass-panel scroll-mt-24 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)]"
              style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    BR-046
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-[var(--text-primary)]">
                    Ranking and deterministic tie-breaking
                  </h3>
                </div>
                <EnforcementBadge type="PROCEDURAL" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                Qualifying proposals are ranked by: 1){' '}
                <code className="text-[var(--cyan-bright)]">verified_vote_count</code> descending;
                2) <code className="text-[var(--cyan-bright)]">qualified_at</code> ascending
                (momentum tie-break); 3){' '}
                <code className="text-[var(--cyan-bright)]">created_at</code> ascending.
              </p>
            </article>

            {/* BR-047 */}
            <article
              id="BR-047"
              className="glass-panel scroll-mt-24 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)]"
              style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    BR-047
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-[var(--text-primary)]">
                    Finalized cycle results are immutable
                  </h3>
                </div>
                <EnforcementBadge type="STRUCTURAL" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                Once closed, rewards and ranks are permanently frozen. The protocol never silently
                rewrites historical standings.
              </p>
            </article>
          </div>
        </section>

        {/* SECTION 6: Error Code Reference Table */}
        <section id="sec-errors" className="mb-14 scroll-mt-24">
          <div className="mb-6 border-b border-[var(--border-subtle)] pb-3">
            <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
              6. Error Code Reference
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Every rejection maps to an explicit error code and links directly to its governing
              rule.
            </p>
          </div>

          <div
            className="glass-panel overflow-x-auto rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] backdrop-blur-[var(--blur-md)]"
            style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
          >
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-2)] font-mono text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-5 py-3.5">Error Code</th>
                  <th className="px-5 py-3.5">HTTP</th>
                  <th className="px-5 py-3.5">Governing Rule</th>
                  <th className="px-5 py-3.5">User Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                <tr className="transition-colors hover:bg-[var(--surface-2)]">
                  <td className="px-5 py-4 font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    IP_UNAUTHENTICATED
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-[var(--text-tertiary)]">401</td>
                  <td className="px-5 py-4">
                    <a
                      href="#BR-001"
                      className="font-mono text-xs text-[var(--indigo-bright)] hover:underline"
                    >
                      BR-001
                    </a>
                  </td>
                  <td className="px-5 py-4 text-xs text-[var(--text-secondary)]">
                    Sign in to vote.
                  </td>
                </tr>
                <tr className="transition-colors hover:bg-[var(--surface-2)]">
                  <td className="px-5 py-4 font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    IP_ACCOUNT_NOT_WRITABLE
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-[var(--text-tertiary)]">403</td>
                  <td className="px-5 py-4">
                    <a
                      href="#BR-002"
                      className="font-mono text-xs text-[var(--indigo-bright)] hover:underline"
                    >
                      BR-002
                    </a>
                  </td>
                  <td className="px-5 py-4 text-xs text-[var(--text-secondary)]">
                    Confirm your email to start voting.
                  </td>
                </tr>
                <tr className="transition-colors hover:bg-[var(--surface-2)]">
                  <td className="px-5 py-4 font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    IP_SELF_VOTE
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-[var(--text-tertiary)]">403</td>
                  <td className="px-5 py-4">
                    <a
                      href="#BR-012"
                      className="font-mono text-xs text-[var(--indigo-bright)] hover:underline"
                    >
                      BR-012
                    </a>
                  </td>
                  <td className="px-5 py-4 text-xs text-[var(--text-secondary)]">
                    You can&apos;t vote on your own idea.
                  </td>
                </tr>
                <tr className="transition-colors hover:bg-[var(--surface-2)]">
                  <td className="px-5 py-4 font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    IP_DUPLICATE_VOTE
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-[var(--text-tertiary)]">409</td>
                  <td className="px-5 py-4">
                    <a
                      href="#BR-011"
                      className="font-mono text-xs text-[var(--indigo-bright)] hover:underline"
                    >
                      BR-011
                    </a>
                  </td>
                  <td className="px-5 py-4 text-xs text-[var(--text-secondary)]">
                    You&apos;ve already voted on this idea.
                  </td>
                </tr>
                <tr className="transition-colors hover:bg-[var(--surface-2)]">
                  <td className="px-5 py-4 font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    IP_VOTE_QUOTA
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-[var(--text-tertiary)]">429</td>
                  <td className="px-5 py-4">
                    <a
                      href="#BR-010"
                      className="font-mono text-xs text-[var(--indigo-bright)] hover:underline"
                    >
                      BR-010
                    </a>
                  </td>
                  <td className="px-5 py-4 text-xs text-[var(--text-secondary)]">
                    You&apos;ve used all 5 votes. Next unlocks in &#123;duration&#125;.
                  </td>
                </tr>
                <tr className="transition-colors hover:bg-[var(--surface-2)]">
                  <td className="px-5 py-4 font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    IP_SUBMIT_COOLDOWN
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-[var(--text-tertiary)]">429</td>
                  <td className="px-5 py-4">
                    <a
                      href="#BR-020"
                      className="font-mono text-xs text-[var(--indigo-bright)] hover:underline"
                    >
                      BR-020
                    </a>
                  </td>
                  <td className="px-5 py-4 text-xs text-[var(--text-secondary)]">
                    Next slot opens in &#123;datetime&#125;.
                  </td>
                </tr>
                <tr className="transition-colors hover:bg-[var(--surface-2)]">
                  <td className="px-5 py-4 font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    IP_IDEA_CLOSED
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-[var(--text-tertiary)]">409</td>
                  <td className="px-5 py-4">
                    <a
                      href="#BR-013"
                      className="font-mono text-xs text-[var(--indigo-bright)] hover:underline"
                    >
                      BR-013
                    </a>
                  </td>
                  <td className="px-5 py-4 text-xs text-[var(--text-secondary)]">
                    Voting is closed on this idea.
                  </td>
                </tr>
                <tr className="transition-colors hover:bg-[var(--surface-2)]">
                  <td className="px-5 py-4 font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    IP_IDEA_LOCKED
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-[var(--text-tertiary)]">409</td>
                  <td className="px-5 py-4">
                    <a
                      href="#BR-022"
                      className="font-mono text-xs text-[var(--indigo-bright)] hover:underline"
                    >
                      BR-022
                    </a>
                  </td>
                  <td className="px-5 py-4 text-xs text-[var(--text-secondary)]">
                    This idea is locked because people have voted on it.
                  </td>
                </tr>
                <tr className="transition-colors hover:bg-[var(--surface-2)]">
                  <td className="px-5 py-4 font-mono text-xs font-bold text-[var(--indigo-bright)]">
                    IP_RETRACTION_WINDOW_CLOSED
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-[var(--text-tertiary)]">409</td>
                  <td className="px-5 py-4">
                    <a
                      href="#BR-014"
                      className="font-mono text-xs text-[var(--indigo-bright)] hover:underline"
                    >
                      BR-014
                    </a>
                  </td>
                  <td className="px-5 py-4 text-xs text-[var(--text-secondary)]">
                    Votes can only be taken back within 10 minutes.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
