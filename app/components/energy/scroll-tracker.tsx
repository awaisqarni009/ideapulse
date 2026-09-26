'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnergy } from '@/lib/energy/energy-context';
import { Zap, Check, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';

export function ScrollTracker() {
  const { tasks, incrementScrollSeconds, claimTask, setIsHubOpen } = useEnergy();
  const scrollTask = tasks.find((t) => t.id === 'scroll_30s');

  const [isActiveScrolling, setIsActiveScrolling] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const lastScrollTimeRef = useRef<number>(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentSeconds = scrollTask?.current ?? 0;
  const targetSeconds = scrollTask?.target ?? 30;
  const isCompleted = scrollTask?.isCompleted ?? false;
  const isClaimed = scrollTask?.isClaimed ?? false;

  // Listen to window scroll events
  useEffect(() => {
    if (isCompleted) return;

    const handleScroll = () => {
      lastScrollTimeRef.current = Date.now();
      setIsActiveScrolling(true);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Mark idle after 1.8 seconds of no scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        setIsActiveScrolling(false);
      }, 1800);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [isCompleted]);

  // Timer interval: only increments when user is actively scrolling
  useEffect(() => {
    if (isCompleted || !isActiveScrolling) return;

    const interval = setInterval(() => {
      // Ensure user scrolled in the last 2 seconds
      if (Date.now() - lastScrollTimeRef.current < 2000) {
        incrementScrollSeconds(1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActiveScrolling, isCompleted, incrementScrollSeconds]);

  // If already claimed, don't show the floating widget
  if (isClaimed) return null;

  const progressPct = Math.min(100, Math.round((currentSeconds / targetSeconds) * 100));

  return (
    <div className="fixed bottom-5 right-5 z-40 select-none">
      <AnimatePresence>
        {isMinimized ? (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setIsMinimized(false)}
            aria-label="Expand 30-second scroll quest tracker"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-accent)] bg-[var(--surface-solid)] shadow-[var(--shadow-lg)] backdrop-blur-md transition-transform hover:scale-105"
            style={{
              boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.25), inset 0 1px 0 var(--edge-specular)',
            }}
          >
            <Zap
              className={`h-5 w-5 ${isCompleted ? 'fill-current text-emerald-400' : 'fill-current text-amber-400'}`}
            />
          </motion.button>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="bg-[var(--surface-solid)]/95 flex items-center gap-3 rounded-2xl border border-[var(--border-default)] p-3 shadow-2xl backdrop-blur-xl transition-all duration-300"
            style={{
              boxShadow: '0 16px 36px -8px rgba(0, 0, 0, 0.35), inset 0 1px 0 var(--edge-specular)',
            }}
          >
            {/* Circular Progress Ring */}
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
              <svg className="h-10 w-10 -rotate-90 transform" viewBox="0 0 36 36">
                <path
                  className="text-[var(--surface-3)]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={isCompleted ? 'text-emerald-400' : 'text-amber-400'}
                  strokeDasharray={`${progressPct}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                {isCompleted ? (
                  <Sparkles className="h-4 w-4 animate-bounce text-emerald-400" />
                ) : (
                  <Zap className="h-4 w-4 animate-pulse fill-current text-amber-400" />
                )}
              </div>
            </div>

            {/* Quest Details & Action */}
            <div className="pr-1 text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-xs font-bold text-[var(--text-primary)]">
                  {isCompleted ? 'Explorer Quest Done!' : 'Feed Explorer Quest'}
                </span>
                <span className="py-0.2 rounded bg-amber-500/20 px-1 font-mono text-[10px] font-bold text-amber-400">
                  +20⚡
                </span>
              </div>

              {isCompleted ? (
                <button
                  onClick={() => claimTask('scroll_30s')}
                  className="mt-1 inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow-md shadow-emerald-500/30 transition-transform hover:scale-105"
                >
                  <Check className="h-3 w-3" />
                  <span>Claim +20 Energy</span>
                </button>
              ) : (
                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                  <span className="font-mono font-bold text-[var(--text-primary)]">
                    {currentSeconds}s / {targetSeconds}s
                  </span>
                  <span>{isActiveScrolling ? '• Scrolling active' : '• Scroll to explore'}</span>
                </div>
              )}
            </div>

            {/* Minimize button */}
            <button
              onClick={() => setIsMinimized(true)}
              aria-label="Minimize scroll quest widget"
              className="ml-1 rounded-lg p-1 text-[var(--text-tertiary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
