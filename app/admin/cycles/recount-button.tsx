'use client';

import React, { useState } from 'react';
import { adminRecountCycle } from '@/app/actions/moderation';
import { useToast } from '@/app/components/ui/toast';
import { CheckCircle2, Loader2, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RecountButtonProps {
  cycleId: string;
  cycleNumber: number;
}

export function RecountButton({ cycleId, cycleNumber }: RecountButtonProps) {
  const toast = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRecount() {
    setIsSubmitting(true);
    try {
      const res = await adminRecountCycle(
        cycleId,
        `Administrative recount and standings audit for Cycle ${cycleNumber}`,
      );
      if (res.success) {
        toast.success(res.message || `Cycle ${cycleNumber} recount completed.`, 'Recount Complete');
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to complete recount', 'Error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unexpected error';
      toast.error(msg, 'Error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRecount}
      disabled={isSubmitting}
      className="btn inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[rgba(245,158,11,0.4)] bg-[rgba(245,158,11,0.12)] px-2.5 py-1 text-xs font-semibold text-[var(--accent-warning)] hover:bg-[rgba(245,158,11,0.2)] disabled:opacity-50"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Recounting...
        </>
      ) : (
        <>
          <RotateCcw className="h-3.5 w-3.5" />
          Recount &amp; Finalize
        </>
      )}
    </button>
  );
}
