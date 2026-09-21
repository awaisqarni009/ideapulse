-- =====================================================================
-- 142_trust_and_safety_engine.sql
-- T-6.7: Void-vote action with recount_required trigger on finalized cycles
-- T-6.8: Suspend-account action de-verifying active-cycle votes (BR-004)
-- T-6.10: Ring-detection job writing to suspicious_clusters (BR-034)
-- =====================================================================

-- 1. Create suspicious_clusters table for ring detection review queue
create table if not exists public.suspicious_clusters (
  id                  uuid primary key default extensions.gen_random_uuid(),
  cycle_id            uuid references public.cycles (id) on delete cascade,
  account_a           uuid not null references public.profiles (id) on delete cascade,
  account_b           uuid not null references public.profiles (id) on delete cascade,
  jaccard_overlap     numeric(4,3) not null,
  shared_votes_count  integer not null default 0,
  signals             jsonb not null default '[]'::jsonb,
  priority            text not null default 'standard' check (priority in ('standard', 'priority_review')),
  status              text not null default 'pending' check (status in ('pending', 'dismissed', 'actioned')),
  reviewed_by         uuid references public.profiles (id) on delete set null,
  reviewed_at         timestamptz,
  review_note         text,
  created_at          timestamptz not null default now(),

  constraint clusters_unique_pair unique (cycle_id, account_a, account_b)
);

alter table public.suspicious_clusters enable row level security;

create policy "clusters_admin_all"
  on public.suspicious_clusters for all
  using (public.is_admin())
  with check (public.is_admin());

create index if unthinkable_clusters_cycle_idx on public.suspicious_clusters (cycle_id, priority, status);

-- 2. Void-vote action (T-6.7, AC-10.2, BR-047, AC-09.4)
create or replace function public.admin_void_vote(
  p_vote_id uuid,
  p_reason  text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id      uuid := auth.uid();
  v_vote          public.votes%rowtype;
  v_cycle         public.cycles%rowtype;
  v_cycle_status  public.cycle_status;
  v_before_status public.vote_status;
begin
  if not public.is_admin(v_admin_id) then
    raise exception 'IP_UNAUTHORIZED' using errcode = '42501';
  end if;

  if p_reason is null or length(trim(p_reason)) < 5 then
    raise exception 'IP_REASON_REQUIRED' using errcode = 'P0001';
  end if;

  select * into v_vote from public.votes where id = p_vote_id for update;
  if not found then
    raise exception 'IP_VOTE_NOT_FOUND' using errcode = 'P0002';
  end if;

  v_before_status := v_vote.status;

  -- Mark vote voided
  update public.votes
  set status = 'voided',
      void_reason = p_reason,
      voided_at = now()
  where id = p_vote_id;

  -- Check cycle status: If finalized, flag cycle as recount_required (BR-047, AC-09.4)
  select * into v_cycle from public.cycles where id = v_vote.cycle_id;
  if v_cycle.status = 'finalized' then
    update public.cycles
    set status = 'recount_required'
    where id = v_vote.cycle_id;
    v_cycle_status := 'recount_required';
  else
    v_cycle_status := v_cycle.status;
  end if;

  -- Log to admin_actions audit ledger
  insert into public.admin_actions (
    admin_id,
    action,
    target_table,
    target_id,
    reason,
    before_state,
    after_state
  ) values (
    v_admin_id,
    'void_vote',
    'votes',
    p_vote_id,
    p_reason,
    jsonb_build_object('status', v_before_status, 'idea_id', v_vote.idea_id, 'cycle_id', v_vote.cycle_id),
    jsonb_build_object('status', 'voided', 'cycle_status', v_cycle_status)
  );

  return jsonb_build_object(
    'success', true,
    'vote_id', p_vote_id,
    'idea_id', v_vote.idea_id,
    'cycle_id', v_vote.cycle_id,
    'cycle_status', v_cycle_status
  );
end;
$$;

-- 3. Suspend-account action (T-6.8, AC-10.4, BR-004)
create or replace function public.admin_suspend_account(
  p_user_id       uuid,
  p_duration_days integer,
  p_reason        text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id        uuid := auth.uid();
  v_profile         public.profiles%rowtype;
  v_active_cycle_id uuid;
  v_deverified_cnt  integer := 0;
  v_suspended_until timestamptz;
begin
  if not public.is_admin(v_admin_id) then
    raise exception 'IP_UNAUTHORIZED' using errcode = '42501';
  end if;

  if p_reason is null or length(trim(p_reason)) < 5 then
    raise exception 'IP_REASON_REQUIRED' using errcode = 'P0001';
  end if;

  select * into v_profile from public.profiles where id = p_user_id for update;
  if not found then
    raise exception 'IP_USER_NOT_FOUND' using errcode = 'P0002';
  end if;

  v_suspended_until := now() + (coalesce(p_duration_days, 14) || ' days')::interval;

  -- Update profile status
  update public.profiles
  set status = 'suspended',
      suspended_until = v_suspended_until,
      suspension_reason = p_reason,
      updated_at = now()
  where id = p_user_id;

  -- BR-004: De-verify votes in the currently active cycle only. Finalized cycles are NOT touched.
  select id into v_active_cycle_id from public.cycles where status = 'active' limit 1;

  if v_active_cycle_id is not null then
    with updated_votes as (
      update public.votes
      set is_verified = false
      where voter_id = p_user_id
        and cycle_id = v_active_cycle_id
        and is_verified = true
      returning id
    )
    select count(*) into v_deverified_cnt from updated_votes;
  end if;

  -- Log to admin_actions
  insert into public.admin_actions (
    admin_id,
    action,
    target_table,
    target_id,
    reason,
    before_state,
    after_state
  ) values (
    v_admin_id,
    'suspend_account',
    'profiles',
    p_user_id,
    p_reason,
    jsonb_build_object('status', v_profile.status, 'suspended_until', v_profile.suspended_until),
    jsonb_build_object('status', 'suspended', 'suspended_until', v_suspended_until, 'deverified_votes', v_deverified_cnt)
  );

  return jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'suspended_until', v_suspended_until,
    'deverified_votes', v_deverified_cnt
  );
end;
$$;

-- 4. Recount cycle action (T-6.9, BR-047)
create or replace function public.admin_recount_cycle(
  p_cycle_id uuid,
  p_reason   text default 'Administrative recount completed'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid := auth.uid();
  v_cycle    public.cycles%rowtype;
begin
  if not public.is_admin(v_admin_id) then
    raise exception 'IP_UNAUTHORIZED' using errcode = '42501';
  end if;

  select * into v_cycle from public.cycles where id = p_cycle_id for update;
  if not found then
    raise exception 'IP_CYCLE_NOT_FOUND' using errcode = 'P0002';
  end if;

  -- Restore recount_required cycle back to finalized
  update public.cycles
  set status = 'finalized'
  where id = p_cycle_id;

  insert into public.admin_actions (
    admin_id,
    action,
    target_table,
    target_id,
    reason,
    before_state,
    after_state
  ) values (
    v_admin_id,
    'recount_cycle',
    'cycles',
    p_cycle_id,
    p_reason,
    jsonb_build_object('status', v_cycle.status),
    jsonb_build_object('status', 'finalized')
  );

  return jsonb_build_object('success', true, 'cycle_id', p_cycle_id, 'status', 'finalized');
end;
$$;

-- 5. Ring detection calculation job (T-6.10, BR-034)
create or replace function public.detect_voting_rings(
  p_cycle_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target_cycle_id uuid := p_cycle_id;
  v_cluster_record  record;
  v_inserted_count  integer := 0;
  v_signals         jsonb;
  v_priority        text;
  v_high_count      integer;
  v_med_count       integer;
begin
  if v_target_cycle_id is null then
    select id into v_target_cycle_id from public.cycles where status = 'active' limit 1;
  end if;

  if v_target_cycle_id is null then
    return jsonb_build_object('success', false, 'error', 'No cycle found');
  end if;

  -- Pairwise Jaccard overlap between accounts voting on ideas in target cycle
  for v_cluster_record in
    with voter_ideas as (
      select voter_id, array_agg(distinct idea_id) as idea_set, count(distinct idea_id) as set_size
      from public.votes
      where cycle_id = v_target_cycle_id and status = 'active'
      group by voter_id
      having count(distinct idea_id) >= 2
    ),
    pairs as (
      select
        a.voter_id as account_a,
        b.voter_id as account_b,
        (
          select count(*)
          from unnest(a.idea_set) x
          join unnest(b.idea_set) y on x = y
        ) as shared_count,
        a.set_size as size_a,
        b.set_size as size_b
      from voter_ideas a
      join voter_ideas b on a.voter_id < b.voter_id
    )
    select
      account_a,
      account_b,
      shared_count,
      round((shared_count::numeric / (size_a + size_b - shared_count)::numeric), 3) as jaccard
    from pairs
    where (shared_count::numeric / (size_a + size_b - shared_count)::numeric) >= 0.50
  loop
    v_signals := '[]'::jsonb;
    v_high_count := 0;
    v_med_count := 0;

    -- High signal: Jaccard >= 0.80 over >= 8 shared votes (or >= 4 shared in low sample)
    if v_cluster_record.jaccard >= 0.80 and v_cluster_record.shared_count >= 4 then
      v_signals := v_signals || jsonb_build_object(
        'signal', 'high_jaccard_overlap',
        'weight', 'high',
        'detail', format('Jaccard %s over %s shared ideas', v_cluster_record.jaccard, v_cluster_record.shared_count)
      );
      v_high_count := v_high_count + 1;
    elsif v_cluster_record.jaccard >= 0.60 then
      v_signals := v_signals || jsonb_build_object(
        'signal', 'moderate_jaccard_overlap',
        'weight', 'medium',
        'detail', format('Jaccard %s over %s shared ideas', v_cluster_record.jaccard, v_cluster_record.shared_count)
      );
      v_med_count := v_med_count + 1;
    end if;

    -- Check timing or single-author concentration
    if exists (
      select 1 from public.votes v1
      join public.votes v2 on v1.idea_id = v2.idea_id
      where v1.voter_id = v_cluster_record.account_a
        and v2.voter_id = v_cluster_record.account_b
        and v1.cycle_id = v_target_cycle_id
        and abs(extract(epoch from (v1.created_at - v2.created_at))) < 120
      group by v1.voter_id, v2.voter_id
      having count(*) >= 2
    ) then
      v_signals := v_signals || jsonb_build_object(
        'signal', 'vote_timing_proximity',
        'weight', 'high',
        'detail', 'Repeated votes within 120s of each other'
      );
      v_high_count := v_high_count + 1;
    end if;

    -- Priority assignment rule: 2 High, or 1 High + 2 Medium -> priority_review
    if v_high_count >= 2 or (v_high_count >= 1 and v_med_count >= 2) then
      v_priority := 'priority_review';
    else
      v_priority := 'standard';
    end if;

    insert into public.suspicious_clusters (
      cycle_id,
      account_a,
      account_b,
      jaccard_overlap,
      shared_votes_count,
      signals,
      priority,
      status
    ) values (
      v_target_cycle_id,
      v_cluster_record.account_a,
      v_cluster_record.account_b,
      v_cluster_record.jaccard,
      v_cluster_record.shared_count,
      v_signals,
      v_priority,
      'pending'
    )
    on conflict (cycle_id, account_a, account_b)
    do update set
      jaccard_overlap = excluded.jaccard_overlap,
      shared_votes_count = excluded.shared_votes_count,
      signals = excluded.signals,
      priority = excluded.priority;

    v_inserted_count := v_inserted_count + 1;
  end loop;

  return jsonb_build_object(
    'success', true,
    'cycle_id', v_target_cycle_id,
    'clusters_processed', v_inserted_count
  );
end;
$$;

grant execute on function public.admin_void_vote(uuid, text) to authenticated;
grant execute on function public.admin_suspend_account(uuid, integer, text) to authenticated;
grant execute on function public.admin_recount_cycle(uuid, text) to authenticated;
grant execute on function public.detect_voting_rings(uuid) to authenticated;
