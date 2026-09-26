'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck, Sparkles, TrendingUp, CheckCircle2, Lock, Zap } from 'lucide-react';

interface AuthVisualHeroProps {
  mode: 'login' | 'register';
}

export function AuthVisualHero({ mode }: AuthVisualHeroProps) {
  const shouldReduceMotion = useReducedMotion();

  const floatAnimation1 = shouldReduceMotion
    ? {}
    : {
        y: [-8, 8, -8],
        rotateX: [0, 5, 0],
        rotateY: [-5, 5, -5],
        transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
      };

  const floatAnimation2 = shouldReduceMotion
    ? {}
    : {
        y: [8, -8, 8],
        rotateX: [5, -5, 5],
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
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.25)_0%,transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.2)_0%,transparent_70%)] blur-3xl" />

      {/* Top Header Badge */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[var(--surface-1)] px-4 py-1.5 text-xs font-semibold text-[var(--indigo-bright)] shadow-[var(--glow-indigo-sm)] backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Decentralized Idea Incubation</span>
        </div>
        <h2 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-[var(--text-primary)] xl:text-5xl">
          {mode === 'login' ? (
            <>
              Welcome back to <span className="text-gradient-dual">IdeaPulse</span>.
            </>
          ) : (
            <>
              Shape the next wave of <span className="text-gradient-dual">great ideas</span>.
            </>
          )}
        </h2>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-[var(--text-secondary)]">
          {mode === 'login'
            ? 'Access your daily voting quota, monitor active cycle leaderboards, and rally behind breakout proposals.'
            : 'Join an authentic builder community governed by verifiable consensus and zero-raw-IP privacy.'}
        </p>
      </div>

      {/* 3D Floating Holographic Showcase Container */}
      <div
        className="relative my-10 flex min-h-[340px] items-center justify-center"
        style={{ perspective: 1000 }}
      >
        {/* Main 3D Card: Active Proposal Spotlight */}
        <motion.div
          animate={floatAnimation1}
          className="glass-card-nextgen relative z-20 w-full max-w-md rounded-2xl border border-[var(--border-default)] bg-[var(--surface-2)] p-6 shadow-2xl backdrop-blur-xl"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 1px 0 var(--edge-specular)',
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--indigo)] to-[var(--violet)] text-white shadow-md">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--text-primary)]">
                  Vector Engine for Edge DBs
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)]">
                  Developer Tools · Cycle #4
                </div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span>Rank #1</span>
            </span>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Threshold Progress</span>
              <span className="font-mono font-bold text-[var(--cyan-bright)]">48 / 50 Votes</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--indigo)] via-[var(--violet)] to-[var(--cyan-bright)]"
                style={{ width: '96%' }}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-2 text-[11px] text-[var(--text-tertiary)]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>96% to Reward Grant</span>
            </span>
            <span className="font-mono text-[var(--text-secondary)]">2d 10h remaining</span>
          </div>
        </motion.div>

        {/* Floating 3D Pill 1: Daily Quota HUD */}
        <motion.div
          animate={floatAnimation2}
          className="absolute -right-4 -top-6 z-30 flex items-center gap-2.5 rounded-2xl border border-[var(--border-accent)] bg-[var(--surface-solid)] px-4 py-2.5 shadow-xl backdrop-blur-md"
          style={{
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), inset 0 1px 0 var(--edge-specular)',
          }}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(6,182,212,0.15)] text-[var(--cyan-bright)]">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="font-mono text-xs font-bold text-[var(--cyan-bright)]">
              5 Daily Votes
            </div>
            <div className="text-[10px] text-[var(--text-tertiary)]">24h Rolling Quota</div>
          </div>
        </motion.div>

        {/* Floating 3D Pill 2: Anti-Sybil Guarantee */}
        <motion.div
          animate={floatAnimation3}
          className="absolute -bottom-6 -left-4 z-30 flex items-center gap-2.5 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-solid)] px-4 py-2.5 shadow-xl backdrop-blur-md"
          style={{
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), inset 0 1px 0 var(--edge-specular)',
          }}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(99,102,241,0.15)] text-[var(--indigo-bright)]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--text-primary)]">Anti-Sybil Protocol</div>
            <div className="text-[10px] text-[var(--text-tertiary)]">Zero Raw IP Storage</div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Trust Matrix */}
      <div className="relative z-10 flex items-center justify-between border-t border-[var(--border-subtle)] pt-6 text-xs text-[var(--text-tertiary)]">
        <span className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-[var(--indigo-bright)]" />
          <span>Encrypted Session Credentials</span>
        </span>
        <span className="font-mono text-[var(--text-secondary)]">Cycle #4 Live Consensus</span>
      </div>
    </div>
  );
}
