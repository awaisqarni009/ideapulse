'use client';

import React, { useState } from 'react';
import { adminResolveCluster, adminSuspendAccount } from '@/app/actions/moderation';
import { useToast } from '@/app/components/ui/toast';
import { AlertTriangle, CheckCircle2, Loader2, ShieldBan, UserX, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ClusterActionPanelProps {
  clusterId: string;
  accountA: { id: string; username: string };
  accountB: { id: string; username: string };
  jaccard: number;
}

export function ClusterActionPanel({
  clusterId,
  accountA,
  accountB,
  jaccard,
}: ClusterActionPanelProps) {
  const toast = useToast();
  const router = useRouter();
  const [modalMode, setModalMode] = useState<'dismiss' | 'suspend' | null>(null);
  const [targetAccount, setTargetAccount] = useState<'both' | 'a' | 'b'>('both');
  const [durationDays, setDurationDays] = useState(14);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function openModal(mode: 'dismiss' | 'suspend') {
    setModalMode(mode);
    setNote('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim() || note.trim().length < 5) {
      toast.error('Written reason must be at least 5 characters.', 'Validation');
      return;
    }

    setIsSubmitting(true);
    try {
      if (modalMode === 'dismiss') {
        const res = await adminResolveCluster({
          clusterId,
          action: 'dismissed',
          note: note.trim(),
        });
        if (res.success) {
          toast.success(res.message || 'Cluster dismissed.', 'Dismissed');
          setModalMode(null);
          router.refresh();
        } else {
          toast.error(res.error || 'Failed to dismiss cluster', 'Error');
        }
      } else if (modalMode === 'suspend') {
        const accountsToSuspend: string[] = [];
        if (targetAccount === 'a' || targetAccount === 'both') accountsToSuspend.push(accountA.id);
        if (targetAccount === 'b' || targetAccount === 'both') accountsToSuspend.push(accountB.id);

        for (const uid of accountsToSuspend) {
          const res = await adminSuspendAccount({
            userId: uid,
            durationDays,
            reason: note.trim(),
          });
          if (!res.success) {
            toast.error(res.error || `Failed to suspend user ${uid}`, 'Error');
            setIsSubmitting(false);
            return;
          }
        }

        await adminResolveCluster({
          clusterId,
          action: 'actioned',
          note: `Suspended ${targetAccount === 'both' ? 'both accounts' : 'flagged account'}: ${note.trim()}`,
        });

        toast.success(
          'Account(s) suspended and active-cycle votes de-verified (BR-004).',
          'Action Completed',
        );
        setModalMode(null);
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unexpected error';
      toast.error(msg, 'Error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => openModal('dismiss')}
          className="btn inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.08)] px-2.5 py-1 text-xs font-medium text-[var(--accent-success)] hover:bg-[rgba(52,211,153,0.16)]"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Dismiss
        </button>

        <button
          type="button"
          onClick={() => openModal('suspend')}
          className="btn inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] px-2.5 py-1 text-xs font-medium text-[var(--accent-danger)] hover:bg-[rgba(239,68,68,0.16)]"
        >
          <ShieldBan className="h-3.5 w-3.5" />
          Suspend Ring
        </button>
      </div>

      {modalMode && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={() => !isSubmitting && setModalMode(null)}
            className="bg-[var(--canvas-deep)]/80 fixed inset-0 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-3)] p-6 shadow-2xl backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setModalMode(null)}
              disabled={isSubmitting}
              className="absolute right-4 top-4 rounded-[var(--radius-sm)] p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--radius-md)] border ${
                  modalMode === 'suspend'
                    ? 'border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] text-[var(--accent-danger)]'
                    : 'border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.1)] text-[var(--accent-success)]'
                }`}
              >
                {modalMode === 'suspend' ? (
                  <UserX className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  {modalMode === 'suspend' ? 'Suspend Ring Accounts' : 'Dismiss Cluster'}
                </h3>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  @{accountA.username} &amp; @{accountB.username} ({(jaccard * 100).toFixed(0)}%
                  overlap)
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {modalMode === 'suspend' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                      Target Account(s)
                    </label>
                    <div className="mt-1.5 grid grid-cols-3 gap-2">
                      {[
                        { val: 'both', label: 'Both' },
                        { val: 'a', label: `@${accountA.username}` },
                        { val: 'b', label: `@${accountB.username}` },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setTargetAccount(opt.val as any)}
                          className={`rounded-[var(--radius-md)] border p-2 text-center text-xs transition-colors ${
                            targetAccount === opt.val
                              ? 'border-[var(--accent-danger)] bg-[rgba(239,68,68,0.12)] font-semibold text-[var(--accent-danger)]'
                              : 'border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="suspension-days"
                      className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
                    >
                      Duration (Days)
                    </label>
                    <select
                      id="suspension-days"
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--text-primary)]"
                    >
                      <option value={7}>7 Days</option>
                      <option value={14}>14 Days (Default)</option>
                      <option value={30}>30 Days</option>
                      <option value={90}>90 Days</option>
                      <option value={365}>1 Year</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label
                  htmlFor="action-note"
                  className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
                >
                  Operator Written Reason (Required, min 5 chars)
                </label>
                <textarea
                  id="action-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    modalMode === 'suspend'
                      ? 'Specify evidence of coordinated ring voting (e.g. 85% overlap with automated timing)...'
                      : 'State reason for dismissal (e.g. legitimate organic overlap, study group)...'
                  }
                  rows={3}
                  required
                  className="mt-1.5 w-full resize-none rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--indigo)] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  disabled={isSubmitting}
                  className="btn rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] px-4 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || note.trim().length < 5}
                  className={`btn inline-flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 ${
                    modalMode === 'suspend'
                      ? 'bg-[var(--accent-danger)] shadow-lg shadow-red-500/20 hover:bg-red-600'
                      : 'bg-[var(--accent-success)] shadow-lg shadow-emerald-500/20 hover:bg-emerald-600'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Processing...
                    </>
                  ) : modalMode === 'suspend' ? (
                    'Confirm Suspension'
                  ) : (
                    'Confirm Dismiss'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
