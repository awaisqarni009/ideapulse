'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/user';
import { ideaSubmissionSchema, type IdeaSubmissionInput } from '@/lib/validation';
import { formatNextSlotMessage } from '@/lib/ideas';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';

export type SubmitIdeaResult =
  | { success: true; slug: string; ideaId: string }
  | {
      success: false;
      error: string;
      code?: string;
      fieldErrors?: Record<string, string[]>;
      nextSlotAt?: string;
    };

/**
 * submitIdea() Server Action [T-3.3]
 * Submits an idea to the active cycle, strictly adhering to RLS and database triggers.
 */
export async function submitIdeaAction(input: IdeaSubmissionInput): Promise<SubmitIdeaResult> {
  const { user, profile, isWritable, isConfirmed } = await getCurrentUser();

  if (!user) {
    return {
      success: false,
      code: 'IP_UNAUTHENTICATED',
      error: 'Sign in to submit an idea.',
    };
  }

  if (!isConfirmed) {
    return {
      success: false,
      code: 'IP_ACCOUNT_NOT_WRITABLE',
      error: 'Confirm your email to start submitting ideas.',
    };
  }

  if (!isWritable) {
    const isSuspended =
      profile?.status === 'suspended' ||
      (profile?.suspended_until && new Date(profile.suspended_until) > new Date());

    if (isSuspended && profile?.suspended_until) {
      const untilDate = format(new Date(profile.suspended_until), 'PPP');
      return {
        success: false,
        code: 'IP_ACCOUNT_NOT_WRITABLE',
        error: `This account is suspended until ${untilDate}. Contact support if you think this is a mistake.`,
      };
    }

    return {
      success: false,
      code: 'IP_ACCOUNT_NOT_WRITABLE',
      error: 'Your account is currently unable to publish new ideas.',
    };
  }

  // 1. Validate form fields
  const validation = ideaSubmissionSchema.safeParse(input);
  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    const firstErrorMessage =
      validation.error.errors[0]?.message || 'Please correct the errors in the form.';
    return {
      success: false,
      code: 'IP_VALIDATION',
      error: firstErrorMessage,
      fieldErrors,
    };
  }

  const supabase = await createClient();

  // 2. Fetch the active cycle (with T-5.7 3s retry if rotation is in progress per BR-043)
  let { data: cycle, error: cycleError } = await supabase
    .from('cycles')
    .select('id, status')
    .eq('status', 'active')
    .maybeSingle();

  if (cycleError || !cycle) {
    // Wait 3 seconds and retry once
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const retry = await supabase
      .from('cycles')
      .select('id, status')
      .eq('status', 'active')
      .maybeSingle();
    cycle = retry.data;
    cycleError = retry.error;
  }

  if (cycleError || !cycle) {
    return {
      success: false,
      code: 'IP_NO_ACTIVE_CYCLE',
      error: 'The weekly cycle is closing right now. Try again in a moment.',
    };
  }

  // 3. Insert into ideas table
  // The PostgreSQL trigger `ideas_enforce_submission` validates cooldown with advisory lock (BR-020, BR-031)
  let { data: insertedIdea, error: insertError } = await supabase
    .from('ideas')
    .insert({
      author_id: user.id,
      cycle_id: cycle.id,
      title: validation.data.title,
      summary: validation.data.summary,
      body: validation.data.body,
      category: validation.data.category,
      tags: validation.data.tags,
      status: 'published',
    })
    .select('id, slug')
    .single();

  if (
    insertError &&
    (insertError.message?.includes('IP_NO_ACTIVE_CYCLE') || insertError.code === '503')
  ) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const retryInsert = await supabase
      .from('ideas')
      .insert({
        author_id: user.id,
        cycle_id: cycle.id,
        title: validation.data.title,
        summary: validation.data.summary,
        body: validation.data.body,
        category: validation.data.category,
        tags: validation.data.tags,
        status: 'published',
      })
      .select('id, slug')
      .single();
    insertedIdea = retryInsert.data;
    insertError = retryInsert.error;
  }

  if (insertError) {
    const msg = insertError.message || '';

    // Handle cooldown error from trigger: IP_SUBMIT_COOLDOWN:<timestamp>
    if (msg.includes('IP_SUBMIT_COOLDOWN')) {
      const parts = msg.split('IP_SUBMIT_COOLDOWN:');
      const nextSlotTimestamp = parts[1]?.split('\n')[0]?.trim();
      return {
        success: false,
        code: 'IP_SUBMIT_COOLDOWN',
        nextSlotAt: nextSlotTimestamp,
        error: formatNextSlotMessage(nextSlotTimestamp),
      };
    }

    if (msg.includes('IP_ACCOUNT_NOT_WRITABLE')) {
      return {
        success: false,
        code: 'IP_ACCOUNT_NOT_WRITABLE',
        error: 'Your account is not eligible to submit ideas at this time.',
      };
    }

    return {
      success: false,
      error: msg || 'An error occurred while submitting your idea.',
    };
  }

  if (!insertedIdea) {
    return {
      success: false,
      error: 'An unexpected error occurred while saving the idea.',
    };
  }

  // 4. Revalidate paths
  revalidatePath('/');
  revalidatePath('/submit');
  revalidatePath(`/idea/${insertedIdea.slug}`);

  return {
    success: true,
    slug: insertedIdea.slug,
    ideaId: insertedIdea.id,
  };
}

export type WithdrawIdeaResult =
  { success: true } | { success: false; error: string; code?: string };

/**
 * withdrawIdeaAction() Server Action [T-3.8]
 * Withdraws an idea authored by the caller per RULES.md BR-023.
 */
export async function withdrawIdeaAction(ideaId: string): Promise<WithdrawIdeaResult> {
  const { user } = await getCurrentUser();

  if (!user) {
    return {
      success: false,
      code: 'IP_UNAUTHENTICATED',
      error: 'You must be signed in to withdraw an idea.',
    };
  }

  const supabase = await createClient();

  // 1. Fetch idea to confirm author ownership
  const { data: idea, error: fetchError } = await supabase
    .from('ideas')
    .select('id, author_id, status, slug')
    .eq('id', ideaId)
    .single();

  if (fetchError || !idea) {
    return {
      success: false,
      code: 'IP_IDEA_NOT_FOUND',
      error: 'Idea not found.',
    };
  }

  if (idea.author_id !== user.id) {
    return {
      success: false,
      error: 'You can only withdraw ideas that you authored.',
    };
  }

  if (idea.status === 'withdrawn') {
    return {
      success: false,
      error: 'This idea has already been withdrawn.',
    };
  }

  // 2. Perform update
  const { error: updateError } = await supabase
    .from('ideas')
    .update({
      status: 'withdrawn',
      withdrawn_at: new Date().toISOString(),
    })
    .eq('id', ideaId)
    .eq('author_id', user.id);

  if (updateError) {
    return {
      success: false,
      error: updateError.message || 'Failed to withdraw idea.',
    };
  }

  revalidatePath('/');
  revalidatePath(`/idea/${idea.slug}`);
  revalidatePath('/leaderboard');

  return { success: true };
}
