'use client';

import React, { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { castVoteAction } from '@/app/actions/votes';
import { useToast } from '@/app/components/ui/toast';
import { X, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useFocusTrap } from '@/lib/hooks/use-focus-trap';
import Link from 'next/link';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingIdeaId?: string;
  onVoteReplayed?: () => void;
}

/**
 * AuthModal per DESIGN.md §7.9 and TASKS.md [T-3.19, AC-06.2, T-7.17]
 * Triggered on anonymous vote click. Prompts sign-in and replays the intended vote.
 */
export function AuthModal({ isOpen, onClose, pendingIdeaId, onVoteReplayed }: AuthModalProps) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const modalRef = useFocusTrap<HTMLDivElement>({
    isOpen,
    onClose,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message || 'Invalid email or password.');
          return;
        }

        // Replay intended vote if pendingIdeaId is provided [T-3.19, AC-06.2]
        if (pendingIdeaId) {
          const voteResult = await castVoteAction(pendingIdeaId);
          if (voteResult.success) {
            toast.success('Signed in and your vote was cast!', 'Vote Replayed');
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('ideapulse:vote-update', {
                  detail: { action: 'vote', ideaId: pendingIdeaId },
                }),
              );
            }
            if (onVoteReplayed) onVoteReplayed();
          } else {
            toast.warning(`Signed in, but vote could not be cast: ${voteResult.error.message}`);
          }
        } else {
          toast.success('Signed in successfully!', 'Welcome Back');
        }

        onClose();
        // Force refresh to reload session and server state
        window.location.reload();
      } catch (err: any) {
        setErrorMsg(err?.message || 'Authentication failed. Please try again.');
      }
    });
  };

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      >
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-[var(--blur-sm)]"
        />

        {/* Modal Panel (L4 glass, radius-xl) */}
        <motion.div
          ref={modalRef}
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel relative w-full max-w-md overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-4)] p-7 shadow-2xl"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 var(--edge-specular)',
          }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute right-5 top-5 rounded-full p-1.5 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-accent)] bg-gradient-to-br from-[var(--indigo)] to-[var(--violet)] shadow-[var(--glow-indigo-sm)]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2
                id="auth-modal-title"
                className="font-display text-lg font-bold tracking-tight text-[var(--text-primary)]"
              >
                Sign in to vote
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Cast your vote and join the decision
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-[var(--text-tertiary)]">
            Every voice shapes the cycle. Sign in to your IdeaPulse account — your vote will be
            replayed automatically upon sign-in.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {errorMsg && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-[var(--radius-xs)] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] p-3 text-xs text-[var(--accent-danger)]"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="modal-email"
                className="block text-xs font-medium text-[var(--text-secondary)]"
              >
                Email
              </label>
              <input
                id="modal-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="mt-1.5 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-2)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--border-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--indigo-bright)]"
              />
            </div>

            <div>
              <label
                htmlFor="modal-password"
                className="block text-xs font-medium text-[var(--text-secondary)]"
              >
                Password
              </label>
              <input
                id="modal-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="mt-1.5 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-2)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--border-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--indigo-bright)]"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-accent)] bg-gradient-to-r from-[var(--indigo)] to-[var(--indigo-deep)] py-2.5 text-xs font-semibold text-white shadow-[var(--glow-indigo-sm)] transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in & casting vote...</span>
                </>
              ) : (
                <span>Sign In & Replay Vote</span>
              )}
            </button>
          </form>

          {/* Footer link to full register */}
          <div className="mt-5 border-t border-[var(--border-subtle)] pt-4 text-center text-xs text-[var(--text-tertiary)]">
            Don&apos;t have an account yet?{' '}
            <Link
              href={`/register?next=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/')}`}
              onClick={onClose}
              className="font-medium text-[var(--indigo-bright)] hover:underline"
            >
              Create an account →
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
