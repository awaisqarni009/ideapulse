import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from './register-form';
import { AuthVisualHero } from '@/app/components/auth/auth-visual-hero';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Join IdeaPulse. Five votes per day. Every vote matters.',
};

export default function RegisterPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="relative flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12 focus:outline-none sm:px-6 lg:px-8"
    >
      {/* Background Volumetric Ambient Lighting */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[500px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.1)_0%,transparent_70%)] blur-3xl" />

      <div className="relative z-10 w-full max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Column: 3D Animated Hero Showcase */}
          <div className="lg:col-span-6 xl:col-span-7">
            <AuthVisualHero mode="register" />
          </div>

          {/* Right Column: Glassmorphic Register Form Container */}
          <div className="mx-auto w-full max-w-md lg:col-span-6 xl:col-span-5">
            <div className="mb-6 text-center lg:text-left">
              <Link href="/" className="group inline-flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-accent)] bg-gradient-to-br from-[var(--indigo)] to-[var(--violet)] shadow-[var(--glow-indigo-sm)] transition-transform group-hover:scale-105">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-display text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                  Idea<span className="text-[var(--cyan-bright)]">Pulse</span>
                </span>
              </Link>
              <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                Create your account
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                Join the community. Discover high-signal product ideas and cast your daily votes.
              </p>
            </div>

            <RegisterForm />
          </div>
        </div>
      </div>
    </main>
  );
}
