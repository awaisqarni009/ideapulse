import React from 'react';
import type { Metadata } from 'next';
import { Sparkles } from 'lucide-react';
import { FAQClient } from '@/app/faq/faq-client';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions — IdeaPulse',
  description:
    'Everything you need to know about voting quotas, verification, cycle progression, and anti-abuse safeguards on IdeaPulse.',
};

export default function FAQPage() {
  return (
    <main id="main-content" className="relative min-h-screen overflow-hidden pb-24 pt-12">
      {/* Background Volumetric Glow Orbs */}
      <div className="from-[var(--indigo)]/20 via-[var(--cyan)]/15 to-[var(--violet)]/20 pointer-events-none absolute -top-32 left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr blur-[130px]" />
      <div className="bg-[var(--cyan-bright)]/10 pointer-events-none absolute right-[-10%] top-[30%] -z-10 h-[500px] w-[500px] rounded-full blur-[120px]" />

      {/* Header */}
      <section className="mx-auto max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[var(--tint-indigo)] px-4 py-1.5 text-xs font-semibold text-[var(--indigo-bright)] shadow-[var(--glow-indigo-sm)]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Knowledge & Support Hub</span>
        </div>

        <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
          Frequently Asked <span className="text-gradient-dual">Questions</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
          Clear answers regarding 5-vote rolling quotas, account verification, cycle automation, and
          our anti-abuse invariants.
        </p>
      </section>

      {/* Accordion & Interactive Categories */}
      <FAQClient />
    </main>
  );
}
