'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { profileUpdateSchema, type ProfileUpdateInput } from '@/lib/validation';

export type ProfileActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  message?: string;
};

/**
 * Server Action: Update Profile (T-2.11)
 * Updates display_name, username, bio, avatar_url.
 * Enforces a 30-day change limit for usernames.
 */
export async function updateProfileAction(
  _prevState: ProfileActionResult | null,
  formData: FormData,
): Promise<ProfileActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: 'You must be signed in to update your settings.',
    };
  }

  const rawData: ProfileUpdateInput = {
    display_name: formData.get('display_name')?.toString() || '',
    username: formData.get('username')?.toString() || '',
    bio: formData.get('bio')?.toString() || null,
    avatar_url: formData.get('avatar_url')?.toString() || null,
  };

  const parseResult = profileUpdateSchema.safeParse(rawData);
  if (!parseResult.success) {
    return {
      success: false,
      error: 'Please fix the errors below.',
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const { display_name, username, bio, avatar_url } = parseResult.data;

  // Retrieve current profile to check username modification window
  const { data: currentProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('username, updated_at')
    .eq('id', user.id)
    .single();

  if (fetchError || !currentProfile) {
    return {
      success: false,
      error: 'Profile not found. Please try again.',
    };
  }

  // 30-day username change cooldown enforcement (T-2.11)
  const isUsernameChanging = username.toLowerCase() !== currentProfile.username.toLowerCase();

  if (isUsernameChanging && currentProfile.updated_at) {
    const lastUpdateMs = new Date(currentProfile.updated_at).getTime();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const timeSinceUpdate = Date.now() - lastUpdateMs;

    if (timeSinceUpdate < thirtyDaysMs) {
      const remainingDays = Math.ceil((thirtyDaysMs - timeSinceUpdate) / (24 * 60 * 60 * 1000));
      return {
        success: false,
        error: `Usernames can only be changed once every 30 days. You can change yours again in ${remainingDays} days.`,
        fieldErrors: {
          username: [`Cooldown active for ${remainingDays} more day(s).`],
        },
      };
    }
  }

  // Update profile row (respects column grants: authenticated may only update safe columns)
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      display_name,
      username,
      bio: bio || null,
      avatar_url: avatar_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (updateError) {
    console.error('[profile/update] Database error:', updateError.message);
    if (updateError.message.includes('unique') || updateError.code === '23505') {
      return {
        success: false,
        error: 'That username is already taken by another creator.',
        fieldErrors: {
          username: ['This username is already taken.'],
        },
      };
    }
    return {
      success: false,
      error: 'Unable to update profile. Please try again.',
    };
  }

  revalidatePath('/settings');
  revalidatePath('/', 'layout');

  return {
    success: true,
    message: 'Profile settings saved successfully.',
  };
}
