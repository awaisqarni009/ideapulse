-- =====================================================================
-- supabase/tests/rls.test.sql
-- pgTAP test suite for IdeaPulse: Row Level Security & Access Control
-- Covering tasks: T-1.23, T-1.24, T-1.25, T-1.26, T-1.27, T-1.28
-- =====================================================================

begin;

-- Ensure pgTAP extension is available
create extension if not exists pgtap;

-- Plan:
-- T-1.24: 8 anonymous insert tests (profiles, cycles, ideas, votes, rewards, reports, abuse_events, admin_actions)
-- T-1.25: 1 test (user A cannot read user B's vote rows)
-- T-1.26: 1 test (user cannot update own role column)
-- T-1.27: 1 test (self-vote rejected through cast_vote RPC)
-- T-1.28: 1 test (self-vote rejected through direct PostgREST insert)
select plan(12);

-- ---------------------------------------------------------------------
-- Fixtures & Setup (Superuser context)
-- ---------------------------------------------------------------------

-- Create two test users in auth.users
-- Note: Trigger on auth.users automatically inserts corresponding public.profiles
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values (
  'a0000000-0000-4000-8000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'user_a@example.com',
  crypt('password123', gen_salt('bf')),
  now() - interval '48 hours', now() - interval '48 hours', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"User A","username":"usera"}'::jsonb
), (
  'b0000000-0000-4000-8000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'user_b@example.com',
  crypt('password123', gen_salt('bf')),
  now() - interval '48 hours', now() - interval '48 hours', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"User B","username":"userb"}'::jsonb
) on conflict (id) do nothing;

-- Ensure an active test cycle exists
insert into public.cycles (
  id, sequence_number, status, starts_at, ends_at,
  vote_threshold, daily_vote_limit, reward_slots
) values (
  'c0000000-0000-4000-8000-000000000001',
  999, 'active', now() - interval '1 day', now() + interval '6 days',
  10, 5, 3
) on conflict do nothing;

-- Create an idea authored by User A
insert into public.ideas (
  id, author_id, cycle_id, title, summary, body, category, status
) values (
  'i0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  'c0000000-0000-4000-8000-000000000001',
  'Idea by User A',
  'Summary of User A idea for RLS testing',
  'Comprehensive body text describing User A idea for RLS test suite.',
  'developer_tools',
  'published'
) on conflict do nothing;

-- Create an idea authored by User B
insert into public.ideas (
  id, author_id, cycle_id, title, summary, body, category, status
) values (
  'i0000000-0000-4000-8000-000000000002',
  'b0000000-0000-4000-8000-000000000002',
  'c0000000-0000-4000-8000-000000000001',
  'Idea by User B',
  'Summary of User B idea for RLS testing',
  'Comprehensive body text describing User B idea for RLS test suite.',
  'developer_tools',
  'published'
) on conflict do nothing;

-- User B casts a vote on User A's idea (via superuser/definier context for setup)
insert into public.votes (
  id, idea_id, idea_author_id, voter_id, cycle_id, is_verified, status
) values (
  'v0000000-0000-4000-8000-000000000001',
  'i0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000002',
  'c0000000-0000-4000-8000-000000000001',
  true,
  'active'
) on conflict do nothing;

-- ---------------------------------------------------------------------
-- T-1.24: Anonymous client cannot insert into any table
-- ---------------------------------------------------------------------
set local role anon;
set local "request.jwt.claims" to '{"role": "anon"}';

-- 1. profiles
select throws_ok(
  $$ insert into public.profiles (id, username, display_name) values ('00000000-0000-0000-0000-000000000099', 'anon_hacker', 'Hacker') $$,
  '42501',
  null,
  'T-1.24: Anonymous client cannot insert into profiles'
);

-- 2. cycles
select throws_ok(
  $$ insert into public.cycles (sequence_number, status, starts_at, ends_at) values (998, 'upcoming', now(), now() + interval '7 days') $$,
  '42501',
  null,
  'T-1.24: Anonymous client cannot insert into cycles'
);

-- 3. ideas
select throws_ok(
  $$ insert into public.ideas (author_id, cycle_id, title, summary, body, category) values ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'Hack Idea', 'Hack Summary', 'Hack Body', 'developer_tools') $$,
  '42501',
  null,
  'T-1.24: Anonymous client cannot insert into ideas'
);

-- 4. votes
select throws_ok(
  $$ insert into public.votes (idea_id, idea_author_id, voter_id, cycle_id) values ('i0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001') $$,
  '42501',
  null,
  'T-1.24: Anonymous client cannot insert into votes'
);

-- 5. rewards
select throws_ok(
  $$ insert into public.rewards (cycle_id, recipient_id, rank, amount_cents) values ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 1, 10000) $$,
  '42501',
  null,
  'T-1.24: Anonymous client cannot insert into rewards'
);

-- 6. reports
select throws_ok(
  $$ insert into public.reports (reporter_id, target_table, target_id, reason) values ('a0000000-0000-4000-8000-000000000001', 'ideas', 'i0000000-0000-4000-8000-000000000001', 'spam') $$,
  '42501',
  null,
  'T-1.24: Anonymous client cannot insert into reports'
);

-- 7. abuse_events
select throws_ok(
  $$ insert into public.abuse_events (actor_id, kind, error_code) values ('a0000000-0000-4000-8000-000000000001', 'rate_limit_submission', 'IP_RATE_LIMITED') $$,
  '42501',
  null,
  'T-1.24: Anonymous client cannot insert into abuse_events'
);

-- 8. admin_actions
select throws_ok(
  $$ insert into public.admin_actions (admin_id, action, target_table, target_id) values ('a0000000-0000-4000-8000-000000000001', 'suspend_user', 'profiles', 'b0000000-0000-4000-8000-000000000002') $$,
  '42501',
  null,
  'T-1.24: Anonymous client cannot insert into admin_actions'
);

-- ---------------------------------------------------------------------
-- T-1.25: User A cannot read User B's vote rows
-- ---------------------------------------------------------------------
set local role authenticated;
set local "request.jwt.claims" to '{"sub": "a0000000-0000-4000-8000-000000000001", "role": "authenticated"}';

select is(
  (select count(*)::integer from public.votes where voter_id = 'b0000000-0000-4000-8000-000000000002'),
  0,
  'T-1.25: User A cannot read User B vote rows'
);

-- ---------------------------------------------------------------------
-- T-1.26: User cannot update their own role column
-- ---------------------------------------------------------------------
-- User A is authenticated; attempting to update role must fail with 42501 (permission denied for column role)
select throws_ok(
  $$ update public.profiles set role = 'admin' where id = 'a0000000-0000-4000-8000-000000000001' $$,
  '42501',
  null,
  'T-1.26: User cannot update their own role column'
);

-- ---------------------------------------------------------------------
-- T-1.27: Self-vote rejected through cast_vote
-- ---------------------------------------------------------------------
-- User A attempting to vote on User A's idea via cast_vote RPC must throw IP_SELF_VOTE
select throws_matching(
  $$ select public.cast_vote('i0000000-0000-4000-8000-000000000001'::uuid) $$,
  'IP_SELF_VOTE',
  'T-1.27: Self-vote rejected through cast_vote RPC'
);

-- ---------------------------------------------------------------------
-- T-1.28: Self-vote rejected through a direct PostgREST insert
-- ---------------------------------------------------------------------
-- User A attempting direct INSERT into votes on User A's idea must fail
-- either due to check constraint votes_no_self_vote or RLS policy votes_self_insert
select throws_matching(
  $$ insert into public.votes (idea_id, idea_author_id, voter_id, cycle_id)
     values (
       'i0000000-0000-4000-8000-000000000001',
       'a0000000-0000-4000-8000-000000000001',
       'a0000000-0000-4000-8000-000000000001',
       'c0000000-0000-4000-8000-000000000001'
     ) $$,
  'votes_no_self_vote|violates row-level security policy',
  'T-1.28: Self-vote rejected through direct PostgREST insert'
);

select * from finish();
rollback;
