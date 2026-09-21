import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Sign In — IdeaPulse',
  description: 'Sign in to IdeaPulse to submit ideas, track cycles, and cast your daily votes.',
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <span className="text-text-primary font-display text-2xl font-bold tracking-tight">
              Idea<span className="text-indigo">Pulse</span>
            </span>
          </Link>
          <h1 className="text-text-primary mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back
          </h1>
          <p className="text-text-secondary mt-2 text-sm">
            Sign in to access your vote quota and stay active in the weekly cycle.
          </p>
        </div>

        <Suspense
          fallback={
            <div
              className="border-border-default bg-surface-2 h-72 animate-pulse rounded-xl border p-8 shadow-glass backdrop-blur-md"
              style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
            />
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
