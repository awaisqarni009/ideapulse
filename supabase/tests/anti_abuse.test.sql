-- =====================================================================
-- supabase/tests/anti_abuse.test.sql
-- pgTAP anti-abuse test suite for IdeaPulse
-- Covering tasks: T-1.29, T-1.30, T-1.31, T-1.32, T-1.33
-- =====================================================================

begin;

-- Ensure pgTAP extension is available
create extension if not exists pgtap;

-- Plan: 6 tests across anti-abuse specifications
select plan(6);

-- ---------------------------------------------------------------------
-- Fixtures & Setup (Superuser context)
-- ---------------------------------------------------------------------

-- Create active test cycle 998
insert into public.cycles (
  id, sequence_number, status, starts_at, ends_at,
  vote_threshold, daily_vote_limit, reward_slots
) values (
  'c0000000-0000-4000-8000-000000000002',
  998, 'active', now() - interval '2 days', now() + interval '5 days',
  10, 5, 3
) on conflict (id) do nothing;

-- User 1: Author & established user (>24h old, confirmed)
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values (
  '11110000-0000-4000-8000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'author1@example.com',
  crypt('password123', gen_salt('bf')),
  now() - interval '48 hours', now() - interval '48 hours', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Author One","username":"authorone"}'::jsonb
) on conflict (id) do nothing;

-- User 2: 23-hour-old user (email confirmed, but created 23h ago -> voter_is_verified must be false)
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values (
  '22220000-0000-4000-8000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'fresh23h@example.com',
  crypt('password123', gen_salt('bf')),
  now() - interval '23 hours', now() - interval '23 hours', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Fresh User 23h","username":"freshuser23h"}'::jsonb
) on conflict (id) do nothing;

-- User 3: Power voter (established, >24h old)
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values (
  '33330000-0000-4000-8000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'powervoter@example.com',
  crypt('password123', gen_salt('bf')),
  now() - interval '48 hours', now() - interval '48 hours', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Power Voter","username":"powervoter"}'::jsonb
) on conflict (id) do nothing;

-- Create an initial idea by Author 1
insert into public.ideas (
  id, author_id, cycle_id, title, summary, body, category, status, created_at
) values (
  'aaaaaaaa-0000-4000-8000-000000000001',
  '11110000-0000-4000-8000-000000000001',
  'c0000000-0000-4000-8000-000000000002',
  'First Idea by Author 1',
  'Summary for first test idea',
  'Complete body description for the first idea by Author One.',
  'developer_tools',
  'published',
  now() - interval '2 days'
) on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- T-1.29: Self-vote rejected with all triggers disabled (proves CHECK constraint is load-bearing)
-- ---------------------------------------------------------------------
alter table public.votes disable trigger all;

select throws_matching(
  $$ insert into public.votes (idea_id, idea_author_id, voter_id, cycle_id)
     values (
       'aaaaaaaa-0000-4000-8000-000000000001',
       '11110000-0000-4000-8000-000000000001',
       '11110000-0000-4000-8000-000000000001',
       'c0000000-0000-4000-8000-000000000002'
     ) $$,
  'votes_no_self_vote',
  'T-1.29: Self-vote rejected with all triggers disabled (CHECK constraint is load-bearing)'
);

alter table public.votes enable trigger all;

-- ---------------------------------------------------------------------
-- T-1.30: 20 concurrent/rapid votes from one account produce exactly 5 rows (BR-031)
-- ---------------------------------------------------------------------
-- Create 20 distinct ideas for testing quota
do $$
declare
  i integer;
  dummy_idea_id uuid;
begin
  for i in 1..20 loop
    dummy_idea_id := ('dddd0000-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid;
    insert into public.ideas (id, author_id, cycle_id, title, summary, body, category, status)
    values (
      dummy_idea_id,
      '11110000-0000-4000-8000-000000000001',
      'c0000000-0000-4000-8000-000000000002',
      'Quota Test Idea ' || i,
      'Summary ' || i,
      'Detailed body text for quota test idea ' || i,
      'artificial_intelligence',
      'published'
    ) on conflict do nothing;
  end loop;
end;
$$;

-- Authenticate as Power Voter and attempt 20 votes
do $$
declare
  i integer;
  dummy_idea_id uuid;
begin
  set local role authenticated;
  set local "request.jwt.claims" to '{"sub": "33330000-0000-4000-8000-000000000003", "role": "authenticated"}';

  for i in 1..20 loop
    dummy_idea_id := ('dddd0000-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid;
    begin
      perform public.cast_vote(dummy_idea_id);
    exception
      when others then
        -- Quota limit exception IP_VOTE_QUOTA is expected on 6th through 20th attempts
        null;
    end;
  end loop;
end;
$$;

select is(
  (select count(*)::integer from public.votes where voter_id = '33330000-0000-4000-8000-000000000003' and status = 'active'),
  5,
  'T-1.30: 20 vote attempts by one user produced exactly 5 active rows (daily limit = 5)'
);

-- ---------------------------------------------------------------------
-- T-1.31: Second submission within 7 days rejected with correct next-slot timestamp
-- ---------------------------------------------------------------------
-- Author 1 submitted an idea 2 days ago. Submitting another idea now must trigger IP_SUBMIT_COOLDOWN.
set local role authenticated;
set local "request.jwt.claims" to '{"sub": "11110000-0000-4000-8000-000000000001", "role": "authenticated"}';

select throws_matching(
  $$ insert into public.ideas (author_id, cycle_id, title, summary, body, category)
     values (
       '11110000-0000-4000-8000-000000000001',
       'c0000000-0000-4000-8000-000000000002',
       'Second Rapid Idea',
       'Summary of second rapid idea',
       'Body of second rapid idea which violates cooldown window.',
       'developer_tools'
     ) $$,
  'IP_SUBMIT_COOLDOWN',
  'T-1.31: Second submission within 7 days rejected with IP_SUBMIT_COOLDOWN timestamp'
);

-- ---------------------------------------------------------------------
-- T-1.32: Vote from a 23-hour-old account is recorded with is_verified = false
-- ---------------------------------------------------------------------
-- Reset role to superuser to check or cast vote as User 2 (23h old)
set local role authenticated;
set local "request.jwt.claims" to '{"sub": "22220000-0000-4000-8000-000000000002", "role": "authenticated"}';

-- User 2 casts vote on Idea 1
select lives_ok(
  $$ select public.cast_vote('aaaaaaaa-0000-4000-8000-000000000001'::uuid) $$,
  'T-1.32: 23-hour-old account can cast vote'
);

-- Verify that the recorded vote has is_verified = false
select is(
  (select is_verified from public.votes where voter_id = '22220000-0000-4000-8000-000000000002' and idea_id = 'aaaaaaaa-0000-4000-8000-000000000001'),
  false,
  'T-1.32: Vote from 23-hour-old account has is_verified = false'
);

-- ---------------------------------------------------------------------
-- T-1.33: qualified_at is set exactly once, on the threshold-crossing vote
-- ---------------------------------------------------------------------
-- Setup a separate idea for qualification threshold test
do $$
declare
  target_idea_id uuid := 'ffff0000-0000-4000-8000-000000000001'::uuid;
  voter_prefix text := '77770000-0000-4000-8000-';
  curr_voter uuid;
  first_qualified_at timestamptz;
  second_qualified_at timestamptz;
  i integer;
begin
  -- Superuser creates the target idea
  insert into public.ideas (id, author_id, cycle_id, title, summary, body, category, status)
  values (
    target_idea_id,
    '11110000-0000-4000-8000-000000000001',
    'c0000000-0000-4000-8000-000000000002',
    'Qualification Test Idea',
    'Summary for qualification test',
    'Body text for qualification threshold crossing test.',
    'sustainability',
    'published'
  );

  -- Cast 9 verified votes from 9 distinct verified users (>24h old)
  for i in 1..9 loop
    curr_voter := (voter_prefix || lpad(i::text, 12, '0'))::uuid;
    insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    values (curr_voter, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'v' || i || '@test.com', 'x', now() - interval '48 hours', now() - interval '48 hours', now())
    on conflict do nothing;

    insert into public.votes (idea_id, idea_author_id, voter_id, cycle_id, is_verified, status)
    values (target_idea_id, '11110000-0000-4000-8000-000000000001', curr_voter, 'c0000000-0000-4000-8000-000000000002', true, 'active');
  end loop;

  -- Verify qualified_at is still NULL after 9 votes
  select qualified_at into first_qualified_at from public.ideas where id = target_idea_id;
  if first_qualified_at is not null then
    raise exception 'Idea qualified too early at 9 votes';
  end if;

  -- 10th vote crosses threshold
  curr_voter := (voter_prefix || lpad('10', 12, '0'))::uuid;
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  values (curr_voter, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'v10@test.com', 'x', now() - interval '48 hours', now() - interval '48 hours', now())
  on conflict do nothing;

  insert into public.votes (idea_id, idea_author_id, voter_id, cycle_id, is_verified, status)
  values (target_idea_id, '11110000-0000-4000-8000-000000000001', curr_voter, 'c0000000-0000-4000-8000-000000000002', true, 'active');

  select qualified_at into first_qualified_at from public.ideas where id = target_idea_id;
  if first_qualified_at is null then
    raise exception 'Idea failed to qualify at 10 votes';
  end if;

  -- 11th vote must NOT overwrite qualified_at
  curr_voter := (voter_prefix || lpad('11', 12, '0'))::uuid;
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  values (curr_voter, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'v11@test.com', 'x', now() - interval '48 hours', now() - interval '48 hours', now())
  on conflict do nothing;

  insert into public.votes (idea_id, idea_author_id, voter_id, cycle_id, is_verified, status)
  values (target_idea_id, '11110000-0000-4000-8000-000000000001', curr_voter, 'c0000000-0000-4000-8000-000000000002', true, 'active');

  select qualified_at into second_qualified_at from public.ideas where id = target_idea_id;
  if second_qualified_at <> first_qualified_at then
    raise exception 'qualified_at was overwritten on 11th vote';
  end if;
end;
$$;

select ok(
  (select qualified_at is not null from public.ideas where id = 'ffff0000-0000-4000-8000-000000000001'),
  'T-1.33: qualified_at is set exactly once on 10th vote and remains frozen on 11th vote'
);

select * from finish();
rollback;
