import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProfileHeader } from '@/app/components/profile/profile-header';
import { IdeaCard } from '@/app/components/ideas/idea-card';
import { PlusCircle, Lightbulb } from 'lucide-react';

interface ProfilePageProps {
  params:
    | Promise<{
        username: string;
      }>
    | {
        username: string;
      };
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await Promise.resolve(params);
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, bio')
    .eq('username', username)
    .maybeSingle();

  if (!profile) {
    return {
      title: 'User Not Found — IdeaPulse',
    };
  }

  return {
    title: `${profile.display_name} (@${username}) — IdeaPulse`,
    description: profile.bio || `Explore ideas submitted by ${profile.display_name} on IdeaPulse.`,
  };
}

/**
 * /u/[username] Profile Page (RSC) per ARCHITECTURE.md §5.1 and TASKS.md [T-4.15]
 * - Renders author identity, member since date, total votes received, and cycles won.
 * - Displays user's authored ideas with contextual owner vs visitor empty states.
 * - PRIVACY INVARIANT (ADR-006, BR-003): Strictly never shows what ideas this user voted for.
 */
export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await Promise.resolve(params);
  const supabase = await createClient();

  // 1. Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url, created_at')
    .eq('username', username)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  // 2. Fetch current viewer session
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();
  const isOwner = currentUser?.id === profile.id;

  // 3. Fetch user's authored published ideas
  const { data: rawIdeas } = await supabase
    .from('ideas')
    .select(
      `
      id,
      title,
      slug,
      summary,
      category,
      tags,
      status,
      vote_count,
      verified_vote_count,
      created_at,
      author_id,
      cycle_id,
      cycles (
        cycle_number,
        vote_threshold
      )
    `,
    )
    .eq('author_id', profile.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const authoredIdeas = rawIdeas || [];

  // 4. Calculate total votes received across all authored ideas
  const totalVotesReceived = authoredIdeas.reduce(
    (sum, idea) => sum + (idea.verified_vote_count || 0),
    0,
  );

  // 5. Query cycles won (rewards with rank <= 3)
  const { count: cyclesWonCount } = await supabase
    .from('rewards')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', profile.id)
    .lte('rank', 3);

  // 6. Check viewer's vote status on these ideas if authenticated
  const viewerVoteMap = new Map<string, string>();
  if (currentUser && authoredIdeas.length > 0) {
    const ideaIds = authoredIdeas.map((i) => i.id);
    const { data: viewerVotes } = await supabase
      .from('votes')
      .select('idea_id, created_at')
      .eq('voter_id', currentUser.id)
      .eq('status', 'active')
      .in('idea_id', ideaIds);

    viewerVotes?.forEach((v) => {
      viewerVoteMap.set(v.idea_id, v.created_at);
    });
  }

  return (
    <main className="min-h-[calc(100vh-64px)] py-10 sm:py-14">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Profile Header & Stats */}
        <ProfileHeader
          profile={profile}
          stats={{
            ideasCount: authoredIdeas.length,
            votesReceived: totalVotesReceived,
            cyclesWon: cyclesWonCount || 0,
          }}
          isOwner={isOwner}
        />

        {/* Authored Ideas Section */}
        <div className="mt-12">
          <div className="mb-8 flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <div>
              <h2 className="font-display text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
                Submitted Proposals
              </h2>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)] sm:text-sm">
                Ideas authored and published across weekly IdeaPulse cycles.
              </p>
            </div>
            {isOwner && (
              <Link
                href="/submit"
                className="btn glass-panel inline-flex items-center gap-2 rounded-xl border border-[var(--border-accent)] bg-[rgba(99,102,241,0.12)] px-4 py-2 text-xs font-semibold text-[var(--indigo-bright)] shadow-[var(--glow-indigo-sm)] transition-all hover:bg-[rgba(99,102,241,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo-bright)]"
              >
                <PlusCircle className="h-4 w-4" />
                <span>New Idea</span>
              </Link>
            )}
          </div>

          {authoredIdeas.length === 0 ? (
            /* Contextual Empty States per DESIGN.md §7.11 */
            <div
              role="status"
              className="glass-panel flex flex-col items-center justify-center rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-12 text-center backdrop-blur-[var(--blur-md)]"
              style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-tertiary)] shadow-inner">
                <Lightbulb className="h-7 w-7 text-[var(--text-tertiary)]" />
              </div>

              {isOwner ? (
                <>
                  <h3 className="mt-4 font-display text-lg font-bold text-[var(--text-primary)]">
                    You haven&apos;t posted an idea yet
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
                    Share your concept with the community to compete in the active weekly cycle.
                  </p>
                  <Link
                    href="/submit"
                    className="btn mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--indigo-bright)] px-5 py-2.5 text-xs font-semibold text-white shadow-[var(--glow-indigo-md)] transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo-bright)]"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Post your first idea</span>
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="mt-4 font-display text-lg font-bold text-[var(--text-primary)]">
                    {profile.display_name} hasn&apos;t posted an idea yet
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
                    When proposals are published by this creator, they will appear here.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {authoredIdeas.map((idea) => {
                const ideaWithAuthor = {
                  ...idea,
                  profiles: {
                    id: profile.id,
                    username: profile.username,
                    display_name: profile.display_name,
                    avatar_url: profile.avatar_url,
                  },
                };

                return (
                  <IdeaCard
                    key={idea.id}
                    idea={ideaWithAuthor as any}
                    currentUserId={currentUser?.id}
                    hasVoted={viewerVoteMap.has(idea.id)}
                    voteCreatedAt={viewerVoteMap.get(idea.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
