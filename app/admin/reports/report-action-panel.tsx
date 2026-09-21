'use client';

import React, { useState } from 'react';
import { adminModerateReport } from '@/app/actions/reports';
import { useToast } from '@/app/components/ui/toast';
import { AlertCircle, CheckCircle2, Loader2, ShieldAlert, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReportActionPanelProps {
  ideaId: string;
  ideaTitle: string;
  currentStatus: string;
  reportCount: number;
}

export function ReportActionPanel({
  ideaId,
  ideaTitle,
  currentStatus,
  reportCount,
}: ReportActionPanelProps) {
  const toast = useToast();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState<'dismiss' | 'remove'>('dismiss');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function openModal(selectedAction: 'dismiss' | 'remove') {
    setAction(selectedAction);
    setReason('');
    setIsOpen(true);
  }

  async function handleModerate(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      toast.error('Written reason must be at least 5 characters.', 'Validation');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminModerateReport({
        ideaId,
        action,
        reason: reason.trim(),
      });

      if (res.success) {
        toast.success(
          res.message || 'Moderation decision recorded successfully.',
          'Action Completed',
        );
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to apply moderation action.', 'Error');
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
          className="btn inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.08)] px-2.5 py-1 text-xs font-medium text-[var(--accent-success)] transition-colors hover:bg-[rgba(52,211,153,0.16)]"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Dismiss
        </button>

        <button
          type="button"
          onClick={() => openModal('remove')}
          className="btn inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] px-2.5 py-1 text-xs font-medium text-[var(--accent-danger)] transition-colors hover:bg-[rgba(239,68,68,0.16)]"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove Idea
        </button>
      </div>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mod-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={() => !isSubmitting && setIsOpen(false)}
            className="bg-[var(--canvas-deep)]/80 fixed inset-0 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Surface */}
          <div className="relative w-full max-w-lg rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-3)] p-6 shadow-2xl backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="absolute right-4 top-4 rounded-[var(--radius-sm)] p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--radius-md)] border ${
                  action === 'remove'
                    ? 'border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] text-[var(--accent-danger)]'
                    : 'border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.1)] text-[var(--accent-success)]'
                }`}
              >
                {action === 'remove' ? (
                  <ShieldAlert className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </div>
              <div>
                <h2
                  id="mod-modal-title"
                  className="text-base font-semibold text-[var(--text-primary)]"
                >
                  {action === 'remove' ? 'Remove Idea for Policy Violation' : 'Dismiss Reports'}
                </h2>
                <p className="mt-1 line-clamp-1 text-xs text-[var(--text-secondary)]">
                  &ldquo;{ideaTitle}&rdquo; ({reportCount} reports · current status: {currentStatus}
                  )
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3 text-xs text-[var(--text-secondary)]">
              {action === 'remove' ? (
                <p className="text-[11px] leading-relaxed text-[var(--accent-danger)]">
                  The idea will be marked <strong>removed</strong>. Voting will permanently stop and
                  it will be hidden from the community feed. An audit row will be permanently
                  written to <code>admin_actions</code>.
                </p>
              ) : (
                <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
                  Pending reports will be marked <strong>dismissed</strong>. If the idea is
                  currently in <code>under_review</code>, it will be restored to{' '}
                  <code>published</code>.
                </p>
              )}
            </div>

            <form onSubmit={handleModerate} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="moderation-reason"
                  className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
                >
                  Operator Written Reason (Required, min 5 chars)
                </label>
                <textarea
                  id="moderation-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    action === 'remove'
                      ? 'Specify community guideline violation (e.g. verified plagiarism of external IP)...'
                      : 'State reason for dismissal (e.g. verified false spam reports, content compliant)...'
                  }
                  rows={3}
                  required
                  className="mt-1.5 w-full resize-none rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--indigo)] focus:outline-none focus:ring-1 focus:ring-[var(--indigo)]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="btn rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || reason.trim().length < 5}
                  className={`btn inline-flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2 text-xs font-semibold text-white shadow-lg disabled:opacity-50 ${
                    action === 'remove'
                      ? 'bg-[var(--accent-danger)] shadow-red-500/20 hover:bg-red-600'
                      : 'bg-[var(--accent-success)] shadow-emerald-500/20 hover:bg-emerald-600'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : action === 'remove' ? (
                    'Confirm Remove'
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
