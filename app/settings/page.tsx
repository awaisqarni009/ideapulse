import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SettingsForm } from './settings-form';
import { signOutAction } from '@/app/actions/auth';
import { LogOut, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Profile Settings — IdeaPulse',
  description: 'Manage your IdeaPulse profile, username, display name, and preferences.',
};

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/settings');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url, updated_at, role, status')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      {/* Header bar */}
      <div className="border-border-default mb-8 flex items-center justify-between border-b pb-4">
        <div>
          <Link
            href="/"
            className="text-text-primary font-display text-xl font-bold tracking-tight"
          >
            Idea<span className="text-indigo">Pulse</span>
          </Link>
          <h1 className="text-text-primary mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Account Settings
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            Manage your public identity and profile details.
          </p>
        </div>

        <form action={signOutAction}>
          <button
            type="submit"
            className="border-border-default bg-surface-2 text-text-secondary hover:border-danger/40 hover:bg-tint-danger hover:text-danger inline-flex items-center gap-2 rounded-md border px-4 py-2 text-xs font-medium transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign out</span>
          </button>
        </form>
      </div>

      <div className="space-y-8">
        {/* Profile Details Form */}
        <section aria-labelledby="profile-heading">
          <h2 id="profile-heading" className="text-text-primary mb-4 text-base font-semibold">
            Public Profile
          </h2>
          <SettingsForm
            initialProfile={{
              id: profile.id,
              username: profile.username,
              display_name: profile.display_name,
              bio: profile.bio,
              avatar_url: profile.avatar_url,
              updated_at: profile.updated_at,
            }}
          />
        </section>

        {/* Theme & Display note per ADR-010 */}
        <section className="border-border-subtle bg-surface-1 text-text-tertiary rounded-xl border p-5 text-xs">
          <div className="flex items-start gap-3">
            <Shield className="text-text-tertiary mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="text-text-secondary font-medium">Design & Theme Notice (ADR-010)</p>
              <p className="mt-1 leading-relaxed">
                IdeaPulse operates exclusively in dark mode to preserve luminance contrast and
                specular highlight integrity across glassmorphic layers. System light mode
                preferences are ignored.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
