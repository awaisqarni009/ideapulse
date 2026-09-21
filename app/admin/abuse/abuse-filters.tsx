'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, RotateCcw, Search } from 'lucide-react';

const ABUSE_KINDS = [
  { value: 'all', label: 'All Event Kinds' },
  { value: 'self_vote_attempt', label: 'Self Vote Attempt' },
  { value: 'duplicate_vote_attempt', label: 'Duplicate Vote Attempt' },
  { value: 'vote_quota_exceeded', label: 'Vote Quota Exceeded' },
  { value: 'submit_quota_exceeded', label: 'Submit Quota Exceeded' },
  { value: 'unconfirmed_write_attempt', label: 'Unconfirmed Write Attempt' },
  { value: 'suspended_write_attempt', label: 'Suspended Write Attempt' },
  { value: 'closed_idea_vote_attempt', label: 'Closed Idea Vote Attempt' },
  { value: 'rate_limit_tripped', label: 'Rate Limit Tripped' },
];

export function AbuseFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentKind = searchParams.get('kind') || 'all';
  const currentActor = searchParams.get('actor') || '';

  const [kind, setKind] = useState(currentKind);
  const [actor, setActor] = useState(currentActor);

  function applyFilters(newKind = kind, newActor = actor) {
    const params = new URLSearchParams();
    if (newKind && newKind !== 'all') params.set('kind', newKind);
    if (newActor.trim()) params.set('actor', newActor.trim());

    const qs = params.toString();
    router.push(`/admin/abuse${qs ? `?${qs}` : ''}`);
  }

  function handleReset() {
    setKind('all');
    setActor('');
    router.push('/admin/abuse');
  }

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-1)] p-3 sm:flex-row sm:items-center">
      {/* Event Kind Selector */}
      <div className="flex flex-1 items-center gap-2">
        <Filter className="h-4 w-4 flex-shrink-0 text-[var(--text-tertiary)]" />
        <select
          value={kind}
          onChange={(e) => {
            setKind(e.target.value);
            applyFilters(e.target.value, actor);
          }}
          className="w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:border-[var(--indigo)] focus:outline-none"
        >
          {ABUSE_KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
      </div>

      {/* Actor ID / Username Input */}
      <div className="flex flex-1 items-center gap-2">
        <Search className="h-4 w-4 flex-shrink-0 text-[var(--text-tertiary)]" />
        <input
          type="text"
          value={actor}
          onChange={(e) => setActor(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') applyFilters(kind, actor);
          }}
          placeholder="Filter by Actor UUID or username..."
          className="w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--indigo)] focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => applyFilters(kind, actor)}
          className="btn rounded-[var(--radius-md)] bg-[var(--indigo)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--indigo-bright)]"
        >
          Filter
        </button>

        {(kind !== 'all' || actor) && (
          <button
            type="button"
            onClick={handleReset}
            className="btn inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] px-2.5 py-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            title="Reset filters"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
