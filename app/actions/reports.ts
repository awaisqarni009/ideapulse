'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/user';
import { revalidatePath } from 'next/cache';

export type ReportReason =
  'spam' | 'duplicate' | 'offensive' | 'plagiarism' | 'vote_manipulation' | 'other';

export const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  {
    value: 'spam',
    label: 'Spam or Advertising',
    description: 'Promotional spam, link dumping, or irrelevant commercial content',
  },
  {
    value: 'duplicate',
    label: 'Duplicate Idea',
    description: 'Substantially identical to an existing idea submitted in the platform',
  },
  {
    value: 'offensive',
    label: 'Offensive or Inappropriate',
    description: 'Harassment, hate speech, abusive language, or prohibited themes',
  },
  {
    value: 'plagiarism',
    label: 'Plagiarism / Theft',
    description: 'Copied wholesale without attribution from another builder or source',
  },
  {
    value: 'vote_manipulation',
    label: 'Vote Manipulation',
    description: 'Suspected sockpuppets, bot voting, or reciprocal vote trading rings',
  },
  {
    value: 'other',
    label: 'Other Policy Violation',
    description: 'Other issues violating community guidelines or platform rules',
  },
];

interface ReportIdeaInput {
  ideaId: string;
  reason: ReportReason;
  detail?: string;
  slug?: string;
}

export interface ReportIdeaResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Server action to file a report against an idea (T-6.1, BR-037).
 * Enforces authenticated + writable status, validates reasons, and handles one-report-per-user constraint.
 */
export async function reportIdea(input: ReportIdeaInput): Promise<ReportIdeaResult> {
  const { user, isWritable } = await getCurrentUser();

  if (!user) {
    return {
      success: false,
      error: 'Sign in to report an idea.',
    };
  }

  if (!isWritable) {
    return {
      success: false,
      error: 'Please confirm your email before reporting content.',
    };
  }

  if (!input.ideaId) {
    return {
      success: false,
      error: 'Invalid idea specified.',
    };
  }

  const validReasons = REPORT_REASONS.map((r) => r.value);
  if (!validReasons.includes(input.reason)) {
    return {
      success: false,
      error: 'Please select a valid report reason.',
    };
  }

  const detailText = input.detail ? input.detail.trim().slice(0, 500) : null;

  const supabase = await createClient();

  const { error } = await supabase.from('reports').insert({
    idea_id: input.ideaId,
    reporter_id: user.id,
    reason: input.reason,
    detail: detailText,
  });

  if (error) {
    // Unique violation: user has already reported this idea
    if (error.code === '23505') {
      return {
        success: false,
        error: 'You have already reported this idea.',
      };
    }

    console.error('[reportIdea] Database error inserting report:', error);
    return {
      success: false,
      error: error.message || 'Unable to submit report. Please try again.',
    };
  }

  if (input.slug) {
    revalidatePath(`/idea/${input.slug}`);
  }
  revalidatePath('/feed');

  return {
    success: true,
    message: 'Report submitted. Thank you for helping keep IdeaPulse safe.',
  };
}

interface ModerateReportInput {
  ideaId: string;
  action: 'dismiss' | 'remove';
  reason: string;
}

/**
 * Admin action to resolve or dismiss reports on an idea (T-6.5).
 * Calls the atomic moderate_idea_report RPC which writes to admin_actions.
 */
export async function adminModerateReport(input: ModerateReportInput): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  const { user, isAdmin } = await getCurrentUser();

  if (!user || !isAdmin) {
    return {
      success: false,
      error: 'Unauthorized: Administrator privileges required.',
    };
  }

  if (!input.reason || input.reason.trim().length < 5) {
    return {
      success: false,
      error: 'A written reason of at least 5 characters is required for administrative audit.',
    };
  }

  if (input.action !== 'dismiss' && input.action !== 'remove') {
    return {
      success: false,
      error: 'Invalid moderation action.',
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc('moderate_idea_report', {
    p_idea_id: input.ideaId,
    p_action: input.action,
    p_reason: input.reason.trim(),
  });

  if (error) {
    console.error('[adminModerateReport] RPC error:', error);
    return {
      success: false,
      error: error.message || 'Failed to apply moderation action.',
    };
  }

  revalidatePath('/admin/reports');
  revalidatePath('/feed');

  return {
    success: true,
    message:
      input.action === 'remove'
        ? 'Idea removed and reports resolved successfully.'
        : 'Reports dismissed and idea restored if under review.',
  };
}

/**
 * Admin action to manually finalize the active cycle (T-6.4).
 * Enforces admin authorization and records to admin_actions.
 */
export async function adminFinalizeActiveCycle(reason?: string): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  const { user, isAdmin } = await getCurrentUser();

  if (!user || !isAdmin) {
    return {
      success: false,
      error: 'Unauthorized: Administrator privileges required.',
    };
  }

  const supabase = await createClient();

  // 1. Fetch current active cycle ID
  const { data: activeCycle, error: cycleErr } = await supabase
    .from('cycles')
    .select('id, cycle_number')
    .eq('status', 'active')
    .maybeSingle();

  if (cycleErr || !activeCycle) {
    return {
      success: false,
      error: 'No active cycle found to finalize.',
    };
  }

  // 2. Call rotate_cycle RPC
  const { error: rotateErr } = await supabase.rpc('rotate_cycle');

  if (rotateErr) {
    console.error('[adminFinalizeActiveCycle] Rotation failed:', rotateErr);
    return {
      success: false,
      error: rotateErr.message || 'Failed to rotate cycle.',
    };
  }

  // 3. Record audit log in admin_actions
  await supabase.from('admin_actions').insert({
    admin_id: user.id,
    action: 'manual_cycle_finalize',
    target_table: 'cycles',
    target_id: activeCycle.id,
    reason:
      reason?.trim() ||
      `Manual cycle finalization by operator for Cycle ${activeCycle.cycle_number}`,
    before_state: { cycle_id: activeCycle.id, status: 'active' },
    after_state: { cycle_id: activeCycle.id, status: 'finalized' },
  });

  revalidatePath('/admin/cycles');
  revalidatePath('/cycles');
  revalidatePath('/leaderboard');
  revalidatePath('/feed');

  return {
    success: true,
    message: `Cycle ${activeCycle.cycle_number} successfully finalized and next cycle opened.`,
  };
}
