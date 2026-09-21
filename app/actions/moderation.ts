'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/user';
import { revalidatePath } from 'next/cache';

interface VoidVoteInput {
  voteId: string;
  reason: string;
}

export async function adminVoidVote(input: VoidVoteInput): Promise<{
  success: boolean;
  error?: string;
  message?: string;
  cycleStatus?: string;
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
      error: 'A written reason of at least 5 characters is required for audit.',
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc('admin_void_vote', {
    p_vote_id: input.voteId,
    p_reason: input.reason.trim(),
  });

  if (error) {
    console.error('[adminVoidVote] RPC error:', error);
    return {
      success: false,
      error: error.message || 'Failed to void vote.',
    };
  }

  const res = data as unknown as { success: boolean; cycle_status: string } | null;

  revalidatePath('/admin/cycles');
  revalidatePath('/cycles');
  revalidatePath('/leaderboard');
  revalidatePath('/feed');

  return {
    success: true,
    message:
      res?.cycle_status === 'recount_required'
        ? 'Vote voided. Finalized cycle marked recount_required (BR-047).'
        : 'Vote voided and vote counters recalculated.',
    cycleStatus: res?.cycle_status,
  };
}

interface SuspendAccountInput {
  userId: string;
  durationDays?: number;
  reason: string;
}

export async function adminSuspendAccount(input: SuspendAccountInput): Promise<{
  success: boolean;
  error?: string;
  message?: string;
  deverifiedVotes?: number;
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
      error: 'A written reason of at least 5 characters is required for suspension audit.',
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc('admin_suspend_account', {
    p_user_id: input.userId,
    p_duration_days: input.durationDays || 14,
    p_reason: input.reason.trim(),
  });

  if (error) {
    console.error('[adminSuspendAccount] RPC error:', error);
    return {
      success: false,
      error: error.message || 'Failed to suspend account.',
    };
  }

  const res = data as unknown as { success: boolean; deverified_votes: number } | null;

  revalidatePath('/admin/cycles');
  revalidatePath('/admin/clusters');
  revalidatePath('/admin/reports');
  revalidatePath('/feed');
  revalidatePath('/leaderboard');

  return {
    success: true,
    message: `Account suspended. ${res?.deverified_votes ?? 0} active-cycle votes de-verified (BR-004).`,
    deverifiedVotes: res?.deverified_votes,
  };
}

export async function adminRecountCycle(
  cycleId: string,
  reason?: string,
): Promise<{
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

  const { error } = await supabase.rpc('admin_recount_cycle', {
    p_cycle_id: cycleId,
    p_reason: reason?.trim() || 'Administrative recount and audit validation completed',
  });

  if (error) {
    console.error('[adminRecountCycle] RPC error:', error);
    return {
      success: false,
      error: error.message || 'Failed to complete recount.',
    };
  }

  revalidatePath('/admin/cycles');
  revalidatePath('/cycles');

  return {
    success: true,
    message: 'Recount completed. Cycle status restored to finalized.',
  };
}

export async function adminRunRingDetection(cycleId?: string): Promise<{
  success: boolean;
  error?: string;
  message?: string;
  clustersProcessed?: number;
}> {
  const { user, isAdmin } = await getCurrentUser();

  if (!user || !isAdmin) {
    return {
      success: false,
      error: 'Unauthorized: Administrator privileges required.',
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc('detect_voting_rings', {
    p_cycle_id: cycleId || undefined,
  });

  if (error) {
    console.error('[adminRunRingDetection] RPC error:', error);
    return {
      success: false,
      error: error.message || 'Failed to run ring detection algorithm.',
    };
  }

  const res = data as unknown as { success: boolean; clusters_processed: number } | null;

  revalidatePath('/admin/clusters');

  return {
    success: true,
    message: `Ring detection complete. ${res?.clusters_processed ?? 0} clusters evaluated.`,
    clustersProcessed: res?.clusters_processed,
  };
}

interface ResolveClusterInput {
  clusterId: string;
  action: 'dismissed' | 'actioned';
  note: string;
}

export async function adminResolveCluster(input: ResolveClusterInput): Promise<{
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

  if (!input.note || input.note.trim().length < 5) {
    return {
      success: false,
      error: 'A written note of at least 5 characters is required for review audit.',
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('suspicious_clusters')
    .update({
      status: input.action,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_note: input.note.trim(),
    })
    .eq('id', input.clusterId);

  if (error) {
    console.error('[adminResolveCluster] Error updating cluster:', error);
    return {
      success: false,
      error: error.message || 'Failed to record review decision.',
    };
  }

  await supabase.from('admin_actions').insert({
    admin_id: user.id,
    action: input.action === 'actioned' ? 'action_cluster' : 'dismiss_cluster',
    target_table: 'suspicious_clusters',
    target_id: input.clusterId,
    reason: input.note.trim(),
  });

  revalidatePath('/admin/clusters');

  return {
    success: true,
    message: `Cluster marked ${input.action}.`,
  };
}
