'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import type { LeaderboardItem } from '@/lib/leaderboard';
import { spring } from '@/lib/motion';
import { ArrowRight, Sparkles, CheckCircle2, ShieldAlert, Award, Clock } from 'lucide-react';

interface HeroShowcaseProps {
  topThree: LeaderboardItem[];
  cycleNumber: number;
}

export function HeroShowcase({ topThree, cycleNumber }: HeroShowcaseProps) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: spring.smooth,
    },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden py-16 sm:py-24"
    >
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 -z-10 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[rgba(99,102,241,0.18)] via-[rgba(139,92,246,0.08)] to-transparent blur-3xl" />

      <div className="container mx-auto max-w-5xl px-4 text-center sm:px-6">
        {/* Cycle status tag */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[rgba(99,102,241,0.12)] px-4 py-1.5 text-xs font-semibold text-[var(--indigo-bright)] shadow-[var(--glow-indigo-sm)]"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Active Cycle #{cycleNumber} Is Running</span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          variants={itemVariants}
          className="mt-6 font-display text-4xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-6xl lg:text-7xl"
        >
          Propose bold ideas.{' '}
          <span className="bg-gradient-to-r from-[var(--indigo-bright)] via-[var(--violet-bright)] to-[var(--cyan-bright)] bg-clip-text text-transparent">
            Vote on what matters.
          </span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          variants={itemVariants}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg"
        >
          IdeaPulse is the fraud-resistant idea validation engine. Authenticated members allocate
          verified votes to signal real demand. Every Sunday at midnight, top qualifying proposals
          win rewards.
        </motion.p>

        {/* The Rules Stated in Three Lines per T-4.16 */}
        <motion.div
          variants={itemVariants}
          className="glass-panel mx-auto mt-10 max-w-2xl rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 text-left shadow-lg backdrop-blur-[var(--blur-md)]"
          style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
        >
          <div className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            Core Protocol Rules
          </div>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-start gap-3 text-[var(--text-primary)]">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(99,102,241,0.15)] font-mono text-xs font-bold text-[var(--indigo-bright)]">
                1
              </span>
              <span>
                <strong className="font-semibold text-[var(--text-primary)]">
                  One proposal per author per cycle
                </strong>{' '}
                — High signal only; zero spam or sockpuppets.
              </span>
            </li>
            <li className="flex items-start gap-3 text-[var(--text-primary)]">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(6,182,212,0.15)] font-mono text-xs font-bold text-[var(--cyan-bright)]">
                2
              </span>
              <span>
                <strong className="font-semibold text-[var(--text-primary)]">
                  Five votes per rolling 24 hours
                </strong>{' '}
                — A constant budget, never a midnight reset.
              </span>
            </li>
            <li className="flex items-start gap-3 text-[var(--text-primary)]">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(139,92,246,0.15)] font-mono text-xs font-bold text-[var(--violet-bright)]">
                3
              </span>
              <span>
                <strong className="font-semibold text-[var(--text-primary)]">
                  Sunday midnight close
                </strong>{' '}
                — Top 3 ideas meeting threshold qualify for rewards.
              </span>
            </li>
          </ul>
        </motion.div>

        {/* Single Primary CTA */}
        <motion.div
          variants={itemVariants}
          className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/feed"
            className="btn inline-flex items-center gap-2.5 rounded-xl bg-[var(--indigo-bright)] px-7 py-3.5 text-sm font-bold text-white shadow-[var(--glow-indigo-md)] transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo-bright)]"
          >
            <span>Explore Active Proposals</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/rules"
            className="btn glass-panel inline-flex items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] px-5 py-3.5 text-sm font-medium text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo-bright)]"
          >
            <span>Read All Rules</span>
          </Link>
        </motion.div>

        {/* Live Top 3 Showcase */}
        <motion.div variants={itemVariants} className="mt-16 text-left">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
                <Award className="h-5 w-5 text-[var(--violet-bright)]" />
                <span>Live Cycle #{cycleNumber} Standings</span>
              </h2>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)] sm:text-sm">
                Current top ranked proposals competing for qualification.
              </p>
            </div>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--indigo-bright)] hover:underline"
            >
              <span>Full Leaderboard</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {topThree.length === 0 ? (
            <div
              className="glass-panel flex flex-col items-center justify-center rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-10 text-center backdrop-blur-[var(--blur-md)]"
              style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
            >
              <Clock className="mb-2 h-8 w-8 text-[var(--text-tertiary)]" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                This cycle is waiting for its first proposals
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Be the first to submit an idea and claim rank #01.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {topThree.map((item, idx) => {
                const rankNum = idx + 1;
                const isFirst = rankNum === 1;

                return (
                  <Link
                    key={item.idea_id}
                    href={`/ideas/${item.slug}`}
                    className={`glass-panel group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1 ${
                      isFirst
                        ? 'border-[var(--border-qualified)] bg-[var(--surface-2)] shadow-[var(--glow-violet-md)]'
                        : 'border-[var(--border-default)] bg-[var(--surface-1)] hover:border-[var(--border-accent)]'
                    }`}
                    style={{
                      boxShadow: isFirst
                        ? 'inset 0 1px 0 var(--edge-specular), 0 0 24px -4px rgba(139,92,246,0.25)'
                        : 'inset 0 1px 0 var(--edge-specular)',
                    }}
                  >
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <span
                          className={`rounded-full px-2 py-0.5 font-mono text-xs font-bold ${
                            isFirst
                              ? 'border border-[var(--border-qualified)] bg-[rgba(139,92,246,0.25)] text-[var(--violet-bright)]'
                              : 'border border-[var(--border-subtle)] bg-[var(--surface-3)] text-[var(--text-secondary)]'
                          }`}
                        >
                          #{String(rankNum).padStart(2, '0')}
                        </span>
                        <span className="rounded-full border border-[rgba(6,182,212,0.2)] bg-[rgba(6,182,212,0.12)] px-2.5 py-0.5 font-mono text-xs font-bold text-[var(--cyan-bright)]">
                          {item.verified_vote_count} verified votes
                        </span>
                      </div>

                      <h3 className="line-clamp-2 font-display text-base font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--indigo-bright)]">
                        {item.title}
                      </h3>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-tertiary)]">
                      <span>by @{item.author_username}</span>
                      <span className="text-[var(--indigo-bright)] transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
}
