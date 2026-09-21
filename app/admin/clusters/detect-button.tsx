'use client';

import React, { useState } from 'react';
import { adminRunRingDetection } from '@/app/actions/moderation';
import { useToast } from '@/app/components/ui/toast';
import { Loader2, Play, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DetectRingsButton() {
  const toast = useToast();
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);

  async function handleRun() {
    setIsRunning(true);
    try {
      const res = await adminRunRingDetection();
      if (res.success) {
        toast.success(
          res.message || 'Ring detection algorithm evaluated active cycle voters.',
          'Algorithm Run Complete',
        );
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to execute ring detection', 'Error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unexpected error';
      toast.error(msg, 'Error');
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRun}
      disabled={isRunning}
      className="btn inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--indigo)] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-[var(--indigo-bright)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo)] disabled:opacity-50"
    >
      {isRunning ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Running Analysis...
        </>
      ) : (
        <>
          <Sparkles className="h-3.5 w-3.5" />
          Run Ring Detection Job
        </>
      )}
    </button>
  );
}
