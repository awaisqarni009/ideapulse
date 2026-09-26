'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnergy, type EnergyTask } from '@/lib/energy/energy-context';
import {
  Zap,
  Sun,
  Clock,
  BookOpen,
  Share2,
  CheckCircle2,
  X,
  Flame,
  Sparkles,
  ArrowRight,
  TrendingUp,
  BatteryCharging,
} from 'lucide-react';

export function EnergyHubModal() {
  const {
    energy,
    maxEnergy,
    availableVotes,
    loginStreak,
    tasks,
    claimTask,
    isHubOpen,
    setIsHubOpen,
  } = useEnergy();

  // Dismiss on Escape key
  useEffect(() => {
    if (!isHubOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsHubOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHubOpen, setIsHubOpen]);

  if (!isHubOpen) return null;

  const energyPct = Math.min(100, Math.round((energy / maxEnergy) * 100));

  const getTaskIcon = (iconName: EnergyTask['icon']) => {
    switch (iconName) {
      case 'sun':
        return <Sun className="h-4 w-4 text-amber-400" />;
      case 'timer':
        return <Clock className="h-4 w-4 text-cyan-400" />;
      case 'book':
        return <BookOpen className="h-4 w-4 text-indigo-400" />;
      case 'share':
        return <Share2 className="h-4 w-4 text-purple-400" />;
      default:
        return <Zap className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsHubOpen(false);
      }}
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border-default)] bg-[var(--surface-solid)] p-6 shadow-2xl backdrop-blur-2xl transition-all"
        style={{
          boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.45), inset 0 1px 0 var(--edge-specular)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-sm">
              <Zap className="h-4 w-4 fill-current" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
                Voting Energy & Daily Quests
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Earn voting energy by logging in daily, reading ideas, and active browsing.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsHubOpen(false)}
            aria-label="Close Energy Hub"
            className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Current Energy Level Card */}
        <div
          className="mt-5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] p-4 shadow-sm"
          style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BatteryCharging className="h-4 w-4 text-[var(--cyan-bright)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                Energy Reservoir
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
              <Flame className="h-3 w-3 fill-current" />
              <span>{loginStreak}-Day Streak</span>
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-3xl font-black text-[var(--text-primary)]">
                {energy}
              </span>
              <span className="font-mono text-xs text-[var(--text-tertiary)]">/ {maxEnergy}⚡</span>
            </div>
            <div className="text-right">
              <span className="font-mono text-xs font-bold text-[var(--cyan-bright)]">
                {availableVotes} Votes Ready
              </span>
              <div className="text-[10px] text-[var(--text-tertiary)]">1 Vote = 20 Energy</div>
            </div>
          </div>

          {/* Fluid Energy Bar */}
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${energyPct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                background:
                  energyPct > 40
                    ? 'linear-gradient(90deg, #6366f1 0%, #06b6d4 50%, #10b981 100%)'
                    : 'linear-gradient(90deg, #ef4444 0%, #f59e0b 100%)',
              }}
            />
          </div>
        </div>

        {/* Daily Quests List */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              Daily Quests & Tasks
            </h4>
            <span className="text-[10px] text-[var(--text-tertiary)]">
              Resets daily at 00:00 UTC
            </span>
          </div>

          <div className="space-y-2.5">
            {tasks.map((task) => {
              const progressPct = Math.min(100, Math.round((task.current / task.target) * 100));

              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-3 transition-colors hover:border-[var(--border-default)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--surface-2)]">
                      {getTaskIcon(task.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-display text-xs font-bold text-[var(--text-primary)]">
                          {task.title}
                        </span>
                        <span className="py-0.2 rounded bg-amber-500/10 px-1.5 font-mono text-[10px] font-bold text-amber-400">
                          +{task.energyReward}⚡
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-[var(--text-secondary)]">
                        {task.description}
                      </p>

                      {/* Progress bar if not daily check-in */}
                      {task.target > 1 && !task.isClaimed && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1 w-24 overflow-hidden rounded-full bg-[var(--surface-3)]">
                            <div
                              className="h-full rounded-full bg-[var(--cyan-bright)] transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className="font-mono text-[9px] text-[var(--text-tertiary)]">
                            {task.current} / {task.target}
                            {task.id === 'scroll_30s' ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Claim Button / Status */}
                  <div className="shrink-0">
                    {task.isClaimed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Claimed</span>
                      </span>
                    ) : task.isCompleted ? (
                      <button
                        onClick={() => claimTask(task.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-500/30 transition-transform hover:scale-105"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Claim</span>
                      </button>
                    ) : (
                      <span className="font-mono text-[11px] font-semibold text-[var(--text-tertiary)]">
                        {progressPct}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info note */}
        <div className="bg-[var(--surface-2)]/50 mt-5 rounded-xl border border-[var(--border-subtle)] p-3 text-[11px] leading-relaxed text-[var(--text-secondary)]">
          <strong className="text-[var(--text-primary)]">How Energy Works:</strong> Each vote on a
          proposal costs <strong>20 Energy</strong>. Recharging gives you the consensus power to
          support more ideas each cycle.
        </div>
      </motion.div>
    </div>
  );
}
