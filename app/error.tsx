'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * 500 Error Boundary per DESIGN.md §7 and TASKS.md [T-7.10]
 * Formatted with deep canvas, L3 glass card, specular edge highlight,
 * error digest code, recovery action, and protocol rules link.
 */
export default function GlobalErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('IdeaPulse Application Error:', error);
  }, [error]);

  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4 sm:p-6">
      <div
        role="alert"
        className="glass-panel relative w-full max-w-lg rounded-[var(--radius-xl)] border border-[rgba(239,68,68,0.3)] bg-[var(--surface-3)] p-8 text-center shadow-2xl backdrop-blur-[var(--blur-lg)] sm:p-12"
        style={{
          boxShadow: 'inset 0 1px 0 var(--edge-specular), 0 20px 48px -12px rgba(0, 0, 0, 0.58)',
        }}
      >
        {/* Specular Highlight Top Edge */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[var(--radius-xl)] shadow-[inset_0_1px_0_var(--edge-specular)]"
          aria-hidden="true"
        />

        {/* 56px Icon Glyph */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] text-[var(--accent-danger)] shadow-[var(--glow-danger-md)]">
          <AlertOctagon className="h-8 w-8 stroke-[1.5]" />
        </div>

        <div className="mt-6 font-display text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
          System Interruption
        </div>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]">
          An unexpected error occurred while processing this request. Your data and vote ledger
          remain secure.
        </p>

        {/* Error Digest Code */}
        {error?.digest && (
          <div className="mt-4 inline-block rounded-[var(--radius-xs)] border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-1 font-mono text-[11px] text-[var(--text-tertiary)]">
            Reference ID: {error.digest}
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="btn btn-primary inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] px-5 py-2.5 text-xs font-semibold text-white shadow-[var(--glow-indigo-sm)] transition-all hover:shadow-[var(--glow-indigo-md)] sm:w-auto"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="btn inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-2)] px-5 py-2.5 text-xs font-semibold text-[var(--text-primary)] transition-all hover:border-[var(--border-strong)] hover:bg-[var(--surface-3)] sm:w-auto"
          >
            <Home className="h-4 w-4" />
            <span>Return Home</span>
          </Link>
        </div>

        <div className="mt-8 border-t border-[var(--border-subtle)] pt-4 text-xs text-[var(--text-tertiary)]">
          Need assistance? Check our{' '}
          <Link href="/rules" className="text-[var(--indigo-bright)] underline hover:text-white">
            protocol rules
          </Link>{' '}
          or contact support.
        </div>
      </div>
    </main>
  );
}
