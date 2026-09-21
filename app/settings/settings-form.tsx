'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState, useEffect, useTransition } from 'react';
import {
  User,
  AtSign,
  FileText,
  Image as ImageIcon,
  Check,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { updateProfileAction, type ProfileActionResult } from '@/app/actions/profile';
import { PROFILE_LIMITS } from '@/lib/constants';

interface ProfileData {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  updated_at: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="text-text-primary shadow-glow-indigo-sm inline-flex items-center justify-center gap-2 rounded-md bg-indigo px-6 py-2.5 text-sm font-medium transition hover:bg-indigo-bright active:bg-indigo-deep disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Saving...</span>
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </>
      )}
    </button>
  );
}

export function SettingsForm({ initialProfile }: { initialProfile: ProfileData }) {
  const [state, formAction] = useFormState<ProfileActionResult | null, FormData>(
    updateProfileAction,
    null,
  );

  const [displayName, setDisplayName] = useState(initialProfile.display_name);
  const [username, setUsername] = useState(initialProfile.username);
  const [bio, setBio] = useState(initialProfile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url || '');

  // Username availability state (T-2.12)
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available?: boolean;
    reason?: string;
  }>({ checking: false });

  // Debounced check against /api/username/check
  useEffect(() => {
    const trimmed = username.trim().toLowerCase();
    if (trimmed === initialProfile.username.toLowerCase()) {
      setUsernameStatus({ checking: false, available: true });
      return;
    }

    if (
      trimmed.length < PROFILE_LIMITS.USERNAME_MIN ||
      trimmed.length > PROFILE_LIMITS.USERNAME_MAX ||
      !/^[a-z0-9_]+$/.test(trimmed)
    ) {
      setUsernameStatus({
        checking: false,
        available: false,
        reason: '3-30 letters, numbers, or underscores',
      });
      return;
    }

    setUsernameStatus({ checking: true });
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/username/check?username=${encodeURIComponent(trimmed)}`);
        const json = await res.json();
        setUsernameStatus({
          checking: false,
          available: json.available,
          reason: json.reason,
        });
      } catch {
        setUsernameStatus({ checking: false, available: undefined });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username, initialProfile.username]);

  return (
    <form
      action={formAction}
      className="border-border-default bg-surface-2 space-y-6 rounded-xl border p-6 shadow-glass backdrop-blur-md sm:p-8"
      style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
    >
      {state?.success && (
        <div
          role="status"
          className="border-tint-success bg-tint-success text-success flex items-center gap-3 rounded-md border p-3.5 text-sm"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      {state?.error && !state?.fieldErrors && (
        <div
          role="alert"
          className="border-danger/30 bg-tint-danger text-danger flex items-center gap-3 rounded-md border p-3.5 text-sm"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Display Name */}
      <div>
        <div className="text-text-secondary mb-1.5 flex justify-between text-xs font-medium">
          <label htmlFor="display_name">Display name</label>
          <span className="text-text-tertiary tabular-nums">
            {displayName.length}/{PROFILE_LIMITS.DISPLAY_NAME_MAX}
          </span>
        </div>
        <div className="relative">
          <div className="text-text-tertiary pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <User className="h-4 w-4" />
          </div>
          <input
            id="display_name"
            name="display_name"
            type="text"
            required
            maxLength={PROFILE_LIMITS.DISPLAY_NAME_MAX}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="border-border-default bg-surface-2 text-text-primary placeholder:text-text-tertiary w-full rounded-sm border py-2.5 pl-10 pr-3.5 text-sm transition focus:border-indigo focus:outline-none focus:ring-1 focus:ring-indigo"
          />
        </div>
        {state?.fieldErrors?.display_name && (
          <p className="text-danger mt-1.5 text-xs">{state.fieldErrors.display_name[0]}</p>
        )}
      </div>

      {/* Username (T-2.11, T-2.12) */}
      <div>
        <div className="text-text-secondary mb-1.5 flex justify-between text-xs font-medium">
          <label htmlFor="username">Username</label>
          <span className="text-text-tertiary">Can be changed once every 30 days</span>
        </div>
        <div className="relative">
          <div className="text-text-tertiary pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <AtSign className="h-4 w-4" />
          </div>
          <input
            id="username"
            name="username"
            type="text"
            required
            maxLength={PROFILE_LIMITS.USERNAME_MAX}
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            className="border-border-default bg-surface-2 text-text-primary placeholder:text-text-tertiary w-full rounded-sm border py-2.5 pl-10 pr-24 font-mono text-sm transition focus:border-indigo focus:outline-none focus:ring-1 focus:ring-indigo"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {usernameStatus.checking ? (
              <Loader2 className="text-text-tertiary h-4 w-4 animate-spin" />
            ) : usernameStatus.available ? (
              <span className="text-success flex items-center gap-1 text-xs">
                <Check className="h-3.5 w-3.5" /> Available
              </span>
            ) : usernameStatus.available === false ? (
              <span className="text-danger flex items-center gap-1 text-xs">
                <X className="h-3.5 w-3.5" /> Taken
              </span>
            ) : null}
          </div>
        </div>
        {usernameStatus.reason && !usernameStatus.available && (
          <p className="text-danger mt-1 text-xs">{usernameStatus.reason}</p>
        )}
        {state?.fieldErrors?.username && (
          <p className="text-danger mt-1.5 text-xs">{state.fieldErrors.username[0]}</p>
        )}
      </div>

      {/* Bio */}
      <div>
        <div className="text-text-secondary mb-1.5 flex justify-between text-xs font-medium">
          <label htmlFor="bio">Bio</label>
          <span className="text-text-tertiary tabular-nums">
            {bio.length}/{PROFILE_LIMITS.BIO_MAX}
          </span>
        </div>
        <div className="relative">
          <textarea
            id="bio"
            name="bio"
            rows={3}
            maxLength={PROFILE_LIMITS.BIO_MAX}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell the community what you build..."
            className="border-border-default bg-surface-2 text-text-primary placeholder:text-text-tertiary w-full resize-none rounded-sm border p-3 text-sm transition focus:border-indigo focus:outline-none focus:ring-1 focus:ring-indigo"
          />
        </div>
        {state?.fieldErrors?.bio && (
          <p className="text-danger mt-1.5 text-xs">{state.fieldErrors.bio[0]}</p>
        )}
      </div>

      {/* Avatar URL */}
      <div>
        <label
          htmlFor="avatar_url"
          className="text-text-secondary mb-1.5 block text-xs font-medium"
        >
          Avatar URL
        </label>
        <div className="relative">
          <div className="text-text-tertiary pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <ImageIcon className="h-4 w-4" />
          </div>
          <input
            id="avatar_url"
            name="avatar_url"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.png"
            className="border-border-default bg-surface-2 text-text-primary placeholder:text-text-tertiary w-full rounded-sm border py-2.5 pl-10 pr-3.5 text-sm transition focus:border-indigo focus:outline-none focus:ring-1 focus:ring-indigo"
          />
        </div>
        {state?.fieldErrors?.avatar_url && (
          <p className="text-danger mt-1.5 text-xs">{state.fieldErrors.avatar_url[0]}</p>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
