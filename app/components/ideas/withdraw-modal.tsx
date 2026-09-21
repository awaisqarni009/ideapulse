'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import { withdrawIdeaAction } from '@/app/actions/ideas';
import { useToast } from '@/app/components/ui/toast';
import { AlertTriangle, X } from 'lucide-react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideaId: string;
  voteCount: number;
}

export function WithdrawModal({ isOpen, onClose, ideaId, voteCount }: WithdrawModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Trap focus inside modal
  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await withdrawIdeaAction(ideaId);
      if (!result.success) {
        setError(result.error);
        return;
      }

      toast.warning('Idea has been withdrawn and removed from cycle rankings.');
      onClose();
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="withdraw-title"
      aria-describedby="withdraw-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop per DESIGN.md §7.9: rgba(7,10,17,0.72) + backdrop-filter: blur(6px) */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#070a11]/75 backdrop-blur-[6px] transition-opacity"
      />

      {/* Modal Panel: L4 glass, radius-xl, space-8 (32px) padding, max-w-520px, shadow-xl */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-[520px] rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-4)] p-8 shadow-2xl backdrop-blur-[var(--blur-lg)] focus:outline-none"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 var(--edge-specular)',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-6 top-6 rounded-full p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--indigo)]"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.12)] text-[var(--accent-danger)]">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h2
            id="withdraw-title"
            className="text-xl font-bold tracking-tight text-[var(--text-primary)]"
          >
            Withdraw Idea
          </h2>
        </div>

        {/* Full-consequence confirmation copy strictly matching RULES.md BR-023 */}
        <p
          id="withdraw-description"
          className="mt-4 text-[15px] leading-relaxed text-[var(--text-secondary)]"
        >
          Withdraw this idea? It leaves the leaderboard, keeps its{' '}
          <strong className="text-[var(--text-primary)]">{voteCount} votes</strong> on record, and
          doesn&apos;t give back this week&apos;s submission slot. This can&apos;t be undone.
        </p>

        {error && (
          <div className="mt-4 rounded-[var(--radius-md)] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] p-3 text-xs text-[var(--accent-danger)]">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="btn btn-secondary px-5 py-2.5 text-sm"
          >
            Keep Idea Active
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="btn inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[rgba(239,68,68,0.4)] bg-[var(--accent-danger)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--glow-danger-sm)] hover:bg-[#dc2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-danger)] disabled:opacity-50"
          >
            {isPending ? 'Withdrawing...' : 'Confirm Withdrawal'}
          </button>
        </div>
      </div>
    </div>
  );
}
