import React from 'react';
import Link from 'next/link';
import { Compass, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4 sm:p-6">
      <div
        role="alert"
        className="glass-panel relative w-full max-w-lg rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-3)] p-8 text-center shadow-2xl backdrop-blur-[var(--blur-lg)] sm:p-12"
        style={{
          boxShadow: 'inset 0 1px 0 var(--edge-specular), 0 20px 48px -12px rgba(0, 0, 0, 0.58)',
        }}
      >
        {/* Specular Highlight Top Edge */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[var(--radius-xl)] shadow-[inset_0_1px_0_var(--edge-specular)]"
          aria-hidden="true"
        />

        {/* 56px Icon Glyph per DESIGN.md §7.11 */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.1)] text-[var(--violet-bright)] shadow-[var(--glow-violet-sm)]">
          <Compass className="h-8 w-8 stroke-[1.5]" />
        </div>

        {/* 404 Display */}
        <div className="mt-6 font-display text-4xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-5xl">
          404
        </div>

        <h1 className="mt-2 font-display text-lg font-medium text-[var(--text-primary)]">
          Page Not Found
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]">
          The requested idea, cycle, or route does not exist or has been removed from the ledger.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="btn btn-primary inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] px-5 py-2.5 text-xs font-semibold text-white shadow-[var(--glow-indigo-sm)] transition-all hover:shadow-[var(--glow-indigo-md)] sm:w-auto"
          >
            <Home className="h-4 w-4" />
            <span>Return Home</span>
          </Link>

          <Link
            href="/feed"
            className="btn inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-2)] px-5 py-2.5 text-xs font-semibold text-[var(--text-primary)] transition-all hover:border-[var(--border-strong)] hover:bg-[var(--surface-3)] sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Browse Feed</span>
          </Link>
        </div>

        <div className="mt-8 border-t border-[var(--border-subtle)] pt-4 text-xs text-[var(--text-tertiary)]">
          Questions about removed content? Consult our{' '}
          <Link href="/rules" className="text-[var(--indigo-bright)] underline hover:text-white">
            protocol rules
          </Link>
          .
        </div>
      </div>
    </main>
  );
}
