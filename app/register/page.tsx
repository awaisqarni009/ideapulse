import type { Metadata } from 'next';
import { RegisterForm } from './register-form';
import { AuthVisualHero } from '@/app/components/auth/auth-visual-hero';
import { PulseWearLogo } from '@/app/components/ui/logo';

export const metadata: Metadata = {
  title: 'Create Account',
  description:
    'Join PULSEWEAR for member-only outerwear releases, priority dispatch, and order tracking.',
};

export default function RegisterPage() {
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
            <AuthVisualHero mode="register" />
          </div>

          {/* Right Column: Member Register Form Container */}
          <div className="mx-auto w-full max-w-md lg:col-span-6 xl:col-span-5">
            <div className="mb-6 text-center lg:text-left">
              <PulseWearLogo size="md" href="/" />
              <h1 className="mt-6 font-display text-2xl font-extrabold uppercase tracking-tight text-[#F2F5F7] sm:text-3xl">
                Create Account
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[#8A8F95]">
                Join the collective for verified drop reservations, order history, and priority
                dispatch.
              </p>
            </div>

            <RegisterForm />
          </div>
        </div>
      </div>
    </main>
  );
}
