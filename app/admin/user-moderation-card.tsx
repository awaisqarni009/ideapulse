'use client';

import React, { useState } from 'react';
import { adminSuspendAccount } from '@/app/actions/moderation';
import { useToast } from '@/app/components/ui/toast';
import {
  Search,
  ShieldAlert,
  ShieldCheck,
  UserX,
  Clock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface ProfileItem {
  id: string;
  username: string | null;
  display_name: string | null;
  role: string | null;
  status?: string | null;
  suspended_until?: string | null;
  created_at: string;
}

interface UserModerationCardProps {
  initialProfiles: ProfileItem[];
}

export function UserModerationCard({ initialProfiles }: UserModerationCardProps) {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<ProfileItem | null>(null);
  const [reason, setReason] = useState('');
  const [durationDays, setDurationDays] = useState(14);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profiles, setProfiles] = useState<ProfileItem[]>(initialProfiles);

  const filteredProfiles = profiles.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.username && p.username.toLowerCase().includes(q)) ||
      (p.display_name && p.display_name.toLowerCase().includes(q)) ||
      p.id.toLowerCase().includes(q)
    );
  });

  async function handleSuspend(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;

    if (!reason || reason.trim().length < 5) {
      toast.error('Audit requires a written reason of at least 5 characters.', 'Validation');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminSuspendAccount({
        userId: selectedUser.id,
        durationDays,
        reason: reason.trim(),
      });

      if (res.success) {
        toast.success(
          res.message ||
            `Account @${selectedUser.username} suspended. Active cycle votes de-verified.`,
          'Account Suspended',
        );

        // Update local state
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === selectedUser.id
              ? {
                  ...p,
                  status: 'suspended',
                  suspended_until: new Date(Date.now() + durationDays * 86400000).toISOString(),
                }
              : p,
          ),
        );

        setSelectedUser(null);
        setReason('');
      } else {
        toast.error(res.error || 'Failed to suspend user', 'Error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unexpected error';
      toast.error(msg, 'Error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 shadow-xl backdrop-blur-md"
      style={{
        boxShadow: '0 20px 48px -12px rgba(0, 0, 0, 0.3), inset 0 1px 0 var(--edge-specular)',
      }}
    >
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--border-subtle)] pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-[var(--text-primary)]">
            <ShieldAlert className="h-4 w-4 text-[var(--accent-warning)]" />
            <span>Account Moderation & Anti-Sybil Control</span>
          </h2>
          <p className="text-xs text-[var(--text-tertiary)]">
            Search users, inspect verification status, and apply BR-004 vote-deverifying account
            suspensions.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-tertiary)]">
            <Search className="h-3.5 w-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username or ID..."
            className="w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] py-1.5 pl-8 pr-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--indigo)] focus:outline-none focus:ring-1 focus:ring-[var(--indigo)]"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="mt-4 max-h-[300px] divide-y divide-[var(--border-subtle)] overflow-y-auto">
        {filteredProfiles.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--text-tertiary)]">
            No accounts matching query &ldquo;{searchQuery}&rdquo;.
          </div>
        ) : (
          filteredProfiles.slice(0, 8).map((p) => {
            const isSuspended =
              p.status === 'suspended' ||
              (p.suspended_until && new Date(p.suspended_until) > new Date());

            return (
              <div
                key={p.id}
                className="hover:bg-[var(--surface-2)]/40 flex items-center justify-between rounded-lg px-2 py-3 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      {p.display_name || p.username || 'Anonymous User'}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--text-tertiary)]">
                      @{p.username || 'unnamed'}
                    </span>
                    <span
                      className={`py-0.2 rounded-[var(--radius-xs)] px-1.5 text-[10px] font-semibold uppercase ${
                        p.role === 'admin'
                          ? 'border border-amber-500/30 bg-amber-500/10 text-amber-400'
                          : 'border border-[var(--border-subtle)] bg-[var(--surface-3)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {p.role || 'member'}
                    </span>
                    {isSuspended && (
                      <span className="py-0.2 rounded-[var(--radius-xs)] border border-red-500/30 bg-red-500/10 px-1.5 text-[10px] font-semibold text-red-400">
                        SUSPENDED
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-[10px] text-[var(--text-tertiary)]">
                    ID: {p.id.slice(0, 16)}... • Joined{' '}
                    {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
                  </div>
                </div>

                <div>
                  {isSuspended ? (
                    <span className="text-xs font-medium text-red-400">Suspended</span>
                  ) : p.role === 'admin' ? (
                    <span className="text-xs font-medium text-[var(--text-tertiary)]">
                      Protected Admin
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedUser(p)}
                      className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] px-2.5 py-1 text-xs font-semibold text-[var(--accent-danger)] transition-all hover:bg-[rgba(239,68,68,0.2)]"
                    >
                      <UserX className="h-3 w-3" />
                      <span>Suspend</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Suspension Modal Popup */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 shadow-2xl"
            style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
          >
            <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Suspend Account: @{selectedUser.username}
                </h3>
                <p className="text-[11px] text-[var(--text-tertiary)]">
                  De-verifies all active-cycle votes per BR-004
                </p>
              </div>
            </div>

            <form onSubmit={handleSuspend} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--text-secondary)]">
                  Suspension Duration
                </label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] p-2 text-xs text-[var(--text-primary)]"
                >
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days (Standard)</option>
                  <option value={30}>30 Days (Severe Violation)</option>
                  <option value={365}>1 Year (Sybil / Ring Operator)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--text-secondary)]">
                  Audit Reason (Required for Admin Log)
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="State the observed abuse, sockpuppet pattern, or terms breach..."
                  required
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] p-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--indigo)] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[var(--border-subtle)] pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  disabled={isSubmitting}
                  className="rounded-[var(--radius-sm)] border border-[var(--border-default)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Suspending...</span>
                    </>
                  ) : (
                    <>
                      <UserX className="h-3 w-3" />
                      <span>Confirm Suspension</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
