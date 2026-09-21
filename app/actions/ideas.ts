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

  // 2. Fetch the active cycle
  const { data: cycle, error: cycleError } = await supabase
    .from('cycles')
    .select('id, status')
    .eq('status', 'active')
    .single();

  if (cycleError || !cycle) {
    return {
      success: false,
      code: 'IP_NO_ACTIVE_CYCLE',
      error: 'No active cycle is currently accepting submissions.',
    };
  }

  // 3. Insert into ideas table
  // The PostgreSQL trigger `ideas_enforce_submission` validates cooldown with advisory lock (BR-020, BR-031)
  const { data: insertedIdea, error: insertError } = await supabase
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
