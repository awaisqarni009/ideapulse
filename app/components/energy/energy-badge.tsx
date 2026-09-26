'use client';

import React from 'react';
import { useEnergy } from '@/lib/energy/energy-context';
import { Zap, Sparkles } from 'lucide-react';

interface EnergyBadgeProps {
  className?: string;
}

export function EnergyBadge({ className = '' }: EnergyBadgeProps) {
  const { energy, maxEnergy, hasUnclaimedRewards, isHubOpen, setIsHubOpen } = useEnergy();

  return (
    <button
      type="button"
      onClick={() => setIsHubOpen(!isHubOpen)}
      title="Voting Energy & Daily Quests Hub"
      aria-label={`Voting Energy: ${energy} of ${maxEnergy}. Click to open daily quests.`}
      className={`group relative flex h-[32px] items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 shadow-sm transition-all hover:border-amber-500/50 hover:bg-amber-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:h-[36px] sm:px-3 ${className}`}
      style={{
        boxShadow: 'inset 0 1px 0 var(--edge-specular)',
      }}
    >
      <Zap className="h-3.5 w-3.5 fill-amber-400 text-amber-400 transition-transform group-hover:scale-110" />

      <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
        {energy}
        <span className="hidden text-[10px] text-[var(--text-tertiary)] sm:inline">⚡</span>
      </span>

      {/* Unclaimed Rewards Notification Indicator */}
      {hasUnclaimedRewards && (
        <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-white">
            !
          </span>
        </span>
      )}
    </button>
  );
}
