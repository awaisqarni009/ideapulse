-- =====================================================================
-- 085_retract_vote.sql
-- =====================================================================
create or replace function public.retract_vote(p_idea_id uuid)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_voter uuid := auth.uid();
  v_vote  public.votes%rowtype;
begin
  if v_voter is null then
    raise exception 'IP_UNAUTHENTICATED' using errcode = '42501';
  end if;

  select * into v_vote from public.votes
  where idea_id = p_idea_id and voter_id = v_voter and status = 'active';

  if not found then
    raise exception 'IP_VOTE_NOT_FOUND' using errcode = 'P0002';
  end if;

  if v_vote.created_at < now() - interval '10 minutes' then
    raise exception 'IP_RETRACTION_WINDOW_CLOSED' using errcode = 'P0001';
  end if;

  update public.votes
     set status = 'retracted', retracted_at = now()
   where id = v_vote.id;

  -- Quota slot is deliberately NOT refunded.
  return jsonb_build_object('idea_id', p_idea_id, 'quota_refunded', false);
end;
$$;

grant execute on function public.retract_vote(uuid) to authenticated;
