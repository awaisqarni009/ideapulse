import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from './register-form';

export const metadata: Metadata = {
  title: 'Create Account — IdeaPulse',
  description: 'Join IdeaPulse. Five votes per day. Every vote matters.',
};

export default function RegisterPage() {
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
            Create your account
          </h1>
          <p className="text-text-secondary mt-2 text-sm">
            Join the community. Discover high-signal product ideas and cast your daily votes.
          </p>
        </div>

        <RegisterForm />
      </div>
    </main>
  );
}
