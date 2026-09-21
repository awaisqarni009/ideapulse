'use client';

import React, { useState } from 'react';
import { Search, Hash, ArrowUpRight } from 'lucide-react';

interface QuickLink {
  id: string;
  title: string;
  category: string;
}

const POPULAR_RULES: QuickLink[] = [
  { id: 'BR-001', title: 'Account required to write', category: 'Identity' },
  { id: 'BR-010', title: '5 votes per rolling 24 hours', category: 'Voting' },
  { id: 'BR-011', title: 'One vote per idea', category: 'Voting' },
  { id: 'BR-012', title: 'Self-voting forbidden', category: 'Voting' },
  { id: 'BR-014', title: '10-minute retraction window', category: 'Voting' },
  { id: 'BR-020', title: 'One idea per 7 days', category: 'Ideas' },
  { id: 'BR-022', title: 'Locked on first vote', category: 'Ideas' },
  { id: 'BR-045', title: '50 verified votes qualification', category: 'Cycles' },
];

export function RulesSearch() {
  const [filter, setFilter] = useState('');

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="glass-panel mb-10 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-5 backdrop-blur-[var(--blur-md)]">
      <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--text-tertiary)]">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Quick jump by rule ID (e.g. BR-010) or keyword..."
            aria-label="Filter rules"
            className="w-full rounded-xl border border-[var(--edge-subtle)] bg-[var(--surface-2)] py-2 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] shadow-inner transition-all focus:outline-none focus:ring-2 focus:ring-[var(--indigo-bright)]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs text-[var(--text-tertiary)]">Jump to:</span>
          {POPULAR_RULES.map((rule) => (
            <button
              key={rule.id}
              onClick={() => handleScrollTo(rule.id)}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)] px-2.5 py-1 font-mono text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--indigo-bright)] hover:text-[var(--indigo-bright)]"
            >
              <span>{rule.id}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
