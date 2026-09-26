'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/user';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export interface AdminActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Starts a new cycle with custom cycle number, duration, and parameters.
 */
export async function adminStartCycleAction(input: {
  cycleNumber?: number;
  durationDays?: number;
  durationHours?: number;
  voteThreshold?: number;
  dailyVoteLimit?: number;
  autoCloseActive?: boolean;
}): Promise<AdminActionResult> {
  const { user, isAdmin } = await getCurrentUser();
  if (!user || !isAdmin) {
    return { success: false, error: 'Unauthorized: Administrator privileges required.' };
  }

  const adminClient = createAdminClient();

  try {
    // 1. Check if there is an active cycle
    const { data: existingActive } = await adminClient
      .from('cycles')
      .select('id, cycle_number')
      .eq('status', 'active')
      .maybeSingle();

    if (existingActive) {
      if (input.autoCloseActive) {
        // Finalize or close active cycle
        try {
          await adminClient.rpc('finalize_cycle', { p_cycle_id: existingActive.id });
        } catch {
          await adminClient
            .from('cycles')
            .update({ status: 'finalized', finalized_at: new Date().toISOString() })
            .eq('id', existingActive.id);
        }
      } else {
        return {
          success: false,
          error: `Cycle #${existingActive.cycle_number} is currently active. Stop it first or enable "Close active cycle automatically".`,
        };
      }
    }

    // 2. Determine cycle number
    let nextNum = input.cycleNumber;
    if (!nextNum || nextNum <= 0) {
      const { data: latest } = await adminClient
        .from('cycles')
        .select('cycle_number')
        .order('cycle_number', { ascending: false })
        .limit(1)
        .maybeSingle();
      nextNum = (latest?.cycle_number ?? 0) + 1;
    }

    // 3. Compute duration
    const days = input.durationDays ?? 7;
    const hours = input.durationHours ?? 0;
    const totalMs = (days * 24 + hours) * 60 * 60 * 1000;
    const durationMs = Math.max(totalMs, 60 * 60 * 1000); // At least 1 hour

    const startsAt = new Date().toISOString();
    const endsAt = new Date(Date.now() + durationMs).toISOString();

    // 4. Insert new active cycle
    const { data: newCycle, error: insertError } = await adminClient
      .from('cycles')
      .insert({
        cycle_number: nextNum,
        starts_at: startsAt,
        ends_at: endsAt,
        status: 'active',
        vote_threshold: input.voteThreshold ?? 50,
        daily_vote_limit: input.dailyVoteLimit ?? 5,
        reward_slots: 3,
      })
      .select('id, cycle_number')
      .single();

    if (insertError) {
      return { success: false, error: insertError.message || 'Failed to start cycle.' };
    }

    // 5. Log to admin_actions
    await adminClient.from('admin_actions').insert({
      admin_id: user.id,
      action: 'start_cycle',
      target_table: 'cycles',
      target_id: newCycle.id,
      reason: `Started Cycle #${newCycle.cycle_number} for duration of ${days}d ${hours}h`,
    });

    revalidatePath('/admin');
    revalidatePath('/admin/cycles');
    revalidatePath('/dashboard');
    revalidatePath('/feed');

    return {
      success: true,
      message: `Cycle #${newCycle.cycle_number} started successfully! Active until ${new Date(endsAt).toLocaleString()}.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to start cycle';
    return { success: false, error: msg };
  }
}

/**
 * Stops / finalizes the active cycle.
 */
export async function adminStopCycleAction(input: {
  cycleId: string;
  note?: string;
}): Promise<AdminActionResult> {
  const { user, isAdmin } = await getCurrentUser();
  if (!user || !isAdmin) {
    return { success: false, error: 'Unauthorized: Administrator privileges required.' };
  }

  const adminClient = createAdminClient();

  try {
    let finalized = false;

    // Try PostgreSQL finalize_cycle RPC
    const { error: rpcError } = await adminClient.rpc('finalize_cycle', {
      p_cycle_id: input.cycleId,
    });

    if (!rpcError) {
      finalized = true;
    } else {
      // Fallback update status directly if RPC throws cycle already closed
      const { error: updateError } = await adminClient
        .from('cycles')
        .update({
          status: 'finalized',
          finalized_at: new Date().toISOString(),
          finalization_note: input.note?.trim() || 'Manually stopped by administrator',
        })
        .eq('id', input.cycleId);

      if (updateError) {
        return { success: false, error: updateError.message || rpcError.message };
      }
      finalized = true;
    }

    // Log to admin_actions
    await adminClient.from('admin_actions').insert({
      admin_id: user.id,
      action: 'stop_cycle',
      target_table: 'cycles',
      target_id: input.cycleId,
      reason: input.note?.trim() || 'Manual cycle finalization by administrator',
    });

    revalidatePath('/admin');
    revalidatePath('/admin/cycles');
    revalidatePath('/dashboard');
    revalidatePath('/feed');

    return {
      success: true,
      message: 'Active cycle successfully stopped and finalized.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to stop cycle';
    return { success: false, error: msg };
  }
}

/**
 * Approves an idea (sets status to 'published' so it is visible and votable).
 */
export async function adminApproveIdeaAction(input: {
  ideaId: string;
  reason?: string;
}): Promise<AdminActionResult> {
  const { user, isAdmin } = await getCurrentUser();
  if (!user || !isAdmin) {
    return { success: false, error: 'Unauthorized: Administrator privileges required.' };
  }

  const adminClient = createAdminClient();

  try {
    const { error } = await adminClient
      .from('ideas')
      .update({
        status: 'published',
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.ideaId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Log to admin_actions
    await adminClient.from('admin_actions').insert({
      admin_id: user.id,
      action: 'approve_idea',
      target_table: 'ideas',
      target_id: input.ideaId,
      reason: input.reason?.trim() || 'Approved proposal for community feed and voting',
    });

    revalidatePath('/admin');
    revalidatePath('/feed');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Idea successfully approved and published for voting.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to approve idea';
    return { success: false, error: msg };
  }
}

/**
 * Declines / removes an idea with a reason.
 */
export async function adminDeclineIdeaAction(input: {
  ideaId: string;
  reason: string;
}): Promise<AdminActionResult> {
  const { user, isAdmin } = await getCurrentUser();
  if (!user || !isAdmin) {
    return { success: false, error: 'Unauthorized: Administrator privileges required.' };
  }

  if (!input.reason || input.reason.trim().length < 4) {
    return { success: false, error: 'A written reason is required to decline an idea.' };
  }

  const adminClient = createAdminClient();

  try {
    const { error } = await adminClient
      .from('ideas')
      .update({
        status: 'removed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.ideaId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Log to admin_actions
    await adminClient.from('admin_actions').insert({
      admin_id: user.id,
      action: 'decline_idea',
      target_table: 'ideas',
      target_id: input.ideaId,
      reason: input.reason.trim(),
    });

    revalidatePath('/admin');
    revalidatePath('/feed');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Idea declined and removed from community voting.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to decline idea';
    return { success: false, error: msg };
  }
}

/**
 * Updates a user role (e.g. promote to admin/moderator, demote to member).
 */
export async function adminUpdateUserRoleAction(input: {
  userId: string;
  newRole: 'member' | 'moderator' | 'admin';
  reason?: string;
}): Promise<AdminActionResult> {
  const { user, isAdmin } = await getCurrentUser();
  if (!user || !isAdmin) {
    return { success: false, error: 'Unauthorized: Administrator privileges required.' };
  }

  const adminClient = createAdminClient();

  try {
    const { error } = await adminClient
      .from('profiles')
      .update({
        role: input.newRole,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.userId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Log to admin_actions
    await adminClient.from('admin_actions').insert({
      admin_id: user.id,
      action: `set_role_${input.newRole}`,
      target_table: 'profiles',
      target_id: input.userId,
      reason: input.reason?.trim() || `User role updated to ${input.newRole}`,
    });

    revalidatePath('/admin');
    return {
      success: true,
      message: `User role updated to ${input.newRole}.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update user role';
    return { success: false, error: msg };
  }
}

/**
 * Updates a user status (active, suspended, deleted).
 */
export async function adminUpdateUserStatusAction(input: {
  userId: string;
  newStatus: 'active' | 'suspended' | 'deleted';
  durationDays?: number;
  reason: string;
}): Promise<AdminActionResult> {
  const { user, isAdmin } = await getCurrentUser();
  if (!user || !isAdmin) {
    return { success: false, error: 'Unauthorized: Administrator privileges required.' };
  }

  if (!input.reason || input.reason.trim().length < 4) {
    return { success: false, error: 'A written audit reason is required.' };
  }

  const adminClient = createAdminClient();

  try {
    let suspendedUntil: string | null = null;
    if (input.newStatus === 'suspended') {
      const days = input.durationDays || 14;
      suspendedUntil = new Date(Date.now() + days * 86400000).toISOString();

      // Trigger BR-004 vote de-verification
      try {
        await adminClient.rpc('admin_suspend_account', {
          p_user_id: input.userId,
          p_duration_days: days,
          p_reason: input.reason.trim(),
        });
      } catch {
        // Fallback update directly if RPC fails
        await adminClient
          .from('profiles')
          .update({
            status: 'suspended',
            suspended_until: suspendedUntil,
            suspension_reason: input.reason.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.userId);
      }
    } else {
      await adminClient
        .from('profiles')
        .update({
          status: input.newStatus,
          suspended_until: null,
          suspension_reason: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.userId);
    }

    // Log to admin_actions
    await adminClient.from('admin_actions').insert({
      admin_id: user.id,
      action: `set_status_${input.newStatus}`,
      target_table: 'profiles',
      target_id: input.userId,
      reason: input.reason.trim(),
    });

    revalidatePath('/admin');
    return {
      success: true,
      message: `Account status updated to ${input.newStatus}.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update user status';
    return { success: false, error: msg };
  }
}

/**
 * Creates a new user in Auth and sets up their profile and initial role.
 */
export async function adminCreateUserAction(input: {
  email: string;
  password?: string;
  username: string;
  displayName?: string;
  role?: 'member' | 'moderator' | 'admin';
}): Promise<AdminActionResult & { temporaryPassword?: string }> {
  const { user, isAdmin } = await getCurrentUser();
  if (!user || !isAdmin) {
    return { success: false, error: 'Unauthorized: Administrator privileges required.' };
  }

  const email = input.email?.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Valid email address is required.' };
  }

  const cleanUsername = input.username?.trim().toLowerCase().replace(/^@/, '');
  if (!cleanUsername || cleanUsername.length < 3 || cleanUsername.length > 24) {
    return {
      success: false,
      error: 'Username must be between 3 and 24 characters (letters, numbers, underscores).',
    };
  }

  if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
    return {
      success: false,
      error: 'Username can only contain lowercase letters, numbers, and underscores.',
    };
  }

  const adminClient = createAdminClient();

  try {
    // Check if username is already taken in profiles
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (existingProfile) {
      return { success: false, error: `Username @${cleanUsername} is already registered.` };
    }

    const tempPassword =
      input.password?.trim() || 'Pulse!' + Math.random().toString(36).slice(2, 8) + '9A';

    // Create user via Supabase Auth Admin API
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        username: cleanUsername,
        display_name: input.displayName?.trim() || cleanUsername,
      },
    });

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || 'Failed to create auth user.' };
    }

    const assignedRole = input.role || 'member';

    // Upsert into profiles
    const { error: profileError } = await adminClient.from('profiles').upsert({
      id: authData.user.id,
      username: cleanUsername,
      display_name: input.displayName?.trim() || cleanUsername,
      role: assignedRole,
      status: 'active',
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.warn('Profile upsert warning:', profileError);
    }

    // Log to admin_actions
    await adminClient.from('admin_actions').insert({
      admin_id: user.id,
      action: 'create_user',
      target_table: 'profiles',
      target_id: authData.user.id,
      reason: `Created user @${cleanUsername} (${email}) with role ${assignedRole}`,
    });

    revalidatePath('/admin');
    return {
      success: true,
      message: `User @${cleanUsername} created successfully! Temporary password: ${tempPassword}`,
      temporaryPassword: tempPassword,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create user account';
    return { success: false, error: msg };
  }
}

/**
 * Permanently removes or soft-deletes a user from the platform.
 */
export async function adminDeleteUserAction(input: {
  userId: string;
  reason: string;
}): Promise<AdminActionResult> {
  const { user, isAdmin } = await getCurrentUser();
  if (!user || !isAdmin) {
    return { success: false, error: 'Unauthorized: Administrator privileges required.' };
  }

  if (input.userId === user.id) {
    return { success: false, error: 'You cannot remove your own administrator account.' };
  }

  if (!input.reason || input.reason.trim().length < 4) {
    return { success: false, error: 'A written reason is required to remove an account.' };
  }

  const adminClient = createAdminClient();

  try {
    // Log intent first
    await adminClient.from('admin_actions').insert({
      admin_id: user.id,
      action: 'delete_user',
      target_table: 'profiles',
      target_id: input.userId,
      reason: input.reason.trim(),
    });

    // Try hard delete via Auth admin API
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(input.userId);

    if (authDeleteError) {
      // If hard delete fails (e.g. historical constraints), soft delete by setting status = 'deleted'
      await adminClient
        .from('profiles')
        .update({
          status: 'deleted',
          suspension_reason: `Account removed by admin: ${input.reason.trim()}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.userId);

      revalidatePath('/admin');
      return {
        success: true,
        message: 'User account marked as deleted and deactivated from all platform activities.',
      };
    }

    revalidatePath('/admin');
    return {
      success: true,
      message: 'User account permanently removed from the system.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete user';
    return { success: false, error: msg };
  }
}
