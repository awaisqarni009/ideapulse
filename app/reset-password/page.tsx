import type { Metadata } from 'next';
import Link from 'next/link';
import { ResetPasswordForm } from './reset-password-form';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Set New Password — IdeaPulse',
  description: 'Set a new password for your IdeaPulse account.',
};

export default function ResetPasswordPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="relative flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12 focus:outline-none sm:px-6 lg:px-8"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[450px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.1)_0%,transparent_70%)] blur-3xl" />

      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="group inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-accent)] bg-gradient-to-br from-[var(--indigo)] to-[var(--violet)] shadow-[var(--glow-indigo-sm)] transition-transform group-hover:scale-105">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Idea<span className="text-[var(--cyan-bright)]">Pulse</span>
            </span>
          </Link>
          <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            Set new password
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            Create a strong, unique password to secure your voting allocations and submissions.
          </p>
        </div>

        <ResetPasswordForm />
      </div>
    </main>
  );
}
