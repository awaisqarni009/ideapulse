'use client';

import { useState, useTransition } from 'react';
import { useUser } from '@/lib/auth/use-user';
import { resendConfirmationAction } from '@/app/actions/auth';

/**
 * Top banner displayed when the signed-in user has an unconfirmed email address (T-2.15).
 * Explains consequences and provides a one-click resend affordance.
 */
export function UnconfirmedBanner() {
  const { user, isConfirmed, isLoading } = useUser();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (isLoading || !user || isConfirmed) {
    return null;
  }

  const handleResend = () => {
    if (!user.email) return;
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const res = await resendConfirmationAction(user.email!);
      if (res.success) {
        setMessage(res.message || 'Confirmation email sent. Check your inbox!');
      } else {
        setError(res.error || 'Failed to resend confirmation email.');
      }
    });
  };

  return (
    <aside
      aria-label="Email confirmation banner"
      className="border-amber/30 bg-amber/10 sticky top-0 z-50 w-full border-b px-4 py-2.5 text-sm text-ink-1 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="bg-amber/20 text-amber flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold">
            !
          </span>
          <p className="text-xs text-ink-2 sm:text-sm">
            <span className="text-amber font-medium">Email unconfirmed:</span> Your votes will not
            count toward idea qualification, and submissions are disabled until confirmed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {message && <span className="text-emerald text-xs font-medium">{message}</span>}
          {error && <span className="text-crimson text-xs font-medium">{error}</span>}

          {!message && (
            <button
              onClick={handleResend}
              disabled={isPending}
              className="bg-amber/20 text-amber hover:bg-amber/30 inline-flex items-center justify-center rounded-sm px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isPending ? 'Sending...' : 'Resend confirmation email'}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
