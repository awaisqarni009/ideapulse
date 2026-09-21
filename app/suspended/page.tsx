import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/user';
import { signOutAction } from '@/app/actions/auth';

export const metadata: Metadata = {
  title: 'Account Suspended — IdeaPulse',
  description: 'Your IdeaPulse account is currently suspended.',
};

export default async function SuspendedPage() {
  const { user, profile } = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const isSuspended =
    profile?.status === 'suspended' ||
    (profile?.suspended_until && new Date(profile.suspended_until) > new Date());

  // If user is not actually suspended, redirect back to feed
  if (!isSuspended) {
    redirect('/feed');
  }

  const suspendedUntilStr = profile?.suspended_until
    ? new Date(profile.suspended_until).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZoneName: 'short',
      })
    : 'Indefinite review';

  const reason =
    profile?.suspension_reason ||
    'Violation of IdeaPulse community trust & anti-gaming guidelines.';

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-panel relative w-full max-w-lg overflow-hidden rounded-xl p-8 text-center sm:p-10">
        {/* Glow accent */}
        <div className="bg-crimson/15 pointer-events-none absolute -top-24 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full blur-3xl" />

        {/* Badge */}
        <div className="border-crimson/30 bg-crimson/10 text-crimson mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border">
          <svg
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <h1 className="mb-2 font-display text-2xl font-bold tracking-tight text-ink-1 sm:text-3xl">
          Account Suspended
        </h1>
        <p className="mx-auto mb-8 max-w-md text-sm text-ink-2">
          Your write privileges (submitting and voting) have been paused by platform moderation.
        </p>

        {/* Details Box */}
        <div className="border-edge-subtle bg-surface-1 mb-8 space-y-4 rounded-lg border p-5 text-left">
          <div>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-3">
              Reason Given
            </span>
            <p className="text-sm leading-relaxed text-ink-1">{reason}</p>
          </div>

          <div className="border-edge-subtle border-t pt-3">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-3">
              Restoration Time
            </span>
            <p className="text-amber text-sm font-medium tabular-nums">{suspendedUntilStr}</p>
          </div>

          <div className="border-edge-subtle border-t pt-3 text-xs leading-relaxed text-ink-3">
            Per <strong className="text-ink-2">RULES.md BR-038</strong>, you may continue reading
            published ideas, tracking cycle leaderboards, and reviewing rewards while suspended.
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/feed"
            className="bg-surface-2 border-edge-subtle hover:bg-surface-3 inline-flex w-full items-center justify-center rounded-sm border px-5 py-2.5 text-sm font-semibold text-ink-1 transition-colors sm:w-auto"
          >
            Browse Public Feed
          </Link>

          <form action={signOutAction} className="w-full sm:w-auto">
            <button
              type="submit"
              className="bg-crimson/10 border-crimson/20 text-crimson hover:bg-crimson/20 inline-flex w-full items-center justify-center rounded-sm border px-5 py-2.5 text-sm font-semibold transition-colors sm:w-auto"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
