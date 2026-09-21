import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Account Confirmed — IdeaPulse',
  description:
    'Your IdeaPulse account is confirmed. Start discovering and voting on product ideas.',
};

export default function ConfirmPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg">
        <div
          className="border-border-default bg-surface-2 rounded-2xl border p-8 text-center shadow-glass backdrop-blur-md sm:p-10"
          style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
        >
          {/* Status badge / icon */}
          <div className="bg-tint-success text-success shadow-glow-success-sm mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
            <CheckCircle className="h-8 w-8" />
          </div>

          <span className="border-tint-success bg-tint-success text-success inline-flex items-center gap-1.5 rounded-xs border px-2.5 py-1 text-xs font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified Account
          </span>

          <h1 className="text-text-primary mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            You&apos;re ready to vote
          </h1>

          <p className="text-text-secondary mt-3 text-sm leading-relaxed">
            Your email is confirmed and your account is active. You have{' '}
            <span className="font-semibold text-cyan">5 votes</span> ready for today. Every vote
            directly shapes the weekly cycle rankings and creator rewards.
          </p>

          <div className="border-border-subtle bg-surface-1 mt-8 rounded-xl border p-4 text-left">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-indigo" />
              <div>
                <h2 className="text-text-primary text-xs font-semibold uppercase tracking-wider">
                  How voting works
                </h2>
                <p className="text-text-secondary mt-1 text-xs leading-relaxed">
                  Votes reset on a rolling 24-hour window from the moment you cast them. You can
                  also submit one product idea per weekly cycle.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/feed"
              className="text-text-primary shadow-glow-indigo-sm inline-flex items-center justify-center gap-2 rounded-md bg-indigo px-6 py-3 text-sm font-medium transition-all hover:bg-indigo-bright active:bg-indigo-deep"
            >
              <span>Explore Active Cycle</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/settings"
              className="border-border-default bg-surface-3 text-text-primary hover:border-border-strong hover:bg-surface-4 inline-flex items-center justify-center rounded-md border px-5 py-3 text-sm font-medium transition"
            >
              Customize Profile
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
