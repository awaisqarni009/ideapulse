'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Loader2, ArrowRight } from 'lucide-react';
import { ease } from '@/lib/motion';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMsg('Enter a valid email like name@example.com');
      return;
    }

    setErrorMsg('');
    setStatus('loading');

    setTimeout(() => {
      setStatus('success');
    }, 900);
  };

  return (
    <section className="w-full border-t border-white/5 bg-[#15181B] px-4 py-20 text-[#F2F5F7] sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-xl text-center">
        {/* No uppercase eyebrow per §1 problem 10 */}
        <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Get 20% off your first order
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-[#8A8F95]">
          Sign up to receive early access to limited heavyweight drops and private restock codes.
        </p>

        {status === 'success' ? (
          <motion.div
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: ease.settle }}
            className="mt-6 flex items-center justify-center gap-2 rounded-sm border border-[#10B981]/30 bg-[#10B981]/10 px-4 py-3 font-mono text-xs text-[#10B981]"
          >
            <Check className="h-4 w-4" />
            <span>
              Code sent. Check your inbox (use code <strong>PULSE20</strong> at checkout).
            </span>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Enter your email address"
              className="flex-1 rounded-sm border border-white/10 bg-[#1F2327] px-4 py-3 font-mono text-xs text-white placeholder-[#8A8F95] focus:border-white/30 focus:outline-none"
            />
            {/* Verb button: "Get my code" §7.7 & §7.12 */}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex shrink-0 items-center justify-center gap-1.5 rounded-sm bg-[#FF5A1F] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:brightness-110 active:scale-[0.99]"
            >
              {status === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Get my code</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {errorMsg && (
          <p className="mt-2 text-left font-mono text-[11px] text-[#FF5A1F] sm:text-center">
            {errorMsg}
          </p>
        )}
      </div>
    </section>
  );
}
