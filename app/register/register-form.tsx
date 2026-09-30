'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Check,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  User,
  AtSign,
  Phone,
  ShieldCheck,
  LogIn,
  UserPlus,
  Globe,
} from 'lucide-react';
import { registerAction, type AuthActionResult } from '@/app/actions/auth';
import { OAuthButtons } from '@/app/components/auth/oauth-buttons';
import { COUNTRY_CODES } from '@/lib/validation';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-[var(--radius-md)] px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--glow-indigo-md)] transition-all duration-200 hover:shadow-[var(--glow-indigo-lg)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="relative z-10">{pending ? 'Creating account...' : 'Create account'}</span>
      <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
      {/* Dynamic button sheen */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
    </button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useFormState<AuthActionResult | null, FormData>(registerAction, null);

  // Form Fields State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [countryCode, setCountryCode] = useState('+92');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Live password complexity checklist
  // Requires: alphabet letter, number, and special sign/symbol (min 10 characters)
  const passwordCriteria = useMemo(() => {
    return {
      hasLength: password.length >= 10,
      hasLetter: /[a-zA-Z]/.test(password),
      hasDigit: /[0-9]/.test(password),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>\-_=+]/.test(password),
    };
  }, [password]);

  const isPhoneValid = phone.length === 11;

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
          Check your inbox
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
      className="glass-card-nextgen rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)] transition-all sm:p-8"
      style={{
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.35), inset 0 1px 0 var(--edge-specular)',
      }}
      noValidate
    >
      {/* Visual Navigation Tabs on Card Top */}
      <div className="mb-6 flex rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-1">
        <Link
          href="/login"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold text-[var(--text-secondary)] transition-all hover:text-[var(--text-primary)]"
        >
          <LogIn className="h-4 w-4 text-[var(--text-tertiary)]" />
          <span>Sign In</span>
        </Link>
        <div className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[var(--indigo)] to-[var(--violet)] py-2.5 text-xs font-semibold text-white shadow-[var(--glow-indigo-sm)]">
          <UserPlus className="h-4 w-4 text-white" />
          <span>Create Account</span>
        </div>
      </div>

      <OAuthButtons />

      <div className="relative my-6 flex items-center">
        <div className="flex-grow border-t border-[var(--border-subtle)]" />
        <span className="mx-4 flex-shrink-0 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          or register with credentials
        </span>
        <div className="flex-grow border-t border-[var(--border-subtle)]" />
      </div>

      {state?.error && !state?.fieldErrors && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-[var(--radius-sm)] border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-[var(--accent-danger)]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="leading-snug">{state.error}</span>
        </div>
      )}

      {/* 1. SEPARATE FULL NAME & USERNAME FIELDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
          >
            Full Name
          </label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--text-tertiary)] transition-colors group-focus-within:text-[var(--indigo-bright)]">
              <User className="h-4 w-4" />
            </div>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Sarah Connor"
              aria-invalid={Boolean(state?.fieldErrors?.fullName)}
              className="focus:ring-[var(--indigo-bright)]/30 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] py-2.5 pl-10 pr-3.5 text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--indigo)] focus:bg-[var(--surface-solid)] focus:outline-none focus:ring-2 aria-[invalid=true]:border-[var(--accent-danger)]"
            />
          </div>
          {state?.fieldErrors?.fullName && (
            <p className="mt-1 text-xs text-[var(--accent-danger)]">
              {state.fieldErrors.fullName[0]}
            </p>
          )}
        </div>

        {/* Username */}
        <div>
          <label
            htmlFor="username"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
          >
            Username
          </label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--text-tertiary)] transition-colors group-focus-within:text-[var(--indigo-bright)]">
              <AtSign className="h-4 w-4" />
            </div>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="e.g. sarah_connor"
              aria-invalid={Boolean(state?.fieldErrors?.username)}
              className="focus:ring-[var(--indigo-bright)]/30 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] py-2.5 pl-10 pr-3.5 text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--indigo)] focus:bg-[var(--surface-solid)] focus:outline-none focus:ring-2 aria-[invalid=true]:border-[var(--accent-danger)]"
            />
          </div>
          {state?.fieldErrors?.username && (
            <p className="mt-1 text-xs text-[var(--accent-danger)]">
              {state.fieldErrors.username[0]}
            </p>
          )}
        </div>
      </div>

      {/* 2. PHONE NUMBER (COUNTRY CODE + EXACTLY 11 DIGITS) */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="phone"
            className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
          >
            Phone Number
          </label>
          <span
            className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold transition-colors ${
              isPhoneValid
                ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : phone.length > 0
                  ? 'border border-amber-500/30 bg-amber-500/10 text-amber-400'
                  : 'text-[var(--text-tertiary)]'
            }`}
          >
            {phone.length}/11 digits
          </span>
        </div>
        <div className="flex gap-2">
          {/* Country Code Selector */}
          <div className="relative w-36 shrink-0">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-[var(--text-tertiary)]">
              <Globe className="h-3.5 w-3.5" />
            </div>
            <select
              id="countryCode"
              name="countryCode"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="focus:ring-[var(--indigo-bright)]/30 w-full appearance-none rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] py-2.5 pl-8 pr-6 text-xs font-medium text-[var(--text-primary)] transition-all hover:border-[var(--border-strong)] focus:border-[var(--indigo)] focus:bg-[var(--surface-solid)] focus:outline-none focus:ring-2"
            >
              {COUNTRY_CODES.map((item) => (
                <option
                  key={item.code + item.name}
                  value={item.code}
                  className="bg-[var(--surface-solid)] text-[var(--text-primary)]"
                >
                  {item.flag} {item.code}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-[var(--text-tertiary)]">
              <span className="text-[10px]">▼</span>
            </div>
          </div>

          {/* 11-Digit Phone Input */}
          <div className="group relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--text-tertiary)] transition-colors group-focus-within:text-[var(--indigo-bright)]">
              <Phone className="h-4 w-4" />
            </div>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              maxLength={11}
              value={phone}
              onChange={(e) => {
                // Strictly accept digits only, maximum 11 digits
                const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                setPhone(digits);
              }}
              placeholder="11 digits (e.g. 03001234567)"
              aria-invalid={Boolean(state?.fieldErrors?.phone)}
              className="focus:ring-[var(--indigo-bright)]/30 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] py-2.5 pl-10 pr-3.5 text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--indigo)] focus:bg-[var(--surface-solid)] focus:outline-none focus:ring-2 aria-[invalid=true]:border-[var(--accent-danger)]"
            />
          </div>
        </div>
        {state?.fieldErrors?.phone && (
          <p className="mt-1 text-xs text-[var(--accent-danger)]">{state.fieldErrors.phone[0]}</p>
        )}
      </div>

      {/* 3. EMAIL ADDRESS */}
      <div className="mt-4">
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
        >
          Email address
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-invalid={Boolean(state?.fieldErrors?.email)}
            className="focus:ring-[var(--indigo-bright)]/30 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] py-2.5 pl-10 pr-3.5 text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--indigo)] focus:bg-[var(--surface-solid)] focus:outline-none focus:ring-2 aria-[invalid=true]:border-[var(--accent-danger)]"
          />
        </div>
        {state?.fieldErrors?.email && (
          <p className="mt-1 text-xs text-[var(--accent-danger)]">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      {/* 4. PASSWORD (WITH SHOW/HIDE TOGGLE & STRICT COMPLEXITY: ALPHABET, NUMBER, ANY SIGN) */}
      <div className="mt-4">
        <label
          htmlFor="password"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
        >
          Password
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
            placeholder="Letters, numbers & symbols (≥ 10 chars)"
            aria-invalid={Boolean(state?.fieldErrors?.password)}
            className="focus:ring-[var(--indigo-bright)]/30 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] py-2.5 pl-10 pr-10 text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--indigo)] focus:bg-[var(--surface-solid)] focus:outline-none focus:ring-2 aria-[invalid=true]:border-[var(--accent-danger)]"
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
          <p className="mt-1 text-xs text-[var(--accent-danger)]">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      {/* 5. CONFIRM PASSWORD */}
      <div className="mt-4">
        <label
          htmlFor="confirmPassword"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
        >
          Confirm Password
        </label>
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--text-tertiary)] transition-colors group-focus-within:text-[var(--indigo-bright)]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            aria-invalid={Boolean(state?.fieldErrors?.confirmPassword)}
            className="focus:ring-[var(--indigo-bright)]/30 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] py-2.5 pl-10 pr-10 text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--indigo)] focus:bg-[var(--surface-solid)] focus:outline-none focus:ring-2 aria-[invalid=true]:border-[var(--accent-danger)]"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)] focus:outline-none"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {state?.fieldErrors?.confirmPassword && (
          <p className="mt-1 text-xs text-[var(--accent-danger)]">
            {state.fieldErrors.confirmPassword[0]}
          </p>
        )}
      </div>

      {/* REAL-TIME PASSWORD COMPLEXITY CHECKLIST */}
      <div className="my-5 space-y-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3.5 transition-colors">
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
          Password Requirements
        </p>

        {/* Condition 1: Alphabet Letters */}
        <div className="flex items-center gap-2 text-xs transition-colors">
          {passwordCriteria.hasLetter ? (
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Check className="h-3 w-3 stroke-[3]" />
            </div>
          ) : (
            <div className="ml-1 mr-1 h-2 w-2 rounded-full bg-[var(--text-tertiary)] opacity-40" />
          )}
          <span
            className={
              passwordCriteria.hasLetter
                ? 'font-medium text-[var(--text-primary)]'
                : 'text-[var(--text-tertiary)]'
            }
          >
            At least one alphabet letter (a-z, A-Z)
          </span>
        </div>

        {/* Condition 2: Numbers */}
        <div className="flex items-center gap-2 text-xs transition-colors">
          {passwordCriteria.hasDigit ? (
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Check className="h-3 w-3 stroke-[3]" />
            </div>
          ) : (
            <div className="ml-1 mr-1 h-2 w-2 rounded-full bg-[var(--text-tertiary)] opacity-40" />
          )}
          <span
            className={
              passwordCriteria.hasDigit
                ? 'font-medium text-[var(--text-primary)]'
                : 'text-[var(--text-tertiary)]'
            }
          >
            At least one number (0-9)
          </span>
        </div>

        {/* Condition 3: Sign / Symbol */}
        <div className="flex items-center gap-2 text-xs transition-colors">
          {passwordCriteria.hasSymbol ? (
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Check className="h-3 w-3 stroke-[3]" />
            </div>
          ) : (
            <div className="ml-1 mr-1 h-2 w-2 rounded-full bg-[var(--text-tertiary)] opacity-40" />
          )}
          <span
            className={
              passwordCriteria.hasSymbol
                ? 'font-medium text-[var(--text-primary)]'
                : 'text-[var(--text-tertiary)]'
            }
          >
            At least one sign or symbol (!@#$%^&*...)
          </span>
        </div>

        {/* Condition 4: Minimum Length */}
        <div className="flex items-center gap-2 text-xs transition-colors">
          {passwordCriteria.hasLength ? (
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Check className="h-3 w-3 stroke-[3]" />
            </div>
          ) : (
            <div className="ml-1 mr-1 h-2 w-2 rounded-full bg-[var(--text-tertiary)] opacity-40" />
          )}
          <span
            className={
              passwordCriteria.hasLength
                ? 'font-medium text-[var(--text-primary)]'
                : 'text-[var(--text-tertiary)]'
            }
          >
            At least 10 characters long
          </span>
        </div>
      </div>

      <SubmitButton />

      <div className="mt-5 text-center text-xs text-[var(--text-secondary)]">
        Already have an account?{' '}
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
