'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Github,
  Twitter,
  Disc as Discord,
  ShieldCheck,
  Mail,
  ArrowUpRight,
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-[var(--border-subtle)] bg-[var(--surface-1)] backdrop-blur-[var(--blur-md)] transition-colors duration-300">
      {/* Specular Edge Highlight */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, var(--edge-specular) 50%, transparent 100%)',
        }}
      />

      <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="group inline-flex items-center gap-2.5 text-base font-bold tracking-tight text-[var(--text-primary)]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-accent)] bg-gradient-to-br from-[var(--indigo)] to-[var(--violet)] shadow-[var(--glow-indigo-sm)] transition-transform group-hover:scale-105">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight">
                Idea<span className="text-[var(--cyan-bright)]">Pulse</span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]">
              Where the crowd decides which ideas deserve funding and attention. Anti-Sybil,
              community-governed incubation powered by verifiable consensus.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="IdeaPulse on GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-secondary)] transition-all hover:border-[var(--border-accent)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="IdeaPulse on Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-secondary)] transition-all hover:border-[var(--border-accent)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                aria-label="IdeaPulse Discord Community"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-secondary)] transition-all hover:border-[var(--border-accent)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
              >
                <Discord className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-1 text-xs text-[var(--text-tertiary)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>All Systems Operational • Live Consensus</span>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Platform
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-[var(--text-secondary)] transition-colors hover:text-[var(--indigo-bright)]"
                >
                  Live Feed
                </Link>
              </li>
              <li>
                <Link
                  href="/leaderboard"
                  className="text-[var(--text-secondary)] transition-colors hover:text-[var(--indigo-bright)]"
                >
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link
                  href="/submit"
                  className="text-[var(--text-secondary)] transition-colors hover:text-[var(--indigo-bright)]"
                >
                  Submit Proposal
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center gap-1 text-[var(--text-secondary)] transition-colors hover:text-[var(--indigo-bright)]"
                >
                  How It Works
                  <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Resources & Knowledge */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Resources
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-[var(--text-secondary)] transition-colors hover:text-[var(--indigo-bright)]"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-[var(--text-secondary)] transition-colors hover:text-[var(--indigo-bright)]"
                >
                  Frequently Asked
                </Link>
              </li>
              <li>
                <Link
                  href="/rules"
                  className="text-[var(--text-secondary)] transition-colors hover:text-[var(--indigo-bright)]"
                >
                  Incubation Rules
                </Link>
              </li>
              <li>
                <Link
                  href="/cycles/1"
                  className="text-[var(--text-secondary)] transition-colors hover:text-[var(--indigo-bright)]"
                >
                  Cycle Archives
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Security & Verification */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Trust & Integrity
            </h3>
            <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--cyan-bright)]">
                <ShieldCheck className="h-4 w-4" />
                <span>Anti-Sybil Protected</span>
              </div>
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                Votes and proposals require verified accounts and are immutable on our PostgreSQL
                consensus ledger.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                <Mail className="h-3 w-3 text-[var(--text-tertiary)]" />
                <span>support@ideapulse.dev</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--border-subtle)] pt-8 sm:flex-row">
          <p className="text-xs text-[var(--text-tertiary)]">
            &copy; {new Date().getFullYear()} IdeaPulse Incubator. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[var(--text-tertiary)]">
            <Link href="/privacy" className="transition-colors hover:text-[var(--text-secondary)]">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-[var(--text-secondary)]">
              Terms of Incubation
            </Link>
            <Link href="/about" className="transition-colors hover:text-[var(--text-secondary)]">
              Manifesto
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
