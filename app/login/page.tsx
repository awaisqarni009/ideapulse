import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from './login-form';
import { AuthVisualHero } from '@/app/components/auth/auth-visual-hero';
import { PulseWearLogo } from '@/app/components/ui/logo';

export const metadata: Metadata = {
  title: 'Sign In',
  description:
    'Sign in to PULSEWEAR to track your orders, manage shipping addresses, and access member-only drops.',
};

export default function LoginPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="relative flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#15181B] px-4 py-12 focus:outline-none sm:px-6 lg:px-8"
    >
      {/* Background Volumetric Ambient Lighting */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[500px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,90,31,0.1)_0%,transparent_70%)] blur-3xl" />

      <div className="relative z-10 w-full max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Column: 3D Technical Showcase */}
          <div className="lg:col-span-6 xl:col-span-7">
            <AuthVisualHero mode="login" />
          </div>

          {/* Right Column: Member Login Form Container */}
          <div className="mx-auto w-full max-w-md lg:col-span-6 xl:col-span-5">
            <div className="mb-6 text-center lg:text-left">
              <PulseWearLogo size="md" href="/" />
              <h1 className="mt-6 font-display text-2xl font-extrabold uppercase tracking-tight text-[#F2F5F7] sm:text-3xl">
                Member Sign In
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[#8A8F95]">
                Enter your credentials to access order status, tracking, and VIP drop reservations.
              </p>
            </div>

            <Suspense
              fallback={
                <div
                  className="h-80 animate-pulse rounded-sm border border-white/10 bg-[#1F2327] p-8"
                  style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }}
                />
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
