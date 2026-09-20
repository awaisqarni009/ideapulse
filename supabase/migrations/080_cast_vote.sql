-- =====================================================================
-- 080_cast_vote.sql
-- =====================================================================
create or replace function public.cast_vote(p_idea_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_voter        uuid := auth.uid();
  v_idea         public.ideas%rowtype;
  v_cycle        public.cycles%rowtype;
  v_used         integer;
  v_next_slot    timestamptz;
  v_verified     boolean;
  v_vote_id      uuid;
begin
  if v_voter is null then
    raise exception 'IP_UNAUTHENTICATED' using errcode = '42501';
  end if;

  -- Serialize this user's vote writes. Prevents two concurrent requests
  -- from both reading "4 votes used" and both inserting a 5th.
  perform pg_advisory_xact_lock(hashtextextended(v_voter::text, 0));

  if not public.account_is_writable(v_voter) then
    perform public.log_abuse(v_voter, 'unconfirmed_write_attempt', 'IP_ACCOUNT_NOT_WRITABLE',
                             'ideas', p_idea_id);
    raise exception 'IP_ACCOUNT_NOT_WRITABLE' using errcode = 'P0001';
  end if;

  select * into v_idea from public.ideas where id = p_idea_id;
  if not found then
    raise exception 'IP_IDEA_NOT_FOUND' using errcode = 'P0002';
  end if;

  if v_idea.status <> 'published' then
    perform public.log_abuse(v_voter, 'closed_idea_vote_attempt', 'IP_IDEA_CLOSED',
                             'ideas', p_idea_id, jsonb_build_object('status', v_idea.status));
    raise exception 'IP_IDEA_CLOSED' using errcode = 'P0001';
  end if;

  if v_idea.author_id = v_voter then
    perform public.log_abuse(v_voter, 'self_vote_attempt', 'IP_SELF_VOTE', 'ideas', p_idea_id);
    raise exception 'IP_SELF_VOTE' using errcode = 'P0001';
  end if;

  if exists (select 1 from public.votes v
             where v.idea_id = p_idea_id and v.voter_id = v_voter) then
    perform public.log_abuse(v_voter, 'duplicate_vote_attempt', 'IP_DUPLICATE_VOTE',
                             'ideas', p_idea_id);
    raise exception 'IP_DUPLICATE_VOTE' using errcode = 'P0001';
  end if;

  select * into v_cycle from public.cycles where id = public.active_cycle_id();
  if not found then
    raise exception 'IP_NO_ACTIVE_CYCLE' using errcode = 'P0002';
  end if;

  -- Rolling 24h window. Retracted votes still occupy their slot (RULES.md BR-014).
  select count(*) into v_used
  from public.votes v
  where v.voter_id = v_voter
    and v.status in ('active','retracted')
    and v.created_at > now() - interval '24 hours';

  if v_used >= v_cycle.daily_vote_limit then
    select min(v.created_at) + interval '24 hours' into v_next_slot
    from (
      select created_at from public.votes
      where voter_id = v_voter
        and status in ('active','retracted')
        and created_at > now() - interval '24 hours'
      order by created_at asc
      limit 1
    ) v;

    perform public.log_abuse(v_voter, 'vote_quota_exceeded', 'IP_VOTE_QUOTA', 'ideas', p_idea_id,
                             jsonb_build_object('used', v_used, 'limit', v_cycle.daily_vote_limit));
    raise exception 'IP_VOTE_QUOTA:%', v_next_slot using errcode = 'P0001';
  end if;

  v_verified := public.voter_is_verified(v_voter);

  insert into public.votes (idea_id, idea_author_id, voter_id, cycle_id, is_verified)
  values (p_idea_id, v_idea.author_id, v_voter, v_cycle.id, v_verified)
  returning id into v_vote_id;

  update public.profiles
     set last_vote_at = now(), updated_at = now()
   where id = v_voter;

  return jsonb_build_object(
    'vote_id',        v_vote_id,
    'is_verified',    v_verified,
    'votes_used',     v_used + 1,
    'votes_limit',    v_cycle.daily_vote_limit,
    'idea_id',        p_idea_id
  );
end;
$$;

revoke all on function public.cast_vote(uuid) from public;
grant execute on function public.cast_vote(uuid) to authenticated;
