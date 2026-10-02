'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck, Sparkles, CheckCircle2, Lock, Flame, Package, Award } from 'lucide-react';

interface AuthVisualHeroProps {
  mode: 'login' | 'register';
}

export function AuthVisualHero({ mode }: AuthVisualHeroProps) {
  const shouldReduceMotion = useReducedMotion();

  const floatAnimation1 = shouldReduceMotion
    ? {}
    : {
        y: [-8, 8, -8],
        rotateX: [0, 4, 0],
        rotateY: [-4, 4, -4],
        transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
      };

  const floatAnimation2 = shouldReduceMotion
    ? {}
    : {
        y: [8, -8, 8],
        rotateX: [4, -4, 4],
        rotateZ: [-2, 2, -2],
        transition: { duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
      };

  const floatAnimation3 = shouldReduceMotion
    ? {}
    : {
        y: [-6, 6, -6],
        x: [4, -4, 4],
        transition: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 },
      };

  return (
    <div className="relative hidden w-full lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
      {/* Background Volumetric Ambient Glows */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(255,90,31,0.15)_0%,transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(242,245,247,0.06)_0%,transparent_70%)] blur-3xl" />

      {/* Top Header Badge */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 rounded-sm border border-white/10 bg-[#1F2327] px-3.5 py-1.5 text-xs font-semibold text-[#DEDBD2] shadow-sm backdrop-blur-md">
          <Flame className="h-3.5 w-3.5 text-[#FF5A1F]" />
          <span className="font-mono text-[11px] uppercase tracking-wider">
            Technical Heavyweight Streetwear
          </span>
        </div>
        <h2 className="mt-6 font-display text-4xl font-extrabold uppercase tracking-tight text-[#F2F5F7] xl:text-5xl">
          {mode === 'login' ? (
            <>
              Engineered for <span className="text-[#FF5A1F]">warmth</span>.
            </>
          ) : (
            <>
              Join the <span className="text-[#FF5A1F]">collective</span>.
            </>
          )}
        </h2>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-[#8A8F95]">
          {mode === 'login'
            ? 'Sign in to access your order history, track deliveries in realtime, and unlock member-exclusive drop releases.'
            : 'Create your account to secure member reservations for dense 500 GSM loopback drops and 20,000 mm technical shells.'}
        </p>
      </div>

      {/* 3D Floating Showcase Container */}
      <div
        className="relative my-10 flex min-h-[340px] items-center justify-center"
        style={{ perspective: 1000 }}
      >
        {/* Main 3D Card: Midnight Echo Spotlight */}
        <motion.div
          animate={floatAnimation1}
          className="relative z-20 w-full max-w-md rounded-sm border border-white/10 bg-[#1F2327] p-6 shadow-2xl backdrop-blur-xl"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-white/10 bg-[#15181B] text-[#FF5A1F]">
                <Package className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#F2F5F7]">Midnight Echo Heavyweight</div>
                <div className="font-mono text-[11px] text-[#8A8F95]">500 GSM · Onyx Black</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-sm border border-[#FF5A1F]/30 bg-[#FF5A1F]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#FF5A1F]">
              <Sparkles className="h-3 w-3" />
              <span>Bestseller</span>
            </span>
          </div>

          <div className="mt-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8A8F95]">Batch Allocation</span>
              <span className="font-mono font-bold text-[#F2F5F7]">88% Reserved</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-none bg-black/40">
              <div
                className="h-full bg-gradient-to-r from-[#FF5A1F] to-[#FF5A1F]"
                style={{ width: '88%' }}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-2 text-[11px] text-[#8A8F95]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>YKK AquaGuard Hardware</span>
            </span>
            <span className="font-mono font-bold text-[#F2F5F7]">$98</span>
          </div>
        </motion.div>

        {/* Floating 3D Pill 1: 500 GSM Spec Badge */}
        <motion.div
          animate={floatAnimation2}
          className="absolute -right-4 -top-6 z-30 flex items-center gap-2.5 rounded-sm border border-white/10 bg-[#15181B] px-4 py-2.5 shadow-xl backdrop-blur-md"
          style={{
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#1F2327] text-[#FF5A1F]">
            <Award className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="font-mono text-xs font-bold text-[#F2F5F7]">500 GSM Loopback</div>
            <div className="text-[10px] text-[#8A8F95]">Zero Shrinkage French Terry</div>
          </div>
        </motion.div>

        {/* Floating 3D Pill 2: 20,000 MM Weatherproof */}
        <motion.div
          animate={floatAnimation3}
          className="absolute -bottom-6 -left-4 z-30 flex items-center gap-2.5 rounded-sm border border-white/10 bg-[#15181B] px-4 py-2.5 shadow-xl backdrop-blur-md"
          style={{
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#1F2327] text-cyan-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#F2F5F7]">20,000 mm Membrane</div>
            <div className="text-[10px] text-[#8A8F95]">3-Layer Weatherproof Shell</div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Trust Matrix */}
      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-[#8A8F95]">
        <span className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-[#FF5A1F]" />
          <span>Encrypted Session Credentials</span>
        </span>
        <span className="font-mono text-[#DEDBD2]">Free Express Shipping &gt;$100</span>
      </div>
    </div>
  );
}
