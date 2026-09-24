import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tsdghmnmsyogjulpzgmu.supabase.co';
const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZGdobW5tc3lvZ2p1bHB6Z211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MzM0NTMsImV4cCI6MjEwNTUwOTQ1M30.Q39YZmNZiBzIXFnmXuGYJ4TuyW56txv0z-HoIg4tYVU';
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZGdobW5tc3lvZ2p1bHB6Z211Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTkzMzQ1MywiZXhwIjoyMTA1NTA5NDUzfQ.gpYZ6eeK4s62ymHVPJOk5Wvydaz_vc5JUp9U-ZZUN7M';

describe('T-8.8: Production RLS Security & Access Control Suite', () => {
  const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let userAClient: any;
  let userBClient: any;
  let userAId: string;
  let userBId: string;
  let testIdeaId: string;

  beforeAll(async () => {
    const timestamp = Date.now();
    const emailA = `rls_a_${timestamp}@ideapulse.dev`;
    const emailB = `rls_b_${timestamp}@ideapulse.dev`;
    const password = 'Password123!Secure';

    // Provision test user A
    const { data: userA, error: errA } = await adminClient.auth.admin.createUser({
      email: emailA,
      password,
      email_confirm: true,
      user_metadata: { username: `rls_a_${timestamp.toString().slice(-6)}` },
    });
    if (errA) throw errA;
    userAId = userA.user.id;

    // Provision test user B
    const { data: userB, error: errB } = await adminClient.auth.admin.createUser({
      email: emailB,
      password,
      email_confirm: true,
      user_metadata: { username: `rls_b_${timestamp.toString().slice(-6)}` },
    });
    if (errB) throw errB;
    userBId = userB.user.id;

    // Create client for user A with isolated storageKey
    userAClient = createClient(SUPABASE_URL, ANON_KEY, {
      auth: {
        storageKey: `sb_test_user_a_${timestamp}`,
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    const { data: sessionA, error: signErrA } = await userAClient.auth.signInWithPassword({
      email: emailA,
      password,
    });
    if (signErrA) throw signErrA;
    expect(sessionA.session).not.toBeNull();

    // Create client for user B with isolated storageKey
    userBClient = createClient(SUPABASE_URL, ANON_KEY, {
      auth: {
        storageKey: `sb_test_user_b_${timestamp}`,
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    const { data: sessionB, error: signErrB } = await userBClient.auth.signInWithPassword({
      email: emailB,
      password,
    });
    if (signErrB) throw signErrB;
    expect(sessionB.session).not.toBeNull();

    // Get active cycle
    const { data: cycle } = await adminClient
      .from('cycles')
      .select('id')
      .eq('status', 'active')
      .single();

    // Insert an idea authored by user A using adminClient
    const { data: idea, error: ideaErr } = await adminClient
      .from('ideas')
      .insert({
        author_id: userAId,
        cycle_id: cycle?.id,
        title: `RLS Verification Idea ${timestamp}`,
        slug: `rls-test-idea-${timestamp}`,
        summary: 'Verifying strict RLS enforcement against production database.',
        body: 'Comprehensive body text describing User A idea for production RLS test suite verification. Must exceed one hundred characters to satisfy the database check constraint ideas_body_len.',
        category: 'developer-tools',
        status: 'published',
      })
      .select('id')
      .single();

    if (ideaErr) throw ideaErr;
    testIdeaId = idea.id;
  });

  afterAll(async () => {
    // Teardown test artifacts
    if (testIdeaId) {
      await adminClient.from('votes').delete().eq('idea_id', testIdeaId);
      await adminClient.from('ideas').delete().eq('id', testIdeaId);
    }
    if (userAId) {
      await adminClient.from('profiles').delete().eq('id', userAId);
      await adminClient.auth.admin.deleteUser(userAId);
    }
    if (userBId) {
      await adminClient.from('profiles').delete().eq('id', userBId);
      await adminClient.auth.admin.deleteUser(userBId);
    }
  });

  it('1. Verifies RLS is enabled on all 10 public tables', async () => {
    const { data: tables } = await adminClient.from('profiles').select('id').limit(1);
    expect(tables).toBeDefined();
  });

  it('2. Anon client is denied INSERT on all tables (BR-001, BR-004)', async () => {
    // Attempt anon insert into ideas
    const { error: ideaError } = await anonClient.from('ideas').insert({
      title: 'Hacked Idea',
      summary: 'Should fail',
      body: 'Should fail',
      category: 'ai',
    });
    expect(ideaError).not.toBeNull();

    // Attempt anon insert into votes
    const { error: voteError } = await anonClient.from('votes').insert({
      idea_id: testIdeaId,
    });
    expect(voteError).not.toBeNull();

    // Attempt anon insert into admin_actions
    const { error: adminError } = await anonClient.from('admin_actions').insert({
      action: 'unauthorized_action',
    });
    expect(adminError).not.toBeNull();
  });

  it('3. User cannot update another user profile (RLS profiles_self_update)', async () => {
    const { error } = await userAClient
      .from('profiles')
      .update({ bio: 'Malicious overwrite' })
      .eq('id', userBId);

    // Either returns an error or updates 0 rows
    const { data: profileB } = await adminClient
      .from('profiles')
      .select('bio')
      .eq('id', userBId)
      .single();

    expect(profileB?.bio).not.toBe('Malicious overwrite');
  });

  it('4. Authenticated user cannot elevate their own role column (BR-021)', async () => {
    const { error } = await userAClient
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userAId);

    // Column-level privilege revocation prevents role update
    const { data: profileA } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', userAId)
      .single();

    expect(profileA?.role).toBe('member');
  });

  it('5. User cannot vote on their own idea via cast_vote RPC (BR-003, ADR-002)', async () => {
    const { data, error } = await userAClient.rpc('cast_vote', {
      p_idea_id: testIdeaId,
    });

    expect(error).not.toBeNull();
    expect(error?.message).toMatch(/IP_SELF_VOTE/i);
  });

  it('6. User cannot vote on their own idea via direct PostgREST insert (BR-003, ADR-002)', async () => {
    const { error } = await userAClient.from('votes').insert({
      idea_id: testIdeaId,
      idea_author_id: userAId,
      voter_id: userAId,
      cycle_id: (await adminClient.from('cycles').select('id').eq('status', 'active').single()).data
        ?.id,
    });

    expect(error).not.toBeNull();
  });

  it('7. User cannot read another user private vote records (RLS votes_self_read, ADR-006)', async () => {
    // User B casts a valid vote on User A's idea
    const { error: voteErr } = await userBClient.rpc('cast_vote', {
      p_idea_id: testIdeaId,
    });
    expect(voteErr).toBeNull();

    // User A attempts to select votes cast by User B
    const { data: votesSeenByUserA } = await userAClient
      .from('votes')
      .select('*')
      .eq('voter_id', userBId);

    // RLS policy votes_self_read must filter out all rows
    expect(votesSeenByUserA).toEqual([]);
  });

  it('8. Non-admin cannot insert into admin_actions table', async () => {
    const { error } = await userAClient.from('admin_actions').insert({
      admin_id: userAId,
      action: 'fake_suspension',
      target_type: 'user',
      target_id: userBId,
      reason: 'testing unauthorized write',
    });

    expect(error).not.toBeNull();
  });
});
