'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Lock, ArrowRight, Check, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { updatePasswordAction, type AuthActionResult } from '@/app/actions/auth';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-[var(--radius-md)] px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--glow-indigo-md)] transition-all duration-200 hover:shadow-[var(--glow-indigo-lg)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="relative z-10">{pending ? 'Updating password...' : 'Update password'}</span>
      <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
    </button>
  );
}

export function ResetPasswordForm() {
  const [state, formAction] = useFormState<AuthActionResult | null, FormData>(
    updatePasswordAction,
    null,
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const passwordCriteria = useMemo(() => {
    return {
      hasLength: password.length >= 10,
      hasDigit: /\d/.test(password),
      matches: password.length > 0 && password === confirmPassword,
    };
  }, [password, confirmPassword]);

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
          Password updated!
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{state.message}</p>
        <div className="mt-8">
          <Link
            href="/login"
            className="btn btn-primary inline-flex items-center justify-center rounded-[var(--radius-md)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--glow-indigo-sm)] transition-all hover:shadow-[var(--glow-indigo-md)]"
          >
            Sign in with new password →
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

      {/* New Password */}
      <div className="mb-4">
        <label
          htmlFor="password"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
        >
          New password
        </label>
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--text-tertiary)] transition-colors group-focus-within:text-[var(--indigo-bright)]">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 10 characters with a number"
            aria-invalid={Boolean(state?.fieldErrors?.password)}
            aria-describedby={state?.fieldErrors?.password ? 'password-error' : undefined}
            className="focus:ring-[var(--indigo-bright)]/30 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] py-3 pl-10 pr-10 text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--indigo)] focus:bg-[var(--surface-solid)] focus:outline-none focus:ring-2 aria-[invalid=true]:border-[var(--accent-danger)]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)] focus:outline-none"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {state?.fieldErrors?.password && (
          <p id="password-error" className="mt-1.5 text-xs text-[var(--accent-danger)]">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="mb-4">
        <label
          htmlFor="confirmPassword"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
        >
          Confirm new password
        </label>
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--text-tertiary)] transition-colors group-focus-within:text-[var(--indigo-bright)]">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your new password"
            aria-invalid={Boolean(state?.fieldErrors?.confirmPassword)}
            aria-describedby={
              state?.fieldErrors?.confirmPassword ? 'confirm-password-error' : undefined
            }
            className="focus:ring-[var(--indigo-bright)]/30 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] py-3 pl-10 pr-10 text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--indigo)] focus:bg-[var(--surface-solid)] focus:outline-none focus:ring-2 aria-[invalid=true]:border-[var(--accent-danger)]"
          />
        </div>
        {state?.fieldErrors?.confirmPassword && (
          <p id="confirm-password-error" className="mt-1.5 text-xs text-[var(--accent-danger)]">
            {state.fieldErrors.confirmPassword[0]}
          </p>
        )}
      </div>

      {/* Requirements checklist */}
      <div className="mb-6 space-y-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-4">
        <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
          Password requirements
        </p>
        <div className="flex items-center gap-2.5 text-xs">
          {passwordCriteria.hasLength ? (
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Check className="h-3 w-3 stroke-[3]" />
            </div>
          ) : (
            <div className="ml-1 mr-1 h-2 w-2 rounded-full bg-[var(--text-tertiary)] opacity-50" />
          )}
          <span
            className={
              passwordCriteria.hasLength
                ? 'font-medium text-[var(--text-primary)]'
                : 'text-[var(--text-tertiary)]'
            }
          >
            At least 10 characters
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-xs">
          {passwordCriteria.hasDigit ? (
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Check className="h-3 w-3 stroke-[3]" />
            </div>
          ) : (
            <div className="ml-1 mr-1 h-2 w-2 rounded-full bg-[var(--text-tertiary)] opacity-50" />
          )}
          <span
            className={
              passwordCriteria.hasDigit
                ? 'font-medium text-[var(--text-primary)]'
                : 'text-[var(--text-tertiary)]'
            }
          >
            At least one digit (0-9)
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-xs">
          {passwordCriteria.matches ? (
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Check className="h-3 w-3 stroke-[3]" />
            </div>
          ) : (
            <div className="ml-1 mr-1 h-2 w-2 rounded-full bg-[var(--text-tertiary)] opacity-50" />
          )}
          <span
            className={
              passwordCriteria.matches
                ? 'font-medium text-[var(--text-primary)]'
                : 'text-[var(--text-tertiary)]'
            }
          >
            Passwords match
          </span>
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
