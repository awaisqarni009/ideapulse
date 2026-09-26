'use client';

import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  Users,
  Activity,
  Shield,
  Layers,
  ChevronRight,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface AdminTabsContainerProps {
  cyclesContent: React.ReactNode;
  ideasContent: React.ReactNode;
  usersContent: React.ReactNode;
  telemetryContent: React.ReactNode;
  counts: {
    activeCycleNumber?: number;
    ideasCount: number;
    pendingIdeasCount: number;
    usersCount: number;
    abuseCount: number;
  };
}

export function AdminTabsContainer({
  cyclesContent,
  ideasContent,
  usersContent,
  telemetryContent,
  counts,
}: AdminTabsContainerProps) {
  const [activeTab, setActiveTab] = useState<'cycles' | 'ideas' | 'users' | 'telemetry'>('cycles');

  const tabs = [
    {
      id: 'cycles' as const,
      label: 'Cycle Operations',
      icon: Clock,
      badge: counts.activeCycleNumber ? `Cycle #${counts.activeCycleNumber}` : 'Idle',
      badgeColor: counts.activeCycleNumber
        ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
        : 'text-zinc-400 bg-zinc-500/10',
      description: 'Start cycle, duration, cycle number, stop/finalize',
    },
    {
      id: 'ideas' as const,
      label: 'Ideas & Votes Moderation',
      icon: Sparkles,
      badge:
        counts.pendingIdeasCount > 0
          ? `${counts.pendingIdeasCount} Needs Review`
          : `${counts.ideasCount} Ideas`,
      badgeColor:
        counts.pendingIdeasCount > 0
          ? 'text-amber-400 bg-amber-500/10 border-amber-500/30 font-bold'
          : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      description: 'Approve, decline, monitor verified vs total votes',
    },
    {
      id: 'users' as const,
      label: 'Users & Roles',
      icon: Users,
      badge: `${counts.usersCount} Users`,
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      description: 'Add user, remove user, promote roles, suspend',
    },
    {
      id: 'telemetry' as const,
      label: '3D Telemetry & Logs',
      icon: Activity,
      badge: `${counts.abuseCount} Events`,
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      description: 'Live 3D security radar, cluster inspection, audit log',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation Pill Bar */}
      <div
        className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-2 shadow-xl backdrop-blur-md"
        style={{
          boxShadow: '0 12px 36px -10px rgba(0, 0, 0, 0.4), inset 0 1px 0 var(--edge-specular)',
        }}
      >
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-start gap-1 rounded-xl p-3 text-left transition-all ${
                  isActive
                    ? 'border-[var(--indigo)]/50 border bg-[var(--surface-2)] shadow-md shadow-indigo-500/10'
                    : 'hover:bg-[var(--surface-2)]/50 border border-transparent bg-transparent'
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${
                        isActive
                          ? 'border-[var(--indigo)]/50 bg-[var(--indigo)]/20 text-[var(--indigo-bright)]'
                          : 'border-[var(--border-subtle)] bg-[var(--surface-3)] text-[var(--text-tertiary)]'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span
                      className={`font-display text-xs font-bold transition-colors ${
                        isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {tab.label}
                    </span>
                  </div>

                  <span
                    className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                </div>
                <span className="hidden text-[11px] text-[var(--text-tertiary)] sm:inline-block">
                  {tab.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'cycles' && (
          <div className="animate-in fade-in duration-200">{cyclesContent}</div>
        )}

        {activeTab === 'ideas' && (
          <div className="animate-in fade-in duration-200">{ideasContent}</div>
        )}

        {activeTab === 'users' && (
          <div className="animate-in fade-in duration-200">{usersContent}</div>
        )}

        {activeTab === 'telemetry' && (
          <div className="animate-in fade-in duration-200">{telemetryContent}</div>
        )}
      </div>
    </div>
  );
}
