'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

interface CycleSweepProps {
  cycleId: string;
  isFinalized: boolean;
  hasQualifiers: boolean;
}

/**
 * CycleSweep Component [T-5.10, DESIGN.md §6.4]
 * One-time celebration: qualified rows sweep a soft violet highlight left-to-right,
 * 900 ms, once per user per cycle. Stored in localStorage so it never repeats.
 */
export function CycleSweep({ cycleId, isFinalized, hasQualifiers }: CycleSweepProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isSweeping, setIsSweeping] = useState(false);

  useEffect(() => {
    if (!isFinalized || !hasQualifiers || shouldReduceMotion) return;

    const storageKey = `ideapulse:sweep_celebration:${cycleId}`;
    const alreadyCelebrated = localStorage.getItem(storageKey);

    if (!alreadyCelebrated) {
      setIsSweeping(true);
      localStorage.setItem(storageKey, 'true');

      const timer = setTimeout(() => {
        setIsSweeping(false);
      }, 950);

      return () => clearTimeout(timer);
    }
  }, [cycleId, isFinalized, hasQualifiers, shouldReduceMotion]);

  if (!isSweeping) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <div className="animate-sweep-celebration absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(139,92,246,0.18)] to-transparent" />
    </div>
  );
}
