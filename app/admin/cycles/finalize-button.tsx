'use client';

import React, { useState } from 'react';
import { adminFinalizeActiveCycle } from '@/app/actions/reports';
import { useToast } from '@/app/components/ui/toast';
import { AlertOctagon, CheckCircle2, Loader2, PlayCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FinalizeButtonProps {
  cycleNumber: number;
  qualifyingCount: number;
}

export function ManualFinalizeButton({ cycleNumber, qualifyingCount }: FinalizeButtonProps) {
  const toast = useToast();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleFinalize(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await adminFinalizeActiveCycle(
        reason.trim() || `Manual operator finalization of Cycle ${cycleNumber}`,
      );

      if (res.success) {
        toast.success(
          res.message || `Cycle ${cycleNumber} successfully finalized!`,
          'Cycle Rotated',
        );
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to finalize cycle', 'Error');
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
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.12)] px-4 py-2 text-xs font-semibold text-[var(--accent-danger)] shadow-sm transition-all hover:border-[rgba(239,68,68,0.5)] hover:bg-[rgba(239,68,68,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-danger)]"
      >
        <PlayCircle className="h-4 w-4" />
        Manually Finalize Cycle
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="finalize-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={() => !isSubmitting && setIsOpen(false)}
            className="bg-[var(--canvas-deep)]/80 fixed inset-0 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Surface */}
          <div className="relative w-full max-w-lg rounded-[var(--radius-xl)] border border-[rgba(239,68,68,0.3)] bg-[var(--surface-3)] p-6 shadow-2xl backdrop-blur-xl">
            {/* Specular highlight */}
            <div
              className="pointer-events-none absolute inset-0 rounded-[var(--radius-xl)] shadow-[inset_0_1px_0_var(--edge-specular)]"
              aria-hidden="true"
            />

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="absolute right-4 top-4 rounded-[var(--radius-sm)] p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] text-[var(--accent-danger)]">
                <AlertOctagon className="h-5 w-5" />
              </div>
              <div>
                <h2
                  id="finalize-dialog-title"
                  className="text-base font-semibold text-[var(--text-primary)]"
                >
                  Confirm Manual Finalization
                </h2>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  You are about to finalize{' '}
                  <strong className="text-[var(--text-primary)]">Cycle {cycleNumber}</strong>{' '}
                  immediately.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3 text-xs text-[var(--text-secondary)]">
              <div className="flex items-center justify-between font-medium">
                <span>Qualifying Ideas:</span>
                <span className="text-[var(--accent-violet)]">{qualifyingCount}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[var(--text-tertiary)]">
                This action will atomically freeze voting, calculate final ranks, generate rewards
                for qualifiers, and open the next weekly cycle. This action will be audited in{' '}
                <code className="font-mono text-[var(--accent-cyan)]">admin_actions</code>.
              </p>
            </div>

            <form onSubmit={handleFinalize} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="finalize-reason"
                  className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
                >
                  Reason / Operator Note (Required)
                </label>
                <textarea
                  id="finalize-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Early finalization due to scheduled platform maintenance..."
                  rows={2}
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
                  disabled={isSubmitting || !reason.trim()}
                  className="btn inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent-danger)] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-red-500/20 hover:bg-red-600 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Finalizing...
                    </>
                  ) : (
                    'Confirm Finalize'
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
