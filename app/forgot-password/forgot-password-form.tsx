'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { requestPasswordResetAction, type AuthActionResult } from '@/app/actions/auth';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="text-text-primary shadow-glow-indigo-sm group relative flex w-full items-center justify-center gap-2 rounded-md bg-indigo px-5 py-3 text-sm font-medium transition-all duration-150 hover:bg-indigo-bright active:bg-indigo-deep disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span>{pending ? 'Sending reset link...' : 'Send reset link'}</span>
      <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
    </button>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useFormState<AuthActionResult | null, FormData>(
    requestPasswordResetAction,
    null,
  );

  if (state?.success) {
    return (
      <div
        className="border-border-default bg-surface-2 rounded-xl border p-8 text-center shadow-glass backdrop-blur-md"
        style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
      >
        <div className="bg-tint-success text-success mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="text-text-primary font-display text-xl font-bold">Check your email</h2>
        <p className="text-text-secondary mt-2 text-sm leading-relaxed">{state.message}</p>
        <div className="mt-6">
          <Link
            href="/login"
            className="border-border-default bg-surface-3 text-text-primary hover:border-border-strong inline-flex items-center justify-center rounded-md border px-5 py-2.5 text-sm font-medium transition"
          >
            Return to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="border-border-default bg-surface-2 rounded-xl border p-8 shadow-glass backdrop-blur-md"
      style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
      noValidate
    >
      {state?.error && (
        <div
          role="alert"
          className="border-danger/30 bg-tint-danger text-danger mb-6 flex items-start gap-3 rounded-md border p-3 text-sm"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="email" className="text-text-secondary mb-1.5 block text-xs font-medium">
          Account email
        </label>
        <div className="relative">
          <div className="text-text-tertiary pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Mail className="h-4 w-4" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="border-border-default bg-surface-2 text-text-primary placeholder:text-text-tertiary w-full rounded-sm border py-2.5 pl-10 pr-3.5 text-sm transition focus:border-indigo focus:outline-none focus:ring-1 focus:ring-indigo"
          />
        </div>
      </div>

      <SubmitButton />

      <div className="text-text-tertiary mt-6 text-center text-xs">
        Remember your password?{' '}
        <Link href="/login" className="text-indigo-bright hover:underline">
          Sign in
        </Link>
      </div>
    </form>
  );
}
