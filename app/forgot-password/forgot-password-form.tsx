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
      className="btn btn-primary group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-[var(--radius-md)] px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--glow-indigo-md)] transition-all duration-200 hover:shadow-[var(--glow-indigo-lg)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="relative z-10">{pending ? 'Sending reset link...' : 'Send reset link'}</span>
      <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
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
        className="glass-card-nextgen rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-8 text-center backdrop-blur-[var(--blur-md)] transition-all sm:p-10"
        style={{
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.35), inset 0 1px 0 var(--edge-specular)',
        }}
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
          Check your email
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{state.message}</p>
        <div className="mt-8">
          <Link
            href="/login"
            className="btn btn-primary inline-flex items-center justify-center rounded-[var(--radius-md)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--glow-indigo-sm)] transition-all hover:shadow-[var(--glow-indigo-md)]"
          >
            Return to sign in →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="glass-card-nextgen rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-8 backdrop-blur-[var(--blur-md)] transition-all sm:p-10"
      style={{
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.35), inset 0 1px 0 var(--edge-specular)',
      }}
      noValidate
    >
      {state?.error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-[var(--radius-sm)] border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-[var(--accent-danger)]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="leading-snug">{state.error}</span>
        </div>
      )}

      <div className="mb-6">
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
        >
          Account email
        </label>
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--text-tertiary)] transition-colors group-focus-within:text-[var(--indigo-bright)]">
            <Mail className="h-4 w-4" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="focus:ring-[var(--indigo-bright)]/30 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] py-3 pl-10 pr-3.5 text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--indigo)] focus:bg-[var(--surface-solid)] focus:outline-none focus:ring-2"
          />
        </div>
      </div>

      <SubmitButton />

      <div className="mt-6 text-center text-xs text-[var(--text-secondary)]">
        Remember your password?{' '}
        <Link
          href="/login"
          className="font-semibold text-[var(--indigo-bright)] transition-colors hover:text-white hover:underline"
        >
          Sign in →
        </Link>
      </div>
    </form>
  );
}
