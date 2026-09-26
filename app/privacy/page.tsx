import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, EyeOff, FileText, ArrowLeft, RefreshCw, Database } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — IdeaPulse',
  description:
    'IdeaPulse privacy commitments: zero raw IP storage, cryptographic salted hashing, private vote ledger, and user data rights.',
};

export default function PrivacyPage() {
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
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Cryptographic Privacy · Invariant BR-035</span>
          </div>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-base text-[var(--text-secondary)] sm:text-lg">
            Effective Date: September 2026 · Protocol Version 1.0
          </p>
        </div>

        {/* Content Panels */}
        <div className="space-y-8 text-sm leading-relaxed text-[var(--text-secondary)]">
          {/* Section 1: Core Tenets */}
          <section
            className="glass-panel rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)] sm:p-8"
            style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-accent)] bg-[rgba(99,102,241,0.1)] text-[var(--indigo-bright)]">
                <Lock className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
                1. Our Cryptographic Privacy Guarantee
              </h2>
            </div>
            <div className="mt-4 space-y-3">
              <p>
                IdeaPulse is built on a foundational architectural principle:{' '}
                <strong>privacy through mathematics</strong>. We believe community governance
                thrives when participants can express genuine sentiment without fear of coercion,
                retribution, or surveillance.
              </p>
              <ul className="list-disc space-y-2 pl-5 text-[var(--text-secondary)]">
                <li>
                  <strong>Zero Raw IP Retention (BR-035):</strong> We never persist raw IP addresses
                  in any database table. Incoming requests are hashed immediately using a
                  cryptographically generated daily rotating salt:
                  <code className="ml-1 text-[var(--cyan-bright)]">sha256(ip || daily_salt)</code>.
                  When the salt rotates at midnight UTC, past IP hashes can never be reversed or
                  joined across days.
                </li>
                <li>
                  <strong>Private Vote Ledger (ADR-006):</strong> Your vote allocations are private.
                  Row Level Security (RLS) denies all queries attempting to read another user&apos;s
                  vote history. The <code className="text-[var(--cyan-bright)]">votes</code> table
                  is strictly omitted from Supabase Realtime feeds to prevent live transaction
                  eavesdropping.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2: Data We Collect */}
          <section
            className="glass-panel rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)] sm:p-8"
            style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-[var(--cyan-bright)]">
                <Database className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
                2. Information Collected & Visibility
              </h2>
            </div>
            <div className="mt-4 space-y-3">
              <p>We classify all information strictly by visibility tier:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-[var(--border-subtle)] font-mono uppercase text-[var(--text-tertiary)]">
                    <tr>
                      <th className="px-3 py-2.5">Data Point</th>
                      <th className="px-3 py-2.5">Visibility</th>
                      <th className="px-3 py-2.5">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    <tr>
                      <td className="px-3 py-3 font-semibold text-[var(--text-primary)]">
                        Username & Bio
                      </td>
                      <td className="px-3 py-3 text-emerald-400">Public</td>
                      <td className="px-3 py-3">
                        Attribution of proposals and public founder profile.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 font-semibold text-[var(--text-primary)]">
                        Idea Proposals
                      </td>
                      <td className="px-3 py-3 text-emerald-400">Public</td>
                      <td className="px-3 py-3">
                        Community voting, leaderboards, and incubator evaluation.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 font-semibold text-[var(--text-primary)]">
                        Email Address
                      </td>
                      <td className="px-3 py-3 text-amber-400">Private (Owner Only)</td>
                      <td className="px-3 py-3">
                        Account recovery, magic links, and critical security notices.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 font-semibold text-[var(--text-primary)]">
                        Vote Ledger Records
                      </td>
                      <td className="px-3 py-3 text-violet-400">Strictly Private (RLS)</td>
                      <td className="px-3 py-3">
                        Enforcing 5-vote rolling quota. Unreadable by other users.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 font-semibold text-[var(--text-primary)]">
                        Daily Salted IP Hash
                      </td>
                      <td className="px-3 py-3 text-violet-400">Ephemeral (Automated)</td>
                      <td className="px-3 py-3">
                        Rate limiting and bot cluster prevention. Purged daily.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 3: Cookies & Session Storage */}
          <section
            className="glass-panel rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)] sm:p-8"
            style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-[var(--violet-bright)]">
                <EyeOff className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
                3. Cookies and Tracking Technologies
              </h2>
            </div>
            <div className="mt-4 space-y-3">
              <p>
                We do not use third-party advertising cookies, marketing pixels, or invasive
                behavioral trackers. Our cookies serve essential authentication and security
                functions:
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  <strong>Session Cookies (`sb-*-auth-token`):</strong> Secure, HttpOnly,
                  SameSite=Lax tokens to keep you logged in.
                </li>
                <li>
                  <strong>Theme Preference:</strong> Local storage value maintaining your Dark or
                  Light UI mode preference.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4: Data Rights & Account Deletion */}
          <section
            className="glass-panel rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)] sm:p-8"
            style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-accent)] bg-[var(--surface-2)] text-[var(--indigo-bright)]">
                <RefreshCw className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
                4. Your Rights & Data Erasure
              </h2>
            </div>
            <div className="mt-4 space-y-3">
              <p>Under GDPR and CCPA, you retain full ownership of your personal data:</p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  <strong>Export:</strong> You may request an export of your profile and submitted
                  concepts anytime.
                </li>
                <li>
                  <strong>Deletion:</strong> You may request account deletion by emailing{' '}
                  <a
                    href="mailto:support@ideapulse.dev"
                    className="text-[var(--indigo-bright)] hover:underline"
                  >
                    support@ideapulse.dev
                  </a>
                  . Upon deletion, your personal profile is permanently scrubbed. Proposals in
                  finalized historical cycles remain archived pseudonymously to preserve
                  cryptographic consensus integrity.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5: Contact */}
          <section
            className="glass-panel rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)] sm:p-8"
            style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-accent)] bg-[var(--surface-2)] text-[var(--indigo-bright)]">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
                5. Privacy Inquiries & Support
              </h2>
            </div>
            <p className="mt-4">
              If you have any questions regarding cryptographic data handling, salt rotation
              schedules, or privacy policies, please reach out to our privacy stewards at:
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
